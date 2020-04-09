
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { AuthSchema } from './auth.model';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SettingsModule } from 'src/settings/settings.module';

@Module({
  imports: [
    SettingsModule,
    MongooseModule.forFeature([{name:'Auth',schema:AuthSchema}])
 ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {} 
