import { Body, Controller, Get, Param, Post, Query, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { QueryMessagesDto } from '../common/dto/query-messages.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return new ApiResponseDto(true, 'User created successfully', user);
  }

  @Get(':id/messages')
  async getMessages(
    @Param('id') id: string,
    @Query() query: QueryMessagesDto
  ) {
    const messages = await this.userService.getMessages(Number(id), query);
    return new ApiResponseDto(true, 'Messages retrieved successfully', messages);
  }

}
