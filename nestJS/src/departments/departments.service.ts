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

  async create() {
    return await this.departmentRepository
      .query('SELECT TOP 1 * FROM dbo.departments ORDER BY dept_no DESC')
      .then(async (lastDepartment) => {
        const getNumberFromString = parseInt(
          lastDepartment[0].dept_no.replace(/[^\d.]/g, ''),
        );
        const departmentNumber =
          'd' + String(getNumberFromString + 1).padStart(3, '0');
        const randomDepartmentName = this.createDepartmentName(50);

        const newDepartment = this.departmentRepository.create({
          dept_no: departmentNumber,
          dept_name: randomDepartmentName,
        });

        await this.departmentRepository.save(newDepartment);
        return newDepartment;
      });
  }

  async update(dept_no: string) {
    const department = await this.departmentRepository.findOne({
      where: { dept_no },
    });

    if (department) {
      const randomDepartmentName = this.createDepartmentName(50);

      const updatedDepartment = {
        dept_no,
        dept_name: randomDepartmentName,
      };
      await this.departmentRepository.update(dept_no, updatedDepartment);
      return updatedDepartment;
    }

    throw new HttpException(
      `The department with the ID ${dept_no} was not found!`,
      HttpStatus.NOT_FOUND,
    );
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

  createDepartmentName(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
}
