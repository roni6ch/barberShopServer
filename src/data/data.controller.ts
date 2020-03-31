import { Controller, Get, Post, Body, Inject, Req } from '@nestjs/common';
import { DataService } from './data.service';
import { Logger } from 'winston';

@Controller('data')
export class DataController {
  constructor(
    private dataService: DataService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

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

  log(type,data){
    console.error(data);
    this.logger.log(type, data);
  }
}
