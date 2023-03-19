import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Employee } from './employee.entity';

@Controller('api/employees')
export class EmployeesController {
  constructor(private service: EmployeesService) {}

  @Get()
  getUsers() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param() id: number) {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() employee: Employee) {
    const response = await this.service.create(employee);
  }

  @Put(':emp_no')
  async update(@Param() id: number, @Body() employee: Employee) {
    const response = await this.service.update(id, employee);
    return response;
  }

  @Delete(':id')
  delete(@Param() id: number) {
    return this.service.remove(id);
  }
}
