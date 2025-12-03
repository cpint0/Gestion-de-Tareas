import { Controller, Get, Post, Body, Query, Put, Delete, Param } from '@nestjs/common';
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

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    const newTask = this.tasksRepository.create(createTaskDto);
    await this.tasksRepository.save(newTask);
    return { message: 'Task created successfully', task: newTask };
  }

  @Put(':id')
  async updateTask(
    @Param('id') id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    await this.tasksRepository.update(id, updateTaskDto);
    const updatedTask = await this.tasksRepository.findOne({ where: { id } });
    return { message: 'Task updated successfully', task: updatedTask };
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: number) {
    const result = await this.tasksRepository.delete(id);
    return { message: 'Task deleted successfully', affected: result.affected };
  }
}