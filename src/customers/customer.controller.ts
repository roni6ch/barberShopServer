import { CustomersService } from './customers.service';
import { Controller, Get, Post, Body, Delete, Req } from '@nestjs/common';
import { Customer } from './customer.model';
import { DataService } from 'src/data/data.service';

@Controller('customers')
export class CustomerController {
  constructor(private cs: CustomersService, private ds: DataService) {}
  @Post()
  async addTreatment(@Body() customer: Customer, @Req() req): Promise<boolean> {
    if (await this.ds.setHour(customer, req))
      return await this.cs.addTreatment(customer, req);
  }
  @Post('editTreatment')
  async editTreatment(@Body() customer: Customer, @Req() req): Promise<boolean> {
    if (await this.ds.setHour(customer, req))
      return await this.cs.editTreatment(customer, req);
  }
  @Post('deleteTreatment')
  async deleteTreatment(@Body() customer: Customer, @Req() req): Promise<any> {
    if (await this.ds.deleteHour(customer, req))
      return await this.cs.deleteTreatment(customer, req);
  }
  @Get('userTreatments')
  async userTreatments(@Req() req): Promise<any> {
    return await this.cs.userTreatments(req);
  }
  @Get('userTreatmentsOld')
  async userTreatmentsOld(@Req() req): Promise<any> {
    return await this.cs.userTreatmentsOld(req);
  }
  @Post('adminSearchTreatmentsOld')
  async adminSearchTreatmentsOld(
    @Body('param') param: string,
    @Req() req,
  ): Promise<any> {
    return await this.cs.adminSearchTreatmentsOld(param.toLowerCase(), req);
  }
  @Delete('deleteAllDocuments')
  async deleteAllDocuments(): Promise<boolean> {
    if (await this.ds.deleteAllDocuments())
      return await this.cs.deleteAllDocuments();
  }
}
