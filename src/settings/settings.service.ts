import { Injectable, Res, HttpStatus, Get, Req } from '@nestjs/common';
import * as SETTINGS from './settings.json';
import { Response } from 'express';

@Injectable()
export class SettingsService {
@Get()
getSettings(@Res() res: Response,@Req() req): any {
  let host = req.body.host;
  let owner = SETTINGS.owners.filter((v,i)=>{
    return v.calendar.website === host;
  });
  
  if (owner.length > 0){
    res.status(HttpStatus.OK).json(owner[0]);
  }
  else{
    res.status(HttpStatus.FORBIDDEN);
  }
}
  constructor() {}
}
