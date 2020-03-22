import { DataService } from './data.service';
import { Controller, Get, Post, Body } from "@nestjs/common";

@Controller('data')
export class DataController {
  constructor(private dataService : DataService) {}

  @Get('hours')
  async getData(){
    return await this.dataService.getData(); 
  }
  @Post('sendContact')
  async sendContact(@Body() contact):Promise<boolean>{
    return await this.dataService.sendContact(contact); 
  }
  
}
