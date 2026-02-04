import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken'

@Injectable()
export class JwtService {
    private readonly jwtSecret: string;
    private readonly expiresIn: string;
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET!
        this.expiresIn = '15m';
    }


    sign(payload: Record<string, any>): string {
        return jwt.sign(
            payload, this.jwtSecret,
            {
                expiresIn: this.expiresIn
            } as jwt.SignOptions
        );
    }

    verify(token: string): any {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token')
        }
    }
}