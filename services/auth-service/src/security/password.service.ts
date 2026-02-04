import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt'
@Injectable()
export class PasswordService {
    private readonly SALT_ROUNDS = 12;

    async hashPassword(plainPassword: string):Promise<string>{
        return bcrypt.hash(plainPassword, this.SALT_ROUNDS);
    }
    
    async comparePassword(plainPassword: string, hashPassword: string):Promise<boolean>{
        return bcrypt.compare(plainPassword, hashPassword);
    }
}