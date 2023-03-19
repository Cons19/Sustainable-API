import { Module } from '@nestjs/common';
import { EmployeesModule } from './employees/employees.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './employees/employee.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      "type": "mssql",
      "host": "sustainable-software-employees-db.database.windows.net",
      "port": 1433,
      "username": "razvandragos",
      "password": "Password!",
      "database": "employees-db",
      "entities": [Employee]
    }),
    EmployeesModule
  ],
})
export class AppModule {}