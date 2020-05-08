import { Injectable, HttpStatus, HttpException, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Settings } from './settings.model';
import { Model } from 'mongoose';
import { Auth } from 'src/auth/auth.model';

@Injectable()
export class SettingsService {
  settings : Settings = null;
  public adminName = "";
  constructor(
    @InjectModel('Settings') private readonly sm: Model<Settings>,
    @Inject('winston') private readonly logger: Logger,
  ) {
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
  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
