import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  private readonly AUTH_URL = 'http://localhost:3001';
  private readonly TASKS_PRIMARY_URL = 'http://localhost:3002';
  private readonly TASKS_MIRROR_URL = 'http://localhost:3003';

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

  // ==================== TASKS (CON REDUNDANCIA) ====================
  @Get('tasks')
  async getTasks(@Query('userEmail') userEmail: string) {
    return this.handleTasksRedundancy('get', '/tasks', null, { userEmail });
  }

  @Get('tasks/:id')
  async getTask(@Param('id') id: string) {
    return this.handleTasksRedundancy('get', `/tasks/${id}`);
  }

  @Post('tasks')
  async createTask(@Body() body: any) {
    // INTENTO 1: Servicio Principal
    try {
      console.log(`[PRINCIPAL] Intentando crear tarea...`);
      
      const bodyWithTag = {
        ...body,
        procesadoPor: 'PRINCIPAL'
      };
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.TASKS_PRIMARY_URL}/tasks`, bodyWithTag)
      );
      console.log('[PRINCIPAL] ✅ Tarea creada exitosamente');
      return response.data;
    } catch (primaryError: any) {
      console.warn('[PRINCIPAL] ❌ Falló. Intentando con el Espejo...');

      // INTENTO 2: Servicio Espejo
      try {
        const bodyWithTag = {
          ...body,
          procesadoPor: 'ESPEJO'
        };
        
        const response = await firstValueFrom(
          this.httpService.post(`${this.TASKS_MIRROR_URL}/tasks`, bodyWithTag)
        );
        console.log('[ESPEJO] ✅ Tarea creada exitosamente');
        return response.data;
      } catch (mirrorError: any) {
        console.error('[ESPEJO] ❌ También falló. Ambos servicios caídos.');
        throw new HttpException(
          'Task Service Unavailable',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
    }
  }

  @Put('tasks/:id')
  async updateTask(@Param('id') id: string, @Body() body: any) {
    return this.handleTasksRedundancy('put', `/tasks/${id}`, body);
  }

  @Delete('tasks/:id')
  async deleteTask(@Param('id') id: string) {
    return this.handleTasksRedundancy('delete', `/tasks/${id}`);
  }

  // ==================== LÓGICA DE FAILOVER ====================
  private async handleTasksRedundancy(
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    data?: any,
    params?: any
  ) {
    try {
      console.log(`[PRINCIPAL] Intentando: ${this.TASKS_PRIMARY_URL}${endpoint}`);
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url: `${this.TASKS_PRIMARY_URL}${endpoint}`,
          data,
          params,
        })
      );
      console.log('[PRINCIPAL] ✅ Respuesta exitosa');
      return response.data;
    } catch (primaryError: any) {
      console.warn('[PRINCIPAL] ❌ Falló. Intentando con el Espejo...');

      try {
        console.log(`[ESPEJO] Intentando: ${this.TASKS_MIRROR_URL}${endpoint}`);
        const response = await firstValueFrom(
          this.httpService.request({
            method,
            url: `${this.TASKS_MIRROR_URL}${endpoint}`,
            data,
            params,
          })
        );
        console.log('[ESPEJO] ✅ Respuesta exitosa');
        return response.data;
      } catch (mirrorError: any) {
        console.error('[ESPEJO] ❌ También falló.');
        throw new HttpException(
          'Task Service Unavailable',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
    }
  }
}