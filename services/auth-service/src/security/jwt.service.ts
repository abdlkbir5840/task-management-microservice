import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'crypto';

export interface JwtPayload{
    sub: string;
    email: string
}
@Injectable()
export class JwtService {

    constructor(private readonly jwtService: NestJwtService, private readonly config: ConfigService) {
        
    }


    generateAccessToken(payload: JwtPayload): string {
        return this.jwtService.sign(
            payload, 
            {
                secret: this.config.get('JWT_SECRET'),
                expiresIn: this.config.get('JWT_EXPIRATION') || '1h'
            }
        );
    }
    generateRefreshToken() {
        const refreshToken = randomUUID();
        const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex');

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7)
        
        return {refreshToken, refreshTokenHash, expiresAt}
    }

    generateTokenPair(payload: JwtPayload){
        const accessToken = this.generateAccessToken(payload);
        const {refreshToken, refreshTokenHash, expiresAt} = this.generateRefreshToken()
        return {accessToken, refreshToken, refreshTokenHash, expiresAt}
    }
    verify(token: string): JwtPayload {
        try {
            return this.jwtService.verify(token, {
                secret: this.config.get('JWT_SECRET')
            });
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token')
        }
    }
}