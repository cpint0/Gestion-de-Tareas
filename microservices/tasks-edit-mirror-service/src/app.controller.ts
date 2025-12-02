import { Controller, Get, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class AppController {
  
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  @Get(':id')
  async getTask(@Param('id') id: number) {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    return task;
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
