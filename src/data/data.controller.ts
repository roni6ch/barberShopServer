import { Controller, Get, Post, Body, Inject, Req, Delete } from '@nestjs/common';
import { DataService } from './data.service';
import { Logger } from 'winston';
import * as moment from 'moment';
import { CustomersService } from 'src/customers/customers.service';

@Controller('data')
export class DataController {
  constructor(
    private dataService: DataService,
    private customerService: CustomersService,
    @Inject('winston') private readonly logger: Logger,
  ) {
  }

  @Get()
  async getData(@Req() req) {
    try {
      let res = await this.dataService.getData(req);
      if (res) return res;
      else {
        this.log('error','DataController -> getData() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error',`DataController -> getData() => ${error}`);
    }
  }
  @Post('sendContact')
  async sendContact(@Body() contact,@Req() req){
    try {
      let res = await this.dataService.sendContact(contact,req);
      if (res) return res;
      else {
        this.log('error','DataController -> sendContact() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error',`DataController -> sendContact() => ${error}`);
    }
  }
  @Post('updateAdmin')
  async updateAdmin(@Body() adminDetails,@Req() req){
    try {
      let res = await this.dataService.updateAdmin(adminDetails,req);
      if (res) return true;
      else {
        this.log('error','DataController -> updateAdmin() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error',`DataController -> updateAdmin() => ${error}`);
    }
  }
  
  @Get('userDetails')
  async userDetails(@Req() req) {
    return await this.dataService.userDetails(req);
  }


  @Delete('deleteOldMonthsFromDB')
  async deleteOldMonthsFromDB() {
    const oldMonths = +moment().subtract(2,'months').endOf('month');
    await this.dataService.deleteOldDocuments(oldMonths);
    await this.customerService.deleteOldDocuments(oldMonths);
    return true;
  }

  log(type,data){
    console.error(data);
    this.logger.log(type, data);
  }
}
