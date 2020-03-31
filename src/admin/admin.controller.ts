import { Controller, Param, Put, Query, HttpException, HttpStatus, Inject, Get, Post, Body, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Logger } from 'winston';
import { Admin } from './admin.model';

@Controller('admin')
export class AdminController {
  constructor(private as: AdminService, @Inject('winston') private readonly logger: Logger) {}


  @Get('getMyTreatments')
  async getMyTreatments(@Req() req){
    try {
      let res = await this.as.getMyTreatments(req);
      if (res) return res;
      else {
        this.log('error','AdminController -> getMyTreatments() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error',`AdminController -> getMyTreatments() => ${error}`);
      return new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }
  @Post('checkPermissions')
  async checkPermissions(@Body() token: Admin,@Req() req){
    
    try {
      return await this.as.checkPermissions(token,req);
    } catch (error) {
      this.log('error',`AdminController -> permissions() => ${error}`);
      return new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }
  
  
  @Put()
  async setAvailability(
    @Query('dayTimestamp') dayTimestamp: string,
    @Query('available') available: boolean,
  ) {
    try {
      let res = await this.as.setAvailability(dayTimestamp, available);
      if (res) return res;
      else {
        this.log('error','AdminController -> setAvailability() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error',`AdminController -> setAvailability() => ${error}`);
      return new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }
  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
