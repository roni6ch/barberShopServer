
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { UsersSchema } from './users.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SettingsService } from 'src/settings/settings.service';
import { SettingsSchema } from 'src/settings/settings.model';



@Module({
  imports: [
    MongooseModule.forFeature([{name:'Settings',schema:SettingsSchema}]),
    MongooseModule.forFeature([{name:'Users',schema:UsersSchema}])
 ],
  controllers: [UsersController],
  providers: [UsersService,SettingsService]
})
export class UsersModule {} 
