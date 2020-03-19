import { DataService } from './data.service';
import { Controller, Get, Post, Body } from "@nestjs/common";

@Controller('hours')
export class DataController {
  constructor(private dataService : DataService) {}

  @Get()
  getData(): any{
    return this.dataService.getData(); 
  }
  
}
