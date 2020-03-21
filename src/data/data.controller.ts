import { DataService } from './data.service';
import { Controller, Get, Post, Body } from "@nestjs/common";

@Controller('data')
export class DataController {
  constructor(private dataService : DataService) {}

  @Get('hours')
  getData(): any{
    return this.dataService.getData(); 
  }
  @Post('sendContact')
  sendContact(@Body() contact): any{
    return this.dataService.sendContact(contact); 
  }
  
}
