import { Department } from './department.entity';

describe('DepartmentEntity', () => {
  it('should be defined', () => {
    expect(new Department()).toBeDefined();
  });
});
