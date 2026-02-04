import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
    @ApiProperty({
    example: 'user@example.com',
    description: 'Registered email address',
    maxLength: 255,
    format: 'email',
    })
    @IsEmail({}, {message: 'Please provide a valide email address'})
    @IsNotEmpty({message: 'Email is Required'})
    @MaxLength(255,{message: 'Email must not exceed 255 characters'})
    email: string;

    @ApiProperty({
    example: 'Str0ngP@ssw0rd!',
    description: 'Account password',
    minLength: 1,
    maxLength: 100,
    format: 'password',
    })
    @IsString({message: 'Password must be a string'})
    @IsNotEmpty({message: 'Password is required'})
    @MinLength(1, {message: 'Password cannot be empty'})
    @MaxLength(100, {message: 'Password must not exceed 100 characters'})
    password: string;
}