import { Body, Controller, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post()
  async create(@Body() dto: CreateMessageDto) {
    const message = await this.messageService.create(dto);
    return new ApiResponseDto(true, 'Message created successfully', message);
  }
}
