import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCakeDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  flavor?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizeOptions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialFeatures?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pounds?: number;

  @IsOptional()
  @IsBoolean()
  availability?: boolean;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
