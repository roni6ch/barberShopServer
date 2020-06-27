
import { Controller, Get, Req, Post, Body } from "@nestjs/common";
import { LpService } from "./lp.service";


@Controller('lp')
export class LpController {
  constructor(private lpService : LpService) {
  }
  @Get('getI18n')
  async getI18n() : Promise<any>{
    console.log('getI18n');
    return await this.lpService.getI18n(); 
  }
}
