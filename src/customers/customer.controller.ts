import { CustomersService } from './customers.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Customer } from './customer.model';
import { DataService } from 'src/data/data.service';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

@Controller('customers')
export class CustomerController {
  constructor(
    private cs: CustomersService,
    private ds: DataService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Delete('deleteAllDocuments')
  async deleteAllDocuments(): Promise<boolean> {
    try {
      if (await this.ds.deleteAllDocuments()) {
        try {
          let res = await this.cs.deleteAllDocuments();
          if (res) {
            return res;
          }
          else {
            this.log('error','CustomerController -> cs deleteAllDocuments() in -> else res');
            return false;
          }
        } catch (error) {
          this.log(
            'error',
            `CustomerController -> cs deleteAllDocuments() => ${error}`,
          );
          throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
        }
      }else{
        this.log('error','CustomerController -> ds deleteAllDocuments() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `CustomerController -> ds deleteAllDocuments() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  @Post()
  async addTreatment(@Body() customer: Customer): Promise<boolean> {
    try {
      let res = await this.ds.setHour(customer);
      if (res) {
        try {
          let res = await this.cs.addTreatment(customer);
          if (res) return res;
          else {
            this.log('error','CustomerController -> addTreatment() in -> else res');
            return false;
          }
        } catch (error) {
          this.log('error',`CustomerController -> addTreatment() => ${error}`);
          throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
        }
      }
      else {
        this.log('error','CustomerController -> setHour() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error',`CustomerController -> setHour() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }
  @Post('deleteTreatment')
  async deleteTreatment(@Body() customer: Customer): Promise<any> {
    try {
      let res = await this.ds.deleteHour(customer);
      if (res) {
        try {
          let res = await this.cs.deleteTreatment(customer);
          if (res) return res;
          else {
            this.log('error','CustomerController -> deleteTreatment() in -> else res');
            return false;
          }
        } catch (error) {
          this.log('error',`CustomerController -> deleteTreatment() => ${error}`);
          throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
        }
      }
      else {
        this.log('error','CustomerController -> deleteHour() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error',`CustomerController -> deleteHour() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
