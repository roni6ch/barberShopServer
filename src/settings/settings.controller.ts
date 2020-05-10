
import { Controller, Get, Req, Post, Body } from "@nestjs/common";
import { SettingsService } from "./settings.service";


@Controller('settings')
export class SettingsController {
  constructor(private settingsService : SettingsService) {
  }
  @Post()
  async getSettingsFromDB(@Body('adminName') adminName: string) : Promise<any>{
    return await this.settingsService.getSettingsFromDB(adminName); 
  }

  @Get('i18n')
  async getI18n() : Promise<any>{
    return await this.settingsService.getI18n(); 
  }
  @Post('i18n')
  async setI18n(@Body('i18n') i18n) : Promise<any>{
    return await this.settingsService.setI18n(i18n); 
  }
}
