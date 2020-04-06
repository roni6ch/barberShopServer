import { Controller, Param, Put, Query, HttpException, HttpStatus, Inject, Get, Post, Body, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { Logger } from 'winston';

@Controller('users')
export class UsersController {
  constructor(private us: UsersService, @Inject('winston') private readonly logger: Logger) {}

  @Post('register')
  async register(@Body('username') username: string,@Body('password') password: string,@Req() req){
    let host = req.headers.host.split(":")[0];
    req.body.host = host;
    return await this.us.register(username,password,req);
  }

  @Post('validateUser')
  async validateUser(@Body('username') username: string,@Body('password') password: string,@Req() req) {
    let host = req.headers.host.split(":")[0];
    req.body.host = host;
    return await this.us.validateUser(username,password,req);
  }
  @Post('validateGoogleUser')
  async validateGoogleUser(@Body('username') username: string,@Req() req) {
    let host = req.headers.host.split(":")[0];
    req.body.host = host;
    return await this.us.validateGoogleUser(username,req);
  }
  @Post('generateToken')
  async generateToken(@Body('username') username: string,@Body('password') password: string) {
    return await this.us.generateToken(username,password);
  }
  @Post('forgotPassword')
  async forgotPassword(@Body('username') username: string,@Req() req) {
    let host = req.headers.host.split(":")[0];
    req.body.host = host;
    return await this.us.forgotPassword(username,req);
  }
  @Post('changePassword')
  async changePassword(@Req() req) {
    let host = req.headers.host.split(":")[0];
    req.body.host = host;
    return await this.us.changePassword(req);
  }
  
  
  

  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
