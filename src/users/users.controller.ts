import { Controller, Param, Put, Query, HttpException, HttpStatus, Inject, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { Logger } from 'winston';

@Controller('users')
export class UsersController {
  constructor(private us: UsersService, @Inject('winston') private readonly logger: Logger) {}

  @Post('register')
  async register(@Body('username') username: string,@Body('password') password: string){
    return await this.us.register(username,password);
  }

  @Post('validateUser')
  async validateUser(@Body('username') username: string,@Body('password') password: string) {
    return await this.us.validateUser(username,password);
  }


  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
