import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async getMessages(userId: number, filters?: { content?: string; after?: string; limit?: number }) {
    const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    const where: any = { userId };
    if (filters?.content) {
      where.content = { contains: filters.content };
    }
    if (filters?.after) {
      where.createdAt = { gte: new Date(filters.after) };
    }

    return this.prisma.message.findMany({
      where,
      take: filters?.limit ? Number(filters.limit) : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }


}
