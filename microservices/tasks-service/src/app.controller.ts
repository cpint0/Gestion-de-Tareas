import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('tasks')
export class AppController {
  
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  @Get()
  async getTasks(@Query('userEmail') userEmail: string) {
    if (!userEmail) {
      return this.tasksRepository.find();
    }
    return this.tasksRepository.find({ where: { userEmail } });
  }

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    const newTask = this.tasksRepository.create(createTaskDto);
    await this.tasksRepository.save(newTask);
    return { message: 'Task created successfully', task: newTask };
  }
}