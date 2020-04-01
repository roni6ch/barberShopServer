import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { SettingsSchema } from './settings.model';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [
    MongooseModule.forFeature([{name:'Settings',schema:SettingsSchema}]),
 ],
  controllers: [SettingsController],
  providers: [SettingsService]
})
export class SettingsModule {}
