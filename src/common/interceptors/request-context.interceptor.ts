import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { contextNamespace } from '../context/request-context.service';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    return contextNamespace.runAndReturn(() => {
      const user = req.user;
      if (user) {
        contextNamespace.set('user', user ? user.toJSON() : undefined);
      }
      return next.handle();
    });
  }
}
