import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './employees/employee.entity';
import { EmployeesModule } from './employees/employees.module';
import * as dotenv from 'dotenv';
import { Department } from './departments/department.entity';
import { DepartmentsModule } from './departments/departments.module';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST,
      port: 1433,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [Employee, Department],
    }),
    EmployeesModule,
    DepartmentsModule,
  ],
})
export class AppModule {}
