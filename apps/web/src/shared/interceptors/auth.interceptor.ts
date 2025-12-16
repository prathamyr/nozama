import { HttpInterceptorFn } from '@angular/common/http';

// Interceptor to add withCredentials to all HTTP requests
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone request and add withCredentials
  const clonedReq = req.clone({
    withCredentials: true  // Important for cookies (cart_token)
  });
  
  return next(clonedReq);
};