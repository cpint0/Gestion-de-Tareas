import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AppController {
  
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    // Verificar si el usuario ya existe en la BD
    const userExists = await this.usersRepository.findOne({ 
        where: { email: createUserDto.email } 
    });
    
    if (userExists) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    // Crear y guardar el nuevo usuario
    const newUser = this.usersRepository.create(createUserDto);
    await this.usersRepository.save(newUser);
    
    return { message: 'User registered successfully' };
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    // Buscar usuario por credenciales
    const user = await this.usersRepository.findOne({ 
        where: { 
            email: loginUserDto.email, 
            password: loginUserDto.password 
        } 
    });
    
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return { message: 'Login successful', user: { email: user.email, name: user.name } };
  }
}