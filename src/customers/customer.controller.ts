import { CustomersService } from './customers.service';
import { Controller, Get, Post, Body, Put, Query , Delete, Param } from '@nestjs/common';
import { Customer } from './customer.model';
import { DataService } from 'src/data/data.service';

@Controller('customers')
export class CustomerController {
  constructor(private cs: CustomersService, private ds: DataService) {}
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
}
