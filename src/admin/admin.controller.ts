import { Controller, Param, Put, Query, HttpException, HttpStatus, Inject, Get, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Logger } from 'winston';
import { Admin } from './admin.model';

@Controller('admin')
export class AdminController {
  constructor(private as: AdminService, @Inject('winston') private readonly logger: Logger) {}


  @Get('getMyTreatments')
  async getMyTreatments(): Promise<boolean> {
    try {
      let res = await this.as.getMyTreatments();
      if (res) return res;
      else {
        this.log('error','CustomerController -> getMyTreatments() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error',`CustomerController -> getMyTreatments() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }
  @Post('checkPermissions')
  async checkPermissions(@Body() token: Admin): Promise<boolean> {
    try {
      let res = await this.as.checkPermissions(token);
      if (res) return res;
      else {
        this.log('error','CustomerController -> permissions() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error',`CustomerController -> permissions() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
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
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }
  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
