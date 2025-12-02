import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

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

  @Get(':id')
  async getTask(@Param('id') id: number) {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    return task;
  }

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    const newTask = this.tasksRepository.create(createTaskDto);
    await this.tasksRepository.save(newTask);
    return { message: 'Task created successfully', task: newTask };
  }

  @Put(':id')
  async updateTask(@Param('id') id: number, @Body() updateTaskDto: UpdateTaskDto) {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    Object.assign(task, updateTaskDto);
    await this.tasksRepository.save(task);
    return { message: 'Task updated successfully', task };
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: number) {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    await this.tasksRepository.remove(task);
    return { message: 'Task deleted successfully' };
  }
}