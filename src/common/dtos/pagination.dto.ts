import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  offset?: number;

  @IsPositive()
  @IsOptional()
  @Min(0)
  limit?: number;
}
