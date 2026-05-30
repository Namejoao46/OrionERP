import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.userRole$.pipe(
      take(1),
      map(role => {
        if (role && allowedRoles.includes(role)) return true;
        
        router.navigate(['/home']); // Redireciona se não tiver permissão
        return false;
      })
    );
  };
};