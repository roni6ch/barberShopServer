import { Controller, Put, Query,  Inject, Get, Post, Body, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AdminService } from './admin.service';
import { FileInterceptor } from '@nestjs/platform-express';

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
  
  @Post('uploadImages')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImages(@UploadedFile() file,@Req() req){
    return await this.as.uploadImages(file,req);
  }

  @Put()
  async setAvailability(
    @Query('dayTimestamp') dayTimestamp: string,
    @Query('available') available: boolean,
  ) {
    return await this.as.setAvailability(dayTimestamp, available);
  }
}
