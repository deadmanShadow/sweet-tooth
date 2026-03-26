import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  CurrentUser as CurrentUserDecorator,
  type CurrentUser,
} from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUserDecorator() user: CurrentUser) {
    return this.usersService.findById(user.id);
  }
}
