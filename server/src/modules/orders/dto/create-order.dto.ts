import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export enum OrderLocation {
  INSIDE = 'INSIDE',
  OUTSIDE = 'OUTSIDE',
}

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  cakeId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsString()
  @IsNotEmpty({ message: 'Customer name is required' })
  customerName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Customer phone number is required' })
  customerPhone!: string;

  @IsString()
  @IsNotEmpty({ message: 'Delivery address is required' })
  customerAddress!: string;

  @IsEnum(OrderLocation)
  @IsNotEmpty({ message: 'Delivery location is required' })
  location!: OrderLocation;
}
