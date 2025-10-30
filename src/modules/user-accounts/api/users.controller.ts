import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UserInputDto } from '../dto/user/user-input.dto';
import { UserViewDto } from '../dto/user/user-view.dto';
import { UsersQueryRepository } from '../infrastructure/query/users-query.repository';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../dto/user/get-users-query-params.input-dto';
import { UpdateUserDto } from '../dto/user/create-user-domain.dto';
import { BasicAuthGuard } from '../guards/basic/basi-auth.guard';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  async create(@Body() dto: UserInputDto): Promise<UserViewDto> {
    const userId = await this.usersService.createUser(dto);

    return this.usersQueryRepository.findByIdOrNotFoundFail(userId);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserViewDto> {
    return this.usersQueryRepository.findByIdOrNotFoundFail(id);
  }

  @Get()
  @UseGuards(BasicAuthGuard)
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const users = await this.usersQueryRepository.getAll(query);
    return users;
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<UserViewDto> {
    const userId = await this.usersService.update(id, body);
    return this.usersQueryRepository.findByIdOrNotFoundFail(userId);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.usersService.deleteUser(id);
  }
}
