import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'dbo.employees' })
export class Employee {
  @PrimaryColumn()
  emp_no: number;

  @Column()
  birth_date: Date;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  gender: string;

  @Column()
  hire_date: Date;
}
