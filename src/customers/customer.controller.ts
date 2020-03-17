import { CustomersService } from './customers.service';
import { Controller, Get, Post, Body } from "@nestjs/common";
import { Customer } from './customer.model';
import { DataService } from 'src/data/data.service';
             
@Controller('customers')
export class CustomerController {
  constructor(private cs : CustomersService,private ds : DataService) {}
  @Post()
  async addData(
      @Body() customer: Customer
  ): Promise<boolean>{
    await this.ds.setHour(customer); 
    return await this.cs.addData(customer); 
  }
}
