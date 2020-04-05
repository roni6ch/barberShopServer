
import { Controller, Get, Req } from "@nestjs/common";
import { SettingsService } from "./settings.service";


@Controller('settings')
export class SettingsController {
  constructor(private settingsService : SettingsService) {
  }
  @Get()
  async getSettingsFromDB(@Req() req) : Promise<any>{
    return await this.settingsService.getSettingsFromDB(req); 
  }
}
