import { SettingsService } from './settings/settings.service';
import { Module } from '@nestjs/common';
import { DataModule } from './data/data.module';
import { constants } from './constants';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersModule } from './customers/customers.module';
import { SettingsController } from './settings/settings.controller';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { AdminModule } from './admin/admin.module';
import { PugAdapter, MailerModule } from '@nestjs-modules/mailer';



@Module({
  imports: [
    DataModule,
    CustomersModule,
    AdminModule,
    MongooseModule.forRoot(`mongodb+srv://${constants.mdbUser}:${constants.mdbPass}@cluster0-rmhe5.gcp.mongodb.net/${constants.collection}?retryWrites=true&w=majority`, { useNewUrlParser: true,useUnifiedTopology:true,useFindAndModify: false}),
    MailerModule.forRoot({
      transport: 'smtps://Roni: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@smtp.sendgrid.net',
      defaults: { //https://app.sendgrid.com/guide/integrate/langs/smtp
        from:'"nest-modules" <modules@nestjs.com>',
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class AppModule {}
