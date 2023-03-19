import { Employee } from './employee.entity';

describe('EmployeeEntity', () => {
  it('should be defined', () => {
    expect(new Employee()).toBeDefined();
  });
});
