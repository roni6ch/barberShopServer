import { Injectable, HttpStatus, HttpException, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Settings } from './settings.model';
import { Model } from 'mongoose';

@Injectable()
export class SettingsService {
  settings : Settings = null;
  constructor(
    @InjectModel('Settings') private readonly sm: Model<Settings>,
    @Inject('winston') private readonly logger: Logger,
  ) {
  }

  async getSettingsFromDB(req) {
    if (this.settings !== null){
      return this.settings;
    }
    let host = req.headers.origin;
    try {
      let res = await this.sm.findOne({ 'owner.website' : host }).exec();
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
    let host = req.headers.origin;
    try {
      let res = await this.sm.findOneAndUpdate({ 'owner.website': host } , { $push: { gallery: {id: imageObj.name.split(".")[0].trim(),url:imageObj.secure_url} } }, {new: true}).exec();
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
    let host = req.headers.origin;
    try {
      let res = await this.sm.findOneAndUpdate({ 'owner.website': host } , { $pull: { gallery: {id : id.split(".")[0].trim()} } }).exec();
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
