import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  //TODO - Negative cases for all endpoints

  findAll() {
    /*
    return this.employeeRepository.find({
      take: 10,
    });
    */
    const queryString = 'SELECT TOP 10 * FROM dbo.employees';
    return this.employeeRepository.query(queryString);
  }

  findOne(id: number) {
    const queryString =
      'SELECT * FROM dbo.employees WHERE emp_no = ' + id['id'];
    return this.employeeRepository.query(queryString);
  }

  create(employee: Employee) {
    const queryFindTotal = 'SELECT COUNT(*) as total FROM dbo.employees';
    this.employeeRepository.query(queryFindTotal).then(function (results) {
      employee.emp_no = Number(results[0]['total']) + 1;
      const queryString = `INSERT INTO dbo.employees VALUES ('${employee.emp_no}', '${employee.birth_date}', '${employee.first_name}', 
      '${employee.last_name}', '${employee.gender}', '${employee.hire_date}');`;
      console.log(queryString);
      // unseen here
      console.log(this.employeeRepository);
      return this.employeeRepository.query(queryString);
    });
  }

  // To do
  update(emp_no: number, employee: Employee) {
    return this.employeeRepository.update(emp_no, employee);
  }

  // To verify
  async remove(emp_no: number) {
    await this.employeeRepository.delete(emp_no);
  }
}
