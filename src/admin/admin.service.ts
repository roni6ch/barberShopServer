import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { constants } from 'src/constants';
import { Data } from 'src/data/data.model';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import { Customer } from 'src/customers/customer.model';
import { SettingsService } from 'src/settings/settings.service';
import { Settings } from 'src/settings/settings.model';
import { Auth } from 'src/auth/auth.model';
import * as moment from 'moment';
const fs = require('fs');


var cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: constants.cloudinary.cloudName,
  api_key: constants.cloudinary.apiKey,
  api_secret: constants.cloudinary.apiSecret,
});

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('Settings') private readonly sm: Model<Settings>,
    @InjectModel('Auth') private readonly am: Model<Auth>,
    @InjectModel('Customer') private readonly cm: Model<Customer>,
    @InjectModel('Data') private readonly dm: Model<Data>,
    @Inject('winston') private readonly logger: Logger,
    private s: SettingsService,
  ) {}

  async uploadImages(file, req) {
    //Thanks to Leonied!!!
    console.log('file',file);
    let settings = await this.s.getSettings();
    let ownerMail = settings.owner.mail;
   await cloudinary.uploader.upload(file.path,{ folder: ownerMail,resource_type: "image", public_id: file.originalname.split(".")[0] })
    .then(async (image) => {
      console.log('image uploaded to cloudinary!!! ');
      console.log(image);
      //add it to admin db
      await this.s.setUserImages({...image,name: file.originalname},req);

      //remove local image from server
      fs.unlink(file.path, (err) => {
        if (err) throw err;
      });

      return image;
    })
    .catch( (err) =>{
      console.log("** File Upload (Promise)");
      if (err) { console.warn(err); }
      return err;
    });

  }

  async deleteImage(id, req){
    let settings = await this.s.getSettings();
    let ownerMail = settings.owner.mail;
    await cloudinary.uploader.destroy(ownerMail + '/' + id.split(".")[0], async (result) => {
      await this.s.removeUserImage(id,req);
      return true;
    }).catch((err) => {
      console.log("** File deleteImage");
      if (err) { console.warn(err); }
      return err;
    });;
  }

  async getMyTreatments(req) {
    let host = this.s.adminName;
    try {
      let res = await this.cm.find({
        host,
        date: {
          $gte: +moment()
            .subtract(1, 'days')
            .endOf('day'),
        },
      });
      if (res) return res;
      else {
        this.log('error', 'AdminService -> getMyTreatments() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `AdminService -> getMyTreatments() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }

  async checkPermissions(req) {
    try {
      let res = await this.s.getSettings();
      if (res)
        if (
          req.body.username.toLowerCase() === res.owner.mail.toLowerCase()
        ) {
          let res = await this.am.find({ username: req.body.username });
          if (res.length > 0) return true;
          else {
            this.log(
              'error',
              'AdminService -> checkPermissions() in -> else res',
            );
            return false;
          }
        } else {
          return false; //not an admin
        }
    } catch (error) {
      this.log('error', `AdminService -> checkPermissions() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }


  async checkHostPermissions(req){
    try {
          let res = await this.am.find({ username: req.body.username , host: this.s.adminName });
          if (res.length > 0) return true;
          else {
            this.log(
              'error',
              'SettingsService -> checkHostPermissions() in -> else res',
            );
            return false;
          }
    } catch (error) {
      this.log('error', `SettingsService -> checkHostPermissions() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }

  async setAvailability(dayTimestamp: string, available: boolean) {
    const filter = { dayTimestamp };
    const update = { available };
    try {
      let res = await this.dm.findOneAndUpdate(filter, update);
      if (res) return true;
      else {
        this.log('error', 'AdminService -> findOneAndUpdate() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `AdminService -> findOneAndUpdate() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    } 
  }


  async updateAdmin(adminDetails, req) {
    let host = this.s.adminName;
    try {
      let result = await this.sm
        .findOneAndUpdate(
          { 'owner.website': host },
          {
            'owner.location': adminDetails.location,
            'owner.phone': adminDetails.phone,
            'calendar.timeSpacing': adminDetails.timeSpacing,
            'calendar.showPrices': adminDetails.showPrices,
            'calendar.showTimes': adminDetails.showTimes,
            'calendar.calendarSize': adminDetails.calendarSize,
            'calendar.days': adminDetails.days,
            'calendar.daysOff': adminDetails.daysOff,
            'calendar.slides': adminDetails.slides,
            personals: adminDetails.personals,
            galleryDisplay: adminDetails.galleryDisplay,
          },
        )
        .exec();
      if (result) {
        //this.s.settings = null;
        return result;
      } else {
        this.log('error', 'DataService -> updateAdmin() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `DataService -> updateAdmin() => ${error}`);
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
