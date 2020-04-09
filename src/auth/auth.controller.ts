import { Controller, Param, Put, Query, HttpException, HttpStatus, Inject, Get, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Logger } from 'winston';

@Controller('auth')
export class AuthController {
  constructor(private us: AuthService, @Inject('winston') private readonly logger: Logger) {}

  @Post('register')
  async register(@Body('username') username: string,@Body('password') password: string,@Req() req){
    req.body.host = req.headers.host.split(":")[0];
    return await this.us.register(username,password,req);
  }

  @Post('validateUser')
  async validateUser(@Body('username') username: string,@Body('password') password: string,@Req() req) {
    req.body.host = req.headers.host.split(":")[0];
    return await this.us.validateUser(username,password,req);
  }
  @Post('validateGoogleUser')
  async validateGoogleUser(@Body('username') username: string,@Req() req) {
    req.body.host = req.headers.host.split(":")[0];
    return await this.us.validateGoogleUser(username,req);
  }
  @Post('generateToken')
  async generateToken(@Body('username') username: string,@Body('password') password: string) {
    return await this.us.generateToken(username,password);
  }
  @Post('forgotPassword')
  async forgotPassword(@Body('username') username: string,@Req() req) {
    req.body.host = req.headers.host.split(":")[0];
    return await this.us.forgotPassword(username,req);
  }
  @Post('changePassword')
  async changePassword(@Req() req) {
    req.body.host = req.headers.host.split(":")[0];
    return await this.us.changePassword(req);
  }
  
  
  

  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
