import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    @ApiProperty({
        example:'user@example.com',
        description:'Unique email address for account registration',
        maxLength:255,
        format:'email',
    })
    @IsEmail({}, {message: 'Please provide a valid email address'})
    @IsNotEmpty({message: 'Email is required'})
    @MaxLength(255,{message: 'Email must not exceed 255 characters'})
    email: string;

    @IsString({message: 'Password must be a string'})
    @IsNotEmpty({message: 'Password is required'})
    @MinLength(8, {message: 'Password must be at leat 8 characters long'})
    @MaxLength(100, {message: 'Password must not exceed 100 characters'})
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)',
    })
    password: string;
}