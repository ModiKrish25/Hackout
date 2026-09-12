import { api } from '../api/axiosInstance'
import type { User } from '../types'

export interface UpdateUserPayload {
  name?: string
  email?: string
  phone?: string
  password?: string
  locationLat?: number
  locationLng?: number
}

export const userService = {
  /**
   * Fetch profile of currently authenticated user via GET /users/me
   */
  async getMe(): Promise<User> {
    const res = (await api.get('/users/me')) as any
    return res as User
  },

  /**
   * Fetch a single user by their ID
   */
  async getUserById(id: number): Promise<User> {
    const res = (await api.get(`/users/${id}`)) as any
    return res as User
  },

  /**
   * Update user details via PATCH /users/:id
   */
  async updateProfile(id: number, payload: UpdateUserPayload): Promise<User> {
    const res = (await api.patch(`/users/${id}`, payload)) as any
    return res as User
  },

  /**
   * Fetch all registered users
   */
  async getAllUsers(): Promise<User[]> {
    const res = (await api.get('/users')) as any
    return res as User[]
  },

  /**
   * Delete a user by ID
   */
  async deleteUser(id: number): Promise<{ message: string }> {
    const res = (await api.delete(`/users/${id}`)) as any
    return res
  },
}

export default userService
