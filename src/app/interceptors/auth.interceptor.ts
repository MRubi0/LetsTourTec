import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service'; // Asegúrate de que la ruta es correcta

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Comprueba si es una solicitud para obtener o refrescar el token
        if (request.url.endsWith('/api/token/refresh') || request.url.endsWith('/api/token/')) {
            // Si lo es, simplemente pasamos la solicitud al siguiente interceptor en la cadena
            return next.handle(request);
        }

        const authToken = this.authService.getToken(); // Obtiene el token del servicio de autenticación
        // Si existe el token, lo añadimos al header de la solicitud
        if (authToken) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${authToken}`
                }
            });
        }

        // Pasamos la solicitud al siguiente interceptor en la cadena
        return next.handle(request).pipe(
            catchError(error => {
                // Si hay un error de token expirado, intentamos refrescar el token
                if (error.status === 401) {
                    return this.handle401Error(request, next);
                }
                // Si es otro tipo de error, lo propagamos
                return throwError(() => error);
            })
        );
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        // Llamar a un método de AuthService para refrescar el token
        return this.authService.refreshToken().pipe(
            switchMap((tokens: any) => {
                // Guardamos los nuevos tokens
                this.authService.saveTokens(tokens);
                // Clonamos la solicitud con el nuevo token
                request = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${tokens.access}`
                    }
                });
                // Reintentamos la solicitud fallida con el nuevo token
                return next.handle(request);
            }),
            catchError((err) => {
                // Si algo falla al refrescar el token, cerramos la sesión
                this.authService.logout();
                // Y propagamos el error
                return throwError(() => err);
            })
        );
    }
}
