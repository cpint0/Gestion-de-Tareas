import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false })
  completed!: boolean;

  @Column()
  userEmail!: string;

  @Column({ default: 'UNKNOWN' })
  procesadoPor!: string; //columna para saber quién proceso

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}