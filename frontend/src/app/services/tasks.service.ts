import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private apiUrl = 'http://localhost:3000/api/tasks';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getTasks(): Observable<any> {
    const userEmail = this.authService.getCurrentUser()?.email;
    return this.http.get(`${this.apiUrl}?userEmail=${userEmail}`);
  }

  createTask(title: string, description?: string): Observable<any> {
    const userEmail = this.authService.getCurrentUser()?.email;
    return this.http.post(this.apiUrl, {
      title,
      description,
      userEmail
    });
  }

  updateTask(id: number, title?: string, description?: string, completed?: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, {
      title,
      description,
      completed
    });
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
