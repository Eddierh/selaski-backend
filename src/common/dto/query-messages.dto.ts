import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMessagesDto {
  @ApiPropertyOptional({ example: 'hola', description: 'Filter messages by content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z', description: 'Filter messages after this date' })
  @IsOptional()
  @IsDateString()
  after?: string;

  @ApiPropertyOptional({ example: 10, description: 'Limit number of messages' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}