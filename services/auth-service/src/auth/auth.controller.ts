import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { agent } from "supertest";
import type { Request } from "express";
import { JwtAuthGuard } from "src/security/jwt.guard";

interface RequestWithUser extends Request {
    user: {
        sub: string;
        email: string;
    };
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService : AuthService){}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterDto){
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.CREATED)
    async login(@Body() dto: LoginDto, @Req() req: Request){
        const meta = {
            deviceId: req.headers['x-device-id'] as string,
            agent: req.headers['user-agent'],
            ipAddress: req.ip || req.socket.remoteAddress,
        }
        return this.authService.login(dto, meta);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body('refreshToken') refreshToken: string ){
        return this.authService.refresh(refreshToken);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Body('refreshToken') refreshToken: string ){
        return this.authService.logout(refreshToken);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async me(@Req() req: RequestWithUser ){
        const accountId = req.user.sub
        return this.authService.me(accountId);
    }
}