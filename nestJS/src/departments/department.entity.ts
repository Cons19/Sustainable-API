import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'dbo.departments' })
export class Department {
  @PrimaryColumn()
  dept_no: string;

  @Column()
  dept_name: string;
}
