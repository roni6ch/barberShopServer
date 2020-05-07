
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
}
