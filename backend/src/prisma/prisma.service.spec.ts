import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { PrismaModule } from './prisma.module';

describe('PrismaService Injection', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined and successfully injected by NestJS DI', () => {
    expect(prismaService).toBeDefined();
    expect(typeof prismaService.$connect).toBe('function');
    expect(typeof prismaService.$disconnect).toBe('function');
  });

  it('should expose the User model delegate', () => {
    expect(prismaService.user).toBeDefined();
    expect(typeof prismaService.user.findMany).toBe('function');
    expect(typeof prismaService.user.create).toBe('function');
  });
});
