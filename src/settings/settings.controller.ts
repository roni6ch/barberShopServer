
import { Controller, Get, Post, Body, Res, Req } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { Response } from 'express';


@Controller('settings')
export class SettingsController {
  constructor(private settingsService : SettingsService) {
  }

  @Get()
  async getSettings(@Res() res: Response,@Req() req){
    //no longer activated - nor settings.json
    return await this.settingsService.getSettings(res,req); 
  }
  @Get('getSettingsFromDB')
  async getSettingsFromDB(@Req() req) : Promise<any>{
    return await this.settingsService.getSettingsFromDB(req); 
  }
}
