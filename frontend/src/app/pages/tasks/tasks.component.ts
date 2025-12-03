import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TasksService } from '../../services/tasks.service';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent implements OnInit {
  form: FormGroup;
  tasks: any[] = [];
  loading = false;
  submitted = false;
  error = '';
  success = '';
  currentUser: any;
  editingTaskId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private tasksService: TasksService,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadTasks();
  }

  get f() {
    return this.form.controls;
  }

  get completedCount(): number {
    return this.tasks.filter(t => t.completed).length;
  }

  loadTasks(): void {
    this.loading = true;
    this.tasksService.getTasks().subscribe({
      next: (response: any) => {
        this.tasks = response.length ? response : response.task ? [response.task] : [];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar tareas';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.tasksService.createTask(
      this.f['title'].value,
      this.f['description'].value
    ).subscribe({
      next: (response) => {
        console.log('Task created:', response);
        this.success = 'Tarea creada exitosamente';
        this.form.reset();
        this.submitted = false;
        this.loading = false;
        this.loadTasks();
        setTimeout(() => this.success = '', 3000);
      },
      error: (error) => {
        console.error('Error creating task:', error);
        this.error = error.error?.message || 'Error al crear tarea';
        this.loading = false;
      }
    });
  }

  toggleTask(task: any): void {
    this.tasksService.updateTask(
      task.id,
      task.title,
      task.description,
      !task.completed
    ).subscribe({
      next: () => {
        task.completed = !task.completed;
        this.success = 'Tarea actualizada';
        setTimeout(() => this.success = '', 3000);
      },
      error: () => {
        this.error = 'Error al actualizar tarea';
      }
    });
  }

  deleteTask(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      this.tasksService.deleteTask(id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== id);
          this.success = 'Tarea eliminada';
          setTimeout(() => this.success = '', 3000);
        },
        error: () => {
          this.error = 'Error al eliminar tarea';
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
