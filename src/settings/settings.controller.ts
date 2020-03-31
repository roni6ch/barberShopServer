
import { Controller, Get, Post, Body, Res, Req } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { Response } from 'express';


@Controller('settings')
export class SettingsController {
  constructor(private settingsService : SettingsService) {}

  @Get()
  getSettings(@Res() res: Response,@Req() req): any{
    return this.settingsService.getSettings(res,req); 
  }
}
