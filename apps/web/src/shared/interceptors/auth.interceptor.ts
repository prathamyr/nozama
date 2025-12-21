import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Interceptor to add withCredentials to all HTTP requests
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const user = auth.getCurrentUser();

  // Clone request and add withCredentials
  const clonedReq = req.clone({
    withCredentials: true, // Important for cookies (cart_token)
    setHeaders: user?._id ? { 'x-user-id': user._id } : {}
  });

  return next(clonedReq);
};