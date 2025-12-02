import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  private readonly AUTH_URL = 'http://localhost:3001';
  private readonly TASKS_PRIMARY_URL = 'http://localhost:3002';
  private readonly TASKS_MIRROR_URL = 'http://localhost:3003';
  private readonly TASKS_EDIT_PRIMARY_URL = 'http://localhost:3004';
  private readonly TASKS_EDIT_MIRROR_URL = 'http://localhost:3005';

  constructor(private readonly httpService: HttpService) {}

  // ==================== AUTH ====================
  @Post('auth/register')
  async register(@Body() body: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.AUTH_URL}/register`, body)
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Auth Service Error',
        error.response?.status || HttpStatus.BAD_GATEWAY
      );
    }
  }

  @Post('auth/login')
  async login(@Body() body: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.AUTH_URL}/login`, body)
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Auth Service Error',
        error.response?.status || HttpStatus.BAD_GATEWAY
      );
    }
  }

  // ==================== TASKS (Crear y Listar) ====================
  @Get('tasks')
  async getTasks(@Query('userEmail') userEmail: string) {
    return this.handleTasksRedundancy('get', '/tasks', null, { userEmail });
  }

  @Post('tasks')
  async createTask(@Body() body: any) {
    try {
      console.log(`[TASKS PRINCIPAL] Intentando crear tarea...`);
      const bodyWithTag = { ...body, procesadoPor: 'PRINCIPAL' };
      const response = await firstValueFrom(
        this.httpService.post(`${this.TASKS_PRIMARY_URL}/tasks`, bodyWithTag)
      );
      console.log('[TASKS PRINCIPAL] ✅ Tarea creada');
      return response.data;
    } catch (primaryError: any) {
      console.warn('[TASKS PRINCIPAL] ❌ Falló. Intentando Espejo...');
      try {
        const bodyWithTag = { ...body, procesadoPor: 'ESPEJO' };
        const response = await firstValueFrom(
          this.httpService.post(`${this.TASKS_MIRROR_URL}/tasks`, bodyWithTag)
        );
        console.log('[TASKS ESPEJO] ✅ Tarea creada');
        return response.data;
      } catch (mirrorError: any) {
        throw new HttpException('Tasks Service Unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      }
    }
  }

  // ==================== TASKS EDIT (Obtener, Editar y Eliminar) ====================
  @Get('tasks/:id')
  async getTask(@Param('id') id: string) {
    return this.handleTasksEditRedundancy('get', `/tasks/${id}`);
  }

  @Put('tasks/:id')
  async updateTask(@Param('id') id: string, @Body() body: any) {
    return this.handleTasksEditRedundancy('put', `/tasks/${id}`, body);
  }

  @Delete('tasks/:id')
  async deleteTask(@Param('id') id: string) {
    return this.handleTasksEditRedundancy('delete', `/tasks/${id}`);
  }

  // ==================== FAILOVER - TASKS ====================
  private async handleTasksRedundancy(
    method: 'get' | 'post',
    endpoint: string,
    data?: any,
    params?: any
  ) {
    try {
      console.log(`[TASKS PRINCIPAL] ${this.TASKS_PRIMARY_URL}${endpoint}`);
      const response = await firstValueFrom(
        this.httpService.request({ method, url: `${this.TASKS_PRIMARY_URL}${endpoint}`, data, params })
      );
      console.log('[TASKS PRINCIPAL] ✅ OK');
      return response.data;
    } catch (error: any) {
      console.warn('[TASKS PRINCIPAL] ❌ Falló. Intentando Espejo...');
      try {
        const response = await firstValueFrom(
          this.httpService.request({ method, url: `${this.TASKS_MIRROR_URL}${endpoint}`, data, params })
        );
        console.log('[TASKS ESPEJO] ✅ OK');
        return response.data;
      } catch (mirrorError: any) {
        throw new HttpException('Tasks Service Unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      }
    }
  }

  // ==================== FAILOVER - TASKS EDIT ====================
  private async handleTasksEditRedundancy(
    method: 'get' | 'put' | 'delete',
    endpoint: string,
    data?: any
  ) {
    try {
      console.log(`[TASKS EDIT PRINCIPAL] ${this.TASKS_EDIT_PRIMARY_URL}${endpoint}`);
      const response = await firstValueFrom(
        this.httpService.request({ method, url: `${this.TASKS_EDIT_PRIMARY_URL}${endpoint}`, data })
      );
      console.log('[TASKS EDIT PRINCIPAL] ✅ OK');
      return response.data;
    } catch (error: any) {
      console.warn('[TASKS EDIT PRINCIPAL] ❌ Falló. Intentando Espejo...');
      try {
        const response = await firstValueFrom(
          this.httpService.request({ method, url: `${this.TASKS_EDIT_MIRROR_URL}${endpoint}`, data })
        );
        console.log('[TASKS EDIT ESPEJO] ✅ OK');
        return response.data;
      } catch (mirrorError: any) {
        throw new HttpException('Tasks Edit Service Unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      }
    }
  }
}