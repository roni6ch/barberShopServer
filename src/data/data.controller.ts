import { Controller, Get, Post, Body, Req, Delete } from '@nestjs/common';
import { DataService } from './data.service';
import { CustomersService } from 'src/customers/customers.service';
import * as moment from 'moment';

@Controller('data')
export class DataController {
  constructor(
    private ds: DataService,
    private cs: CustomersService
  ) {}

  @Get()
  async getData(@Req() req) {
    return await this.ds.getData(req);
  }
  
  @Get('getHolidays')
  async getHolidays(@Req() req) {
    return await this.ds.getHolidays(req);
  }
  @Post('sendContact')
  async sendContact(@Body() contact,@Req() req){
    return await this.ds.sendContact(contact,req);
  }
  
  @Get('userDetails')
  async userDetails(@Req() req) {
    return await this.ds.userDetails(req);
  }

  @Delete('deleteOldMonthsFromDB')
  async deleteOldMonthsFromDB() {
    const oldMonths = +moment().subtract(2,'months').endOf('month');
    await this.ds.deleteOldDocuments(oldMonths);
    await this.cs.deleteOldDocuments(oldMonths);
    return true;
  }
}
