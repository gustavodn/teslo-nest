import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 10,
    description:
      'The number of items to skip before starting to collect the output items.',
  })
  @IsOptional()
  offset?: number;

  @ApiProperty({
    default: 0,
    description: 'The numbers of items to return.',
  })
  @IsPositive()
  @IsOptional()
  @Min(0)
  limit?: number;
}
