import { CustomersService } from './customers.service';
import { Controller, Get, Post, Body, Put, Query , Delete, Param } from '@nestjs/common';
import { Customer } from './customer.model';
import { DataService } from 'src/data/data.service';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

@Controller('customers')
export class CustomerController {
  constructor(private cs: CustomersService, private ds: DataService,
    @Inject('winston') private readonly logger: Logger) {}
    
  @Delete('deleteAllDocuments')
  async deleteAllDocuments(): Promise<boolean> {
    await this.ds.deleteAllDocuments();
    return await this.cs.deleteAllDocuments();
  }
  @Get('getMyTreatments')
  async getMyTreatments(): Promise<boolean> {
    return await this.cs.getMyTreatments();
  }
  
  @Post()
  async addTreatment(@Body() customer: Customer): Promise<boolean> {
    await this.ds.setHour(customer);
    return await this.cs.addTreatment(customer);
  }
  @Post('deleteTreatment')
  async deleteTreatment(@Body() customer: Customer): Promise<any> {
    await this.ds.deleteHour(customer);
    return await this.cs.deleteTreatment(customer);
  }

  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
