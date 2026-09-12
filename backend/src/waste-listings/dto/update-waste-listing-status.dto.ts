import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WasteListingStatus } from '../../common/enums/waste-listing-status.enum';

export class UpdateWasteListingStatusDto {
    @ApiProperty({
        description: 'New status for the waste listing',
        enum: WasteListingStatus,
        example: WasteListingStatus.MATCHED,
    })
    @IsEnum(WasteListingStatus)
    @IsNotEmpty()
    status: WasteListingStatus;
}
