import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy, JwtPayload } from './jwt.strategy';
import { UserService } from '../../user/user.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const mockUserService = {
      findByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user when valid payload is provided', async () => {
      const payload: JwtPayload = {
        sub: 'user-id',
        email: 'test@example.com',
      };

      const user = {
        _id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
      };

      userService.findByEmail.mockResolvedValue(user as any);

      const result = await strategy.validate(payload);

      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toBe(user);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const payload: JwtPayload = {
        sub: 'user-id',
        email: 'test@example.com',
      };

      userService.findByEmail.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
