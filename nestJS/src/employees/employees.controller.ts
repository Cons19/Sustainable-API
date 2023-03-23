import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Employee } from './employee.entity';
import { EmployeesService } from './employees.service';

@Controller('api/employees')
export class EmployeesController {
  constructor(private service: EmployeesService) {}

  @Get()
  async getAllEmployees() {
    return await this.service.findAll();
  }

  @Get(':emp_no')
  async getEmployee(@Param('emp_no') emp_no: string) {
    return await this.service.findOne(Number(emp_no));
  }

  @Post()
  async create(@Body() employee: Employee) {
    return await this.service.create(employee);
  }

  @Put(':emp_no')
  async update(@Param('emp_no') id: number, @Body() employee: Employee) {
    return await this.service.update(id, employee);
  }

  @Delete(':emp_no')
  @HttpCode(204)
  async delete(@Param('emp_no') emp_no: number) {
    return await this.service.remove(emp_no);
  }
}
