
import { Controller, Get, Req, Post, Body, UploadedFile, UseInterceptors } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { FileInterceptor } from "@nestjs/platform-express/multer";

import * as  multer from 'multer';
var upload = multer({ storage: storage })

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './upload')
  },
  filename: function (req, file, cb) {
    const now = new Date();
    cb(null,file.originalname)
  }
})

@Controller('settings')
export class SettingsController {
  constructor(private settingsService : SettingsService) {
  }

  @Get('uploadFile')
  @UseInterceptors(FileInterceptor('file', {storage}))
  async uploadFile(@UploadedFile() file){
    console.log(file);
    await upload.single(file);
    await this.settingsService.uploadFile(file);
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
