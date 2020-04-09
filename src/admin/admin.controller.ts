import { Controller, Put, Query,  Inject, Get, Post, Body, Req } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private as: AdminService) {}

  @Get('getMyTreatments')
  async getMyTreatments(@Req() req){
    return await this.as.getMyTreatments(req);
  }
  @Post('checkPermissions')
  async checkPermissions(@Req() req){
    return await this.as.checkPermissions(req);
  }
  
  @Post('updateAdmin')
  async updateAdmin(@Body() adminDetails,@Req() req){
    return await this.as.updateAdmin(adminDetails,req);
  }
  
  @Put()
  async setAvailability(
    @Query('dayTimestamp') dayTimestamp: string,
    @Query('available') available: boolean,
  ) {
    return await this.as.setAvailability(dayTimestamp, available);
  }
}
