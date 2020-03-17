import { Module } from '@nestjs/common';
import { DataModule } from './data/data.module';
import { constants } from './constants';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersModule } from './customers/customers.module';



@Module({
  imports: [
    DataModule,
    CustomersModule,
    MongooseModule.forRoot(`mongodb+srv://${constants.mdbUser}:${constants.mdbPass}@cluster0-rmhe5.gcp.mongodb.net/barber?retryWrites=true&w=majority`, { useNewUrlParser: true,useUnifiedTopology:true})
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
