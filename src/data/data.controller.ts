import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { DataService } from './data.service';
import { Logger } from 'winston';

@Controller('data')
export class DataController {
  constructor(
    private dataService: DataService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Get()
  async getData() {
    try {
      let res = await this.dataService.getData();
      if (res) return res;
      else {
        this.log('error','DataController -> getData() in -> else res');
      }
    } catch (error) {
      this.log('error',`DataController -> getData() => ${error}`);
    }
  }
  @Post('sendContact')
  async sendContact(@Body() contact): Promise<boolean> {
    try {
      let res = await this.dataService.sendContact(contact);
      if (res) return res;
      else {
        this.log('error','DataController -> sendContact() in -> else res');
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
