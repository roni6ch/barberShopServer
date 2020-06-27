import { Injectable, HttpStatus, HttpException, Logger, Inject, UseInterceptors, UploadedFile } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Settings } from './settings.model';
import { constants } from 'src/constants';
import { Model } from 'mongoose';
import { Auth } from 'src/auth/auth.model';
const fs = require('fs');

var cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: constants.cloudinary.cloudName,
  api_key: constants.cloudinary.apiKey,
  api_secret: constants.cloudinary.apiSecret,
});



@Injectable()
export class SettingsService {
  settings : Settings = null;
  public adminName = "";
  constructor(
    @InjectModel('Settings') private readonly sm: Model<Settings>,
    @Inject('winston') private readonly logger: Logger,
  ) {
    //86400000 one day
    //setInterval(()=> this.backup(),+constants.backUpTime);
  }
  async backup(){
    //backup every day mongoDB
    let now = new Date().formattedDate();
    let settings = await this.sm.find().exec();
     await fs.writeFile(`files/settings_${now}.txt`, JSON.stringify(settings), (err) => {
      if (err) return;
    }
  );
    await fs.readFile(`files/settings_${now}.txt`, async (err, file) => {
        if (err) {
            throw err;
        }
        this.uploadFile(file);
    });
  }

  
 async uploadFile(@UploadedFile() file){
   return await cloudinary.uploader.upload(file.path, {
    folder: 'backups',
    resource_type: 'file',
    public_id: file.originalname.split('.')[0],
  }).then(async file => {
    //remove local image from server
    fs.unlink(file.path, err => {
      if (err) throw err;
    });
    return true;
  })
  .catch(err => {
    if (err) {
      console.warn(err);
    }
    return err;
  });
 }



  getSettings(){
    if (this.settings !== null){
      return this.settings;
    }
  }
  async getSettingsFromDB(adminName) {
    this.adminName = adminName;
    try {
      let res = await this.sm.findOne({ 'owner.website' : adminName }).exec();
      if (res) {this.settings = res;
        return res;}
      else {
        this.log('error', 'SettingsService -> getData() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `SettingsService -> getData() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }


  async setUserImages(imageObj,req){
    try {
      let res = await this.sm.findOneAndUpdate({ 'owner.website': this.adminName } , { $push: { gallery: {id: imageObj.name.split(".")[0].trim(),url:imageObj.secure_url} } }, {new: true}).exec();
      if (res) {
        this.settings.gallery = res.gallery;
        return true;
      }
      else {
        this.log('error', 'SettingsService -> setUserImages() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `SettingsService -> setUserImages() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }
  async removeUserImage(id,req){
    try {
      let res = await this.sm.findOneAndUpdate({ 'owner.website': this.adminName } , { $pull: { gallery: {id : id.split(".")[0].trim()} } }).exec();
      if (res) {return res;}
      else {
        this.log('error', 'SettingsService -> removeUserImage() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `SettingsService -> removeUserImage() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }

  async setUserLogo(imageObj,req){
    try {
      let res = await this.sm.findOneAndUpdate({ 'owner.website': this.adminName }, {"owner.logo" : imageObj.secure_url}).exec();
      if (res) {  return true;}
      else {
        this.log('error', 'SettingsService -> setUserImages() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `SettingsService -> setUserImages() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }
  async setUserBG(imageObj,req){
    try {
      let res = await this.sm.findOneAndUpdate({ 'owner.website': this.adminName }, {"owner.BG" : imageObj.secure_url}).exec();
      if (res) {  return true;}
      else {
        this.log('error', 'SettingsService -> setUserImages() in -> else res');
        return false; 
      }
    } catch (error) {
      this.log('error', `SettingsService -> setUserImages() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }
  

  async removeUserLogo(){
    try {
      let res = await this.sm.findOneAndUpdate({ 'owner.website': this.adminName } , {"owner.logo" : ""}).exec();
      if (res) {return true;}
      else {
        this.log('error', 'SettingsService -> removeUserLogo() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `SettingsService -> removeUserLogo() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }

  async removeUserBG(){
    try {
      let res = await this.sm.findOneAndUpdate({ 'owner.website': this.adminName } , {"owner.BG" : ""}).exec();
      if (res) {return true;}
      else {
        this.log('error', 'SettingsService -> removeUserBG() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `SettingsService -> removeUserBG() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }
  

  async getI18n(){
    try {
      let res = await this.sm.findOne({ 'owner.website': this.adminName },'i18n').exec();
      if (res.i18n) {return res.i18n;}
    } catch (error) {
      this.log('error', `SettingsService -> getI18n() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }
  async setI18n(i18n){
    try {
      let res = await this.sm.findOneAndUpdate({ 'owner.website': this.adminName }, { $set: {i18n} } ).exec();
      if (res) {return true;}
    } catch (error) {
      this.log('error', `SettingsService -> setI18n() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }
  
  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}

