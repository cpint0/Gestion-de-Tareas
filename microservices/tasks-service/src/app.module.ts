import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { Task } from './entities/task.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '3306'), 10),
        username: config.get('DB_USERNAME', 'devuser'),
        password: config.get('DB_PASSWORD', 'devpass'),
        database: config.get('DB_NAME', 'gestion_tareas'),
        entities: [Task],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Task]),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
