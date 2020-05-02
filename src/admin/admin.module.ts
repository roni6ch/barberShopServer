import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { DataSchema } from 'src/data/data.model';
import { CustomerSchema } from 'src/customers/customer.model';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SettingsSchema } from 'src/settings/settings.model';
import { AuthSchema } from 'src/auth/auth.model';
import { SettingsModule } from 'src/settings/settings.module';
import { MulterModule } from '@nestjs/platform-express';



@Module({
  imports: [
    SettingsModule,
    MongooseModule.forFeature([{name:'Auth',schema:AuthSchema}]),
    MongooseModule.forFeature([{name:'Customer',schema:CustomerSchema}]),
    MongooseModule.forFeature([{name:'Settings',schema:SettingsSchema}]),
    MongooseModule.forFeature([{name:'Data',schema:DataSchema}])
 ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
