import { OrderLocation } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCustomRequestDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @IsString()
  @IsOptional()
  customerAddress?: string;

  @IsEnum(OrderLocation)
  @IsOptional()
  location?: OrderLocation;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  flavor: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  pounds: number;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsOptional()
  features?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
