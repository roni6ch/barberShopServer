import { Controller, Param, Put, Query } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private as: AdminService) {}

  @Put()
  async setAvailability(
    @Query('dayTimestamp') dayTimestamp: string,
    @Query('available') available: boolean,
  ) {
    return await this.as.setAvailability(dayTimestamp, available);
  }
}
