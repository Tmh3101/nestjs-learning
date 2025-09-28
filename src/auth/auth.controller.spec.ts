import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const result = {
        _id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
      };

      authService.register.mockResolvedValue(result);

      const response = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(response).toBe(result);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = {
        access_token: 'jwt-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      authService.login.mockResolvedValue(result);

      const response = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(response).toBe(result);
    });
  });

  describe('getProfile', () => {
    it('should return the user profile from request', () => {
      const user = {
        _id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockRequest = { user } as any;

      const result = controller.getProfile(mockRequest);

      expect(result).toBe(user);
    });
  });
});
