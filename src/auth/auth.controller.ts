import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './gurads/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { validRoles } from './interfaces/valid-roles';
import { Auth } from './decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  private(
    @GetUser() user: User,
    @GetUser({ criteria: 'email' }) email: string,
    @Headers() headers: IncomingHttpHeaders,
  ) {
    return {
      message: 'This is a private route',
      user,
      email,
      headers,
    };
  }
  // Using severals decorators
  @Get('private2')
  // @SetMetadata('roles', ['super-user'])
  @UseGuards(AuthGuard(), UserRoleGuard)
  @RoleProtected(validRoles.SUPER_USER, validRoles.ADMIN)
  privateRoute2(@GetUser() user: User) {
    return {
      message: 'This is a private route',
      user,
    };
  }

  // Using decorator composition
  @Get('private3')
  @Auth(validRoles.SUPER_USER, validRoles.ADMIN)
  privateRoute3(@GetUser() user: User) {
    return {
      message: 'This is a private route 3',
      user,
    };
  }

  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkStatus(user);
  }
}
