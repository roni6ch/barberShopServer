import { LpService } from './lp.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { LpSchema } from './lp.model';
import { LpController } from './lp.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{name:'Lp',schema:LpSchema}])
 ],
  controllers: [LpController],
  providers: [LpService],
})
export class LPModule {}
