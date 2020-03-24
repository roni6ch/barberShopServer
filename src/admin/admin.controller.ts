import { Controller, Param, Put, Query, HttpException, HttpStatus, Inject, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Logger } from 'winston';

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
        throw new HttpException('BadRequest', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      this.log('error',`CustomerController -> getMyTreatments() => ${error}`);
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
        throw new HttpException('BadRequest', HttpStatus.BAD_REQUEST);
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
