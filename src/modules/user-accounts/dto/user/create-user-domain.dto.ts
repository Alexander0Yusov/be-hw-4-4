import { Matches } from 'class-validator';
import { emailConstraints } from '../../domain/user/user.entity';

export class CreateUserDomainDto {
  login: string;
  passwordHash: string;
  email: string;
}

export class UpdateUserDto {
  @Matches(emailConstraints.match)
  email: string;
}
