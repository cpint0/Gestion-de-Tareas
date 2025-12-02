export class CreateTaskDto {
  title!: string;
  description?: string;
  userEmail!: string;
  procesadoPor?: string; 
}