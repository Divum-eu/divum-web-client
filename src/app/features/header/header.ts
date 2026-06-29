import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { UserAuthService } from '../../core/auth/user-auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, HlmButtonImports],
  templateUrl: './header.html',
})
export class Header {
  private authService = inject(UserAuthService);
  private router = inject(Router);

  isAuthenticated = this.authService.isAuthenticated;

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
