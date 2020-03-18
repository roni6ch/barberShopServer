import { Injectable, Res, HttpStatus, Get } from '@nestjs/common';
import * as SETTINGS from './settings.json';
import { Response } from 'express';

@Injectable()
export class SettingsService {
@Get()
getSettings(@Res() res: Response): any {
  res.status(HttpStatus.OK).json(SETTINGS);
}
  constructor() {}
}
