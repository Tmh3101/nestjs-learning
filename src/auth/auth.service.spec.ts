import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUserService = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const createdUser = {
        _id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        toObject: jest.fn().mockReturnValue({
          _id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashed-password',
        }),
      };

      userService.findByEmail.mockResolvedValue(null);
      userService.create.mockResolvedValue(createdUser as any);

      const result = await service.register(registerDto);

      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(userService.create).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        _id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      userService.findByEmail.mockResolvedValue({
        _id: 'existing-user-id',
        email: 'test@example.com',
        name: 'Existing User',
      } as any);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        _id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
      };

      userService.findByEmailWithPassword.mockResolvedValue(user as any);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(userService.findByEmailWithPassword).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashed-password',
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-id',
        email: 'test@example.com',
      });
      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      userService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      const user = {
        _id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
      };

      userService.findByEmailWithPassword.mockResolvedValue(user as any);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const userId = 'user-id';
      const user = {
        _id: userId,
        email: 'test@example.com',
        name: 'Test User',
      };

      userService.findOne.mockResolvedValue(user as any);

      const result = await service.getProfile(userId);

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toBe(user);
    });
  });
});
