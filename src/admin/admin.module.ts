
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { DataSchema } from 'src/data/data.model';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';



@Module({
  imports: [
    MongooseModule.forFeature([{name:'Data',schema:DataSchema}])
 ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
