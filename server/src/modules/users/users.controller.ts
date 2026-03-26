import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  CurrentUser as CurrentUserDecorator,
  type CurrentUser,
} from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUserDecorator() user: CurrentUser) {
    return this.usersService.findById(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.usersService.update({ id: user.id }, updateDto);
  }
}
