import math
from typing import List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from ortools.constraint_solver import pywrapcp, routing_enums_pb2

app = FastAPI(
    title="Route Optimizer Microservice",
    description="Stateless TSP route optimization service using Google OR-Tools",
    version="1.0.0",
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic Models ---

class Depot(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0, description="Latitude between -90 and 90")
    lng: float = Field(..., ge=-180.0, le=180.0, description="Longitude between -180 and 180")


class Stop(BaseModel):
    id: int = Field(..., description="Unique identifier of the stop / waste listing")
    lat: float = Field(..., ge=-90.0, le=90.0, description="Latitude between -90 and 90")
    lng: float = Field(..., ge=-180.0, le=180.0, description="Longitude between -180 and 180")


class OptimizeRouteRequest(BaseModel):
    depot: Depot
    stops: List[Stop]


class OptimizeRouteResponse(BaseModel):
    orderedStopIds: List[int]
    totalDistanceKm: float


class HealthResponse(BaseModel):
    status: str


# --- Helper: Haversine Distance (km) ---

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates straight-line great-circle distance in kilometers."""
    R = 6371.0  # Earth's mean radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


# --- Core: OR-Tools TSP Solver ---

def solve_tsp(depot: Depot, stops: List[Stop]) -> OptimizeRouteResponse:
    """Solves the Traveling Salesman Problem starting and ending at the depot."""
    # List of all locations where index 0 is the depot, and 1..N are stops
    points = [{"lat": depot.lat, "lng": depot.lng}] + [
        {"lat": s.lat, "lng": s.lng} for s in stops
    ]
    num_locations = len(points)

    # Build Distance Matrix (in meters for precision with integer solver)
    distance_matrix = []
    for i in range(num_locations):
        row = []
        for j in range(num_locations):
            if i == j:
                row.append(0)
            else:
                dist_km = haversine_distance_km(
                    points[i]["lat"], points[i]["lng"], points[j]["lat"], points[j]["lng"]
                )
                row.append(int(dist_km * 1000.0))  # Convert to meters
        distance_matrix.append(row)

    # Create Routing Index Manager: N locations, 1 vehicle, depot index 0
    manager = pywrapcp.RoutingIndexManager(num_locations, 1, 0)
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index: int, to_index: int) -> int:
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Search parameters
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )

    # Solve
    solution = routing.SolveWithParameters(search_parameters)

    if not solution:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to find an optimal route for the provided coordinates.",
        )

    # Extract optimal route order and total distance
    index = routing.Start(0)
    ordered_stop_ids: List[int] = []
    total_distance_meters = 0

    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)
        if node != 0:  # Skip depot node in stop sequence
            ordered_stop_ids.append(stops[node - 1].id)

        previous_index = index
        index = solution.Value(routing.NextVar(index))
        total_distance_meters += routing.GetArcCostForVehicle(previous_index, index, 0)

    total_distance_km = round(total_distance_meters / 1000.0, 2)

    return OptimizeRouteResponse(
        orderedStopIds=ordered_stop_ids,
        totalDistanceKm=total_distance_km,
    )


# --- Endpoints ---

@app.get("/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint for NestJS and monitor services."""
    return {"status": "ok"}


@app.post("/optimize-route", response_model=OptimizeRouteResponse)
def optimize_route(request: OptimizeRouteRequest):
    """
    Optimizes the pickup route for a single vehicle starting and ending at the depot.
    Returns ordered stop IDs and total distance in kilometers.
    """
    # Edge Case 1: Empty stops list
    if not request.stops:
        return OptimizeRouteResponse(orderedStopIds=[], totalDistanceKm=0.0)

    # Edge Case 2: Single stop (skip solver)
    if len(request.stops) == 1:
        single_stop = request.stops[0]
        round_trip_km = (
            haversine_distance_km(
                request.depot.lat, request.depot.lng, single_stop.lat, single_stop.lng
            )
            * 2.0
        )
        return OptimizeRouteResponse(
            orderedStopIds=[single_stop.id],
            totalDistanceKm=round(round_trip_km, 2),
        )

    # Multi-stop Traveling Salesman Problem (OR-Tools)
    return solve_tsp(request.depot, request.stops)
