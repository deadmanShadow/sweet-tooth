import { IsString, Length } from 'class-validator';

export class CreateEchoDto {
  @IsString()
  @Length(1, 200)
  message!: string;
}

