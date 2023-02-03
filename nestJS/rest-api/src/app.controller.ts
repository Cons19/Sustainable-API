import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/api/courses')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getCourses(): any {
    return this.appService.getCourses();
  }

  @Get(':id')
  getCourseById(@Param('id') id: number): any {
    console.log(id);
    return this.appService.getCourseById(id);
  }

  @Post()
  createCourse(@Body() name: string): any {
    return this.appService.createCourse(name);
  }

  @Put(':id')
  updateCourse(@Param('id') id: number, @Body() name): any {
    return this.appService.updateCourse(id, name);
  }

  @Delete(':id')
  deleteCourse(@Param('id') id: number): any {
    return this.appService.deleteCourse(id);
  }
}
