import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Rejestruje nowego użytkownika w bazie danych.
   * Sprawdza, czy adres e-mail nie jest już zajęty. Jeśli jest wolny,
   * haszuje hasło za pomocą bcrypt i zapisuje użytkownika w bazie.
   * Zwraca dane nowo utworzonego użytkownika (bez hasła).
   *
   * @param dto Obiekt transferu danych zawierający email, hasło i imię/nazwisko.
   * @throws ConflictException Jeśli adres e-mail jest już zajęty.
   */
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  /**
   * Uwierzytelnia użytkownika na podstawie adresu e-mail i hasła.
   * Porównuje podane hasło z hashem zapisanym w bazie danych za pomocą bcrypt.
   * W przypadku sukcesu generuje i zwraca token dostępu JWT oraz dane profilowe użytkownika.
   *
   * @param dto Obiekt transferu danych zawierający email i hasło.
   * @throws UnauthorizedException Jeśli użytkownik o podanym adresie email nie istnieje lub hasło jest niepoprawne.
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
