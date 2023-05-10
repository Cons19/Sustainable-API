import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async findAll() {
    const departments = await this.departmentRepository.find({
      order: {
        dept_no: 'ASC',
      },
    });

    if (departments) {
      return departments;
    }

    throw new HttpException('No departments are found!', HttpStatus.NOT_FOUND);
  }

  async findOne(dept_no: string) {
    const department = await this.departmentRepository.findOne({
      where: { dept_no },
    });

    if (department) {
      return department;
    }

    throw new HttpException(
      `The department with the ID ${dept_no} was not found!`,
      HttpStatus.NOT_FOUND,
    );
  }

  async create(department: Department) {
    if (!department.dept_name) {
      throw new HttpException(
        {
          error:
            'A new department could not be created! All fields are required!',
          details: 'Please provide the dept_name of the new department!',
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      return await this.departmentRepository
        .query(
          `SELECT * FROM dbo.departments WHERE dept_name = '${department.dept_name}'`,
        )
        .then(async (departments) => {
          if (departments.length > 0) {
            throw new HttpException(
              {
                error:
                  'A new department could not be created! The dept_name must be unique!',
                details: `The dept_name ${department.dept_name} already exists!`,
              },
              HttpStatus.BAD_REQUEST,
            );
          } else {
            return await this.departmentRepository
              .query(
                'SELECT TOP 1 * FROM dbo.departments ORDER BY dept_no DESC',
              )
              .then(async (lastDepartment) => {
                const getNumberFromString = parseInt(
                  lastDepartment[0].dept_no.replace(/[^\d.]/g, ''),
                );
                const departmentNumber =
                  'd' + String(getNumberFromString + 1).padStart(3, '0');

                const newDepartment = this.departmentRepository.create({
                  dept_no: departmentNumber,
                  dept_name: department.dept_name,
                });

                await this.departmentRepository.save(newDepartment);
                return newDepartment;
              });
          }
        });
    }
  }

  async update(dept_no: string, department: Department) {
    const oldDepartment = await this.departmentRepository.findOne({
      where: { dept_no },
    });

    if (oldDepartment) {
      if (!department.dept_name) {
        throw new HttpException(
          {
            error:
              'The department could not be updated! All fields are required!',
            details: 'Please provide the dept_name of the department!',
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        return await this.departmentRepository
          .query(
            `SELECT * FROM dbo.departments WHERE dept_name = '${department.dept_name}' AND dept_no != '${dept_no}'`,
          )
          .then(async (departments) => {
            if (departments.length > 0) {
              throw new HttpException(
                {
                  error:
                    'The department could not be updated! The dept_name must be unique!',
                  details: `The dept_name ${department.dept_name} already exists!`,
                },
                HttpStatus.BAD_REQUEST,
              );
            } else {
              const updatedDepartment = {
                dept_no,
                dept_name: department.dept_name,
              };
              await this.departmentRepository.update(
                dept_no,
                updatedDepartment,
              );
              return updatedDepartment;
            }
          });
      }
    } else {
      throw new HttpException(
        `The department with the ID ${dept_no} was not found!`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async remove(dept_no: string) {
    const department = await this.departmentRepository.findOne({
      where: { dept_no },
    });

    if (department) {
      return await this.departmentRepository.delete(dept_no);
    }

    throw new HttpException(
      `The department with the ID ${dept_no} was not found!`,
      HttpStatus.NOT_FOUND,
    );
  }
}
