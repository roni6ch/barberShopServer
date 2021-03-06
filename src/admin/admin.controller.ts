import { Controller, Put, Query,  Inject, Get, Post, Body, Req, UploadedFile, UseInterceptors, Res, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';
import { FileInterceptor } from '@nestjs/platform-express';
var multer  = require('multer');

var upload = multer({ storage: storage })

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './upload')
  },
  filename: function (req, file, cb) {
    cb(null, "image-" + +new Date() + file.originalname)
  }
})

@Controller('admin')
export class AdminController {
  constructor(private as: AdminService) {}

  @Get('getMyTreatments')
  async getMyTreatments(@Req() req){
    return await this.as.getMyTreatments(req);
  }
  @Get('getStatistics')
  async getStatistics(@Req() req){
    return await this.as.getStatistics(req);
  }
  
  @Get('getAllCustomers')
  async getAllCustomers(@Req() req){
    return await this.as.getAllCustomers(req);
  }
  @Post('editCardInfo')
  async editCardInfo(@Body() card){
    return await this.as.editCardInfo(card);
  }
  
  
  @Post('checkPermissions')
  async checkPermissions(@Req() req){
    return await this.as.checkPermissions(req);
  }

  @Post('createNewAdmin')
  async createNewAdmin(@Body() admin){
    return await this.as.createNewAdmin(admin);
  }
  
  @Post('checkHostPermissions')
  async checkHostPermissions(@Req() req) : Promise<any>{
    return await this.as.checkHostPermissions(req); 
  }
  
  @Post('updateAdmin')
  async updateAdmin(@Body() adminDetails,@Req() req){
    return await this.as.updateAdmin(adminDetails,req);
  }
  
  @Post('uploadImages')
  @UseInterceptors(
    //FileInterceptor('image')
    FileInterceptor('image', {
      storage: multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, './upload')
        },
        filename: function (req, file, cb) {
          cb(null, +new Date() +  "-" + file.originalname)
        }
      })
    })
  )
  async uploadImages(@UploadedFile() file,@Req() req){
     await upload.single(file);
     return await this.as.uploadImages(file,req);
  }

  @Post('deleteImage')
  async deleteImage(@Body('id') id: string,@Req() req){
    return await this.as.deleteImage(id,req);
 }


 @Post('uploadLogo')
 @UseInterceptors(
   FileInterceptor('image', {
     storage: multer.diskStorage({
       destination: function (req, file, cb) {
         cb(null, './upload')
       },
       filename: function (req, file, cb) {
         cb(null, file.originalname)
       }
     })
   })
 )
 async uploadLogo(@UploadedFile() file,@Req() req){
    await upload.single(file);
    return await this.as.uploadLogo(file,req);
 }


 
 @Post('uploadBG')
 @UseInterceptors(
   FileInterceptor('image', {
     storage: multer.diskStorage({
       destination: function (req, file, cb) {
         cb(null, './upload')
       },
       filename: function (req, file, cb) {
         cb(null, file.originalname)
       }
     })
   })
 )
 async uploadBG(@UploadedFile() file,@Req() req){
    await upload.single(file);
    return await this.as.uploadBG(file,req);
 }




 
 @Delete('deleteLogo')
  async deleteLogo(){
    return await this.as.deleteLogo();
 }
 @Delete('deleteBG')
  async deleteBG(){
    return await this.as.deleteBG();
 }
 

  

  @Put()
  async setAvailability(
    @Query('dayTimestamp') dayTimestamp: string,
    @Query('available') available: boolean,
  ) {
    return await this.as.setAvailability(dayTimestamp, available);
  }
}
