import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Role } from '../../auth/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UserModel {
  @IsOptional()
  @ApiProperty({
    description: 'ID of the user',
  })
  id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Name of the user',
  })
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Surname of the user',
  })
  readonly surname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Phone number of the user',
  })
  readonly phoneNumber: string;

  readonly roles: Role[];
}

export class UserLogin {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Phone number of the user',
  })
  phoneNumber: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Received authentication code',
    example: 12345,
  })
  code: number;
}

export class UserRegister {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Name of the User',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Surname of the user',
  })
  surname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Phone number of the user',
  })
  phoneNumber: string;
}

export class RequestCode {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Phone number to login. Successful response will send sms',
  })
  phoneNumber: string;
}
