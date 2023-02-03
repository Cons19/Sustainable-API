import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  courses = [
    { id: 1, name: 'course1' },
    { id: 2, name: 'course2' },
    { id: 3, name: 'course3' },
  ];
  getCourses(): any {
    return this.courses;
  }
  getCourseById(id: number): any {
    const course = this.courses.find((c) => c.id === Number(id));

    if (!course) {
      throw new HttpException('Course not found', 404);
    }
    return course;
  }
  createCourse(name: string): any {
    if (!name || name.length < 3) {
      throw new HttpException(
        'Name is required and should be minimum 3 characters',
        400,
      );
    }

    const course = {
      id: this.courses.length + 1,
      name: Object(name)['name'],
    };

    this.courses.push(course);
    return course;
  }
  updateCourse(id: number, name: string): any {
    const course = this.courses.find((c) => c.id === Number(id));

    if (!course) {
      throw new HttpException('Course not found', 404);
    }

    if (!name || name.length < 3) {
      throw new HttpException(
        'Name is required and should be minimum 3 characters',
        400,
      );
    }

    course.name = Object(name)['name'];
    return course;
  }
  deleteCourse(id: number): any {
    const course = this.courses.find((c) => c.id === Number(id));

    if (!course) {
      throw new HttpException('Course not found', 404);
    }

    const index = this.courses.indexOf(course);
    this.courses.splice(index, 1);

    return course;
  }
}
