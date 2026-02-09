import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "./jwt.service";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService){}

    canActivate(context: ExecutionContext): boolean {
       const request = context.switchToHttp().getRequest();
       const authHeader = request.headers['authorization'];

       if(!authHeader){
            throw new UnauthorizedException("Authorization header missing");
       }

       const [type, token] = authHeader.split(' ');
       if(type !== 'Bearer' || !token){
        throw new UnauthorizedException("Invalid authorization format")
       }

       const payload = this.jwtService.verify(token);
       request.user = payload;

       return true;
    }
}