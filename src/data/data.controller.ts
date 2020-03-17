import { DataService } from './data.service';
import { Controller, Get, Post, Body } from "@nestjs/common";

@Controller('hours')
export class DataController {
  constructor(private dataService : DataService) {}

  @Get()
  getData(): any{
    return this.dataService.getData(); 
  }
  @Post()
  async addData(
      @Body('dayTimestamp') dayTimestamp: string,
      @Body('available') available: boolean,
  ): Promise<boolean>{
    return await this.dataService.setAvailability(dayTimestamp,available); 
  }
}
