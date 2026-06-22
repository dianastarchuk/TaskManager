import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Rejestruje nowego użytkownika w systemie.
   * Przyjmuje dane rejestracyjne (RegisterDto) i przekazuje je do serwisu uwierzytelniania.
   */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Loguje istniejącego użytkownika i zwraca token JWT.
   * Przyjmuje dane logowania (LoginDto) i ustawia kod statusu HTTP na OK (200).
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
