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
import { DepartmentsService } from './departments.service';
import { Department } from './department.entity';

@Controller('api/departments')
export class DepartmentsController {
  constructor(private service: DepartmentsService) {}

  @Get()
  async getAllDepartments() {
    return await this.service.findAll();
  }

  @Get(':dept_no')
  async getDepartment(@Param('dept_no') dept_no: string) {
    return await this.service.findOne(dept_no);
  }

  @Post()
  async createDepartment(@Body() department: Department) {
    return await this.service.create(department);
  }

  @Put(':dept_no')
  async updateDepartment(
    @Param('dept_no') dept_no: string,
    @Body() department: Department,
  ) {
    return await this.service.update(dept_no, department);
  }

  @Delete(':dept_no')
  @HttpCode(204)
  async deleteDepartment(@Param('dept_no') dept_no: string) {
    return await this.service.remove(dept_no);
  }
}
