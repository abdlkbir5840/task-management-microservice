import { BadRequestException, ConflictException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { AccountStatus } from "src/generated/prisma/enums";
import { PasswordService } from "src/security/password.service";
import { RabbitMQService } from "src/messaging/abbitmq.service";
import { AuthEvents } from "src/messaging/events";
import { JwtPayload, JwtService } from "src/security/jwt.service";
import { createHash } from "crypto";
import { SessionService } from "src/sessions/session.service";

@Injectable()
export class AuthService{
    private readonly logger = new Logger(AuthService.name)
    constructor(private readonly prisma: PrismaService, private readonly passwordService: PasswordService, private readonly rabbitMqService: RabbitMQService, private readonly jwtService: JwtService, private readonly sessionService: SessionService){}
    async register(dto: RegisterDto){
        try {
            // check first if email already exist
            const existingAccount = await this.prisma.account.findUnique({
                where: {email: dto.email}
            })
            if(existingAccount){
                if(existingAccount.status === AccountStatus.SUSPENDED){
                    this.logger.error(`User try to register with email that already Suspended, email: ${existingAccount.email}. Id: ${existingAccount.id}`)
                    throw new UnauthorizedException('Account With this Email Has Been Suspended')
                }else{
                    this.logger.error(`User try to register with email that already exist, email: ${existingAccount.email}. Id: ${existingAccount.id}`)
                    throw new ConflictException('Account With Email Already Exist')
                }
            }
            // else hash password
            const passwordHash = await this.passwordService.hashPassword(dto.password);
            //then create account
            const account = await this.prisma.account.create({
                data:{
                    email: dto.email,
                    passwordHash: passwordHash,
                }
            })
            this.logger.log(`New Account Created with Email: ${account.email}, Id: ${account.id}, Created Date: ${account.createdAt}`)

            // emite creation event to rabbitMQ
            await this.rabbitMqService.emit(AuthEvents.USER_REGISTERD, {
                accountId: account.id,
                email: account.email,
                registredAt: account.createdAt,
            })
        } catch (error) {
            this.logger.error(`Registration Failed: ${error.message}`)
            throw error
        }
    }
    async login(dto: LoginDto, meta: any){
        try {
            // check if account exist by email
            const account = await this.prisma.account.findUnique({
                where:{email: dto.email}
            })
            if(!account){
                this.logger.error("Invalid Credentials")
                throw new UnauthorizedException('Invalid Credentials')
            }
            // check if account status active
            if(account.status === AccountStatus.SUSPENDED){
                this.logger.error('Account Suspeneded')
                throw new UnauthorizedException('Account Suspeneded')
            }
            // then  check password validation
            const isPasswordValid = await this.passwordService.comparePassword(dto.password, account.passwordHash)
            if(!isPasswordValid){
                this.logger.error('Invalid Credentials')
                throw new UnauthorizedException('Invalid Credentials')
            }
            // finally create new session with necessary tokens
            const payload: JwtPayload = {
                sub: account.id,
                email: account.email,
            }
            const {accessToken, refreshToken, refreshTokenHash, expiresAt} = this.jwtService.generateTokenPair(payload);
            const params =  {
                accountId: account.id,
                refreshTokenHash: refreshTokenHash,
                expiresAt: expiresAt,
                deviceId: meta?.deviceId,
                userAgent: meta?.userAgent,
                ipAddress: meta?.ipAddress,
            }
            await this.sessionService.createSession(params)
            
            await this.rabbitMqService.emit(AuthEvents.USER_LOGGED_IN, {
                accountId: account.id,
                email: account.email,
                loggedInAt: new Date().toISOString(),
            })

            return {accountId: account.id, accessToken, refreshToken}
        } catch (error) {
            this.logger.error(`Login failed: ${error.message}`);
            throw error;
        }
    }
    async refresh(refreshToken: string){
        try {
            // verify session existing, experation or is it revoked
            const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex');

            const session = await this.sessionService.findSessionByRefreshTokenHash(refreshTokenHash)
            if(!session){
                throw new UnauthorizedException('Invalid or expired refresh token')
            }
            //check account status
            if(session.account.status === AccountStatus.SUSPENDED){
                this.logger.error(`Session attempt with suspended account ${session.account.email}`)
                throw new UnauthorizedException('Session attempt with suspended account')
            }
            // create new session
            const payload: JwtPayload = {
                sub: session.account.id,
                email: session.account.email,
            }
            const {accessToken, refreshToken: newRefresh, refreshTokenHash: newHash, expiresAt} = this.jwtService.generateTokenPair(payload);
            
            await this.sessionService.rotateSession(session.id, newHash, expiresAt);
            this.logger.log(`Sessions refreshed for: ${session.account.email}`)
            return {accessToken, refreshToken: newRefresh}

        } catch (error) {
            this.logger.error(`Refresh session failed: ${error.message}`);
            throw error;
        }
    }
    async logout(refreshToken: string){
        try {
            if(!refreshToken){
                throw new BadRequestException('Refresh token is required')
            }

            const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex');

            const session = await this.sessionService.findSessionByRefreshTokenHash(refreshTokenHash)
            if(session){
                this.sessionService.revokeSession(session.id);
                this.logger.log(`Session revoked for account: ${session.account.id}`)
            }
            return {
                message: 'Logged out successfully'
            }
        } catch (error) {
            this.logger.error(`Logout failed: ${error.message}`);
            throw error;
        }
    }
    async me(accountId: string){
        try {
            const account = await this.prisma.account.findUnique({
                where: {id: accountId},
                include: {sessions: true}
            })
            if(!account){
                throw new UnauthorizedException("Account not found")
            }

            if(account.status === AccountStatus.SUSPENDED){
                throw new UnauthorizedException('Account had been suspended')
            }
            const {passwordHash, ...accountWithoutPassword} = account
            return accountWithoutPassword
        } catch (error) {
            this.logger.error(`Failed to get account information: ${error.message}`)
            throw error
        }
    }
}