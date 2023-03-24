import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async findAll() {
    const employees = await this.employeeRepository.find({
      take: 10,
    });

    if (employees) {
      return employees;
    }

    throw new HttpException('No employees are found!', HttpStatus.NOT_FOUND);
  }

  async findOne(emp_no: number) {
    const employee = await this.employeeRepository.findOne({
      where: { emp_no },
    });

    if (employee) {
      return employee;
    }

    throw new HttpException(
      `The employee with the ID ${emp_no} was not found!`,
      HttpStatus.NOT_FOUND,
    );
  }

  async create(employee: Employee) {
    if (
      !employee.birth_date ||
      !employee.first_name ||
      !employee.last_name ||
      !employee.gender ||
      !employee.hire_date
    ) {
      throw new HttpException(
        {
          error:
            'A new employee could not be created! All fields are required!',
          details:
            'Please provide the birth_date, first_name, last_name, gender and hire_date of the new employee!',
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      return await this.employeeRepository
        .query('SELECT TOP 1 * FROM dbo.employees ORDER BY emp_no DESC')
        .then(async (lastEmployee) => {
          const employeeNumber = parseInt(lastEmployee[0].emp_no) + 1;
          const newEmployee = this.employeeRepository.create({
            emp_no: employeeNumber,
            ...employee,
          });

          if (!this.isValidDate(employee.birth_date.toString())) {
            throw new HttpException(
              {
                error:
                  'A new employee could not be created! The birth_date is invalid!',
                details: 'Birth date must have the format yyyy-mm-dd!',
              },
              HttpStatus.BAD_REQUEST,
            );
          } else if (
            employee.first_name.length < 2 ||
            employee.first_name.length > 14
          ) {
            throw new HttpException(
              {
                error:
                  'A new employee could not be created! The first_name is invalid!',
                details:
                  'First name must have at least 2 characters and at most 14 characters!',
              },
              HttpStatus.BAD_REQUEST,
            );
          } else if (
            employee.last_name.length < 2 ||
            employee.last_name.length > 16
          ) {
            throw new HttpException(
              {
                error:
                  'A new employee could not be created! The last_name is invalid!',
                details:
                  'Last name must have at least 2 characters and at most 16 characters!',
              },
              HttpStatus.BAD_REQUEST,
            );
          } else if (employee.gender !== 'M' && employee.gender !== 'F') {
            throw new HttpException(
              {
                error:
                  'A new employee could not be created! The gender is invalid!',
                details: "Gender must be either 'M' or 'F'!",
              },
              HttpStatus.BAD_REQUEST,
            );
          } else if (!this.isValidDate(employee.hire_date.toString())) {
            throw new HttpException(
              {
                error:
                  'A new employee could not be created! The hire_date is invalid!',
                details: 'Hire date must have the format yyyy-mm-dd!',
              },
              HttpStatus.BAD_REQUEST,
            );
          } else {
            await this.employeeRepository.save(newEmployee);

            return newEmployee;
          }
        });
    }
  }

  async update(emp_no: number, employee: Employee) {
    const currentEmployee = await this.employeeRepository.findOne({
      where: { emp_no },
    });

    if (currentEmployee) {
      if (
        !employee.birth_date ||
        !employee.first_name ||
        !employee.last_name ||
        !employee.gender ||
        !employee.hire_date
      ) {
        throw new HttpException(
          {
            error:
              'The employee could not be updated! All fields are required!',
            details:
              'Please provide the birth_date, first_name, last_name, gender and hire_date of the new employee!',
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        if (!this.isValidDate(employee.birth_date.toString())) {
          throw new HttpException(
            {
              error:
                'The employee could not be updated! The birth_date is invalid!',
              details: 'Birth date must have the format yyyy-mm-dd!',
            },
            HttpStatus.BAD_REQUEST,
          );
        } else if (
          employee.first_name.length < 2 ||
          employee.first_name.length > 14
        ) {
          throw new HttpException(
            {
              error:
                'The employee could not be updated! The first_name is invalid!',
              details:
                'First name must have at least 2 characters and at most 14 characters!',
            },
            HttpStatus.BAD_REQUEST,
          );
        } else if (
          employee.last_name.length < 2 ||
          employee.last_name.length > 16
        ) {
          throw new HttpException(
            {
              error:
                'The employee could not be updated! The last_name is invalid!',
              details:
                'Last name must have at least 2 characters and at most 16 characters!',
            },
            HttpStatus.BAD_REQUEST,
          );
        } else if (employee.gender !== 'M' && employee.gender !== 'F') {
          throw new HttpException(
            {
              error:
                'The employee could not be updated! The gender is invalid!',
              details: "Gender must be either 'M' or 'F'!",
            },
            HttpStatus.BAD_REQUEST,
          );
        } else if (!this.isValidDate(employee.hire_date.toString())) {
          throw new HttpException(
            {
              error:
                'The employee could not be updated! The hire_date is invalid!',
              details: 'Hire date must have the format yyyy-mm-dd!',
            },
            HttpStatus.BAD_REQUEST,
          );
        } else {
          const updatedEmployee = {
            emp_no,
            ...employee,
          };

          await this.employeeRepository.update(emp_no, employee);
          return updatedEmployee;
        }
      }
    }

    throw new HttpException(
      `The employee with the ID ${emp_no} was not found!`,
      HttpStatus.NOT_FOUND,
    );
  }

  async remove(emp_no: number) {
    const employee = await this.employeeRepository.findOne({
      where: { emp_no },
    });

    if (employee) {
      return await this.employeeRepository.delete(emp_no);
    }

    throw new HttpException(
      `The employee with the ID ${emp_no} was not found!`,
      HttpStatus.NOT_FOUND,
    );
  }

  isValidDate(dateString: string) {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    return dateString.match(regEx) != null;
  }
}
