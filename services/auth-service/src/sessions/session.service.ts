import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class SessionService {
    constructor(private readonly prisma: PrismaService){}
    
    async createSession(params: {
        accountId: string;
        refreshTokenHash: string;
        expiresAt: Date;
        deviceId?: string;
        userAgent?: string;
        ipAddress?: string;
    }){
        return await this.prisma.session.create({data: params});
    }
    async findValidSession(accountId: string){
        return await this.prisma.session.findMany({
            where: {
                accountId,
                revokedAt: null,
                expiresAt: {gt: new Date()}
            }
        })
    }
    async findSessionByRefreshTokenHash(refreshTokenHash: string){
        return await this.prisma.session.findFirst({
            where: {
                refreshTokenHash,
                revokedAt: null,
                expiresAt: {gt: new Date()},
            },
            include:{
                account: true
            }
        })
    }
    async rotateSession(sessionId: string, newHash: string, newExpiresAt: Date){
        return await this.prisma.session.update({
            where: {
                id: sessionId
            },
            data: {refreshTokenHash: newHash, expiresAt: newExpiresAt}
        })
    }
    async revokeSession(sessionId: string){
        return await this.prisma.session.update({
            where:{id: sessionId},
            data: {
                revokedAt: new Date()
            }
        })
    }
}