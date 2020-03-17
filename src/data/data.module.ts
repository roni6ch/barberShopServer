import { MongooseModule } from '@nestjs/mongoose';
import { DataController } from './data.controller';
import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { DataSchema } from './data.model';



@Module({
  imports: [
    MongooseModule.forFeature([{name:'Data',schema:DataSchema}])
 ],
  controllers: [DataController],
  providers: [DataService],
})
export class DataModule {}
