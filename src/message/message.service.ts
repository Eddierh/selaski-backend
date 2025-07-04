import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMessageDto) {
    const userExists = await this.prisma.user.findUnique({ where: { id: data.userId } });
    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.message.create({ data });
  }
}
