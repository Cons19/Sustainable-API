import { EmployeeEntity } from './employee.entity';

describe('EmployeeEntity', () => {
  it('should be defined', () => {
    expect(new EmployeeEntity()).toBeDefined();
  });
});
