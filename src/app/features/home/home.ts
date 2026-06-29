import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { UserAuthService } from '../../core/auth/user-auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, HlmCardImports, HlmButtonImports],
  templateUrl: './home.html',
})
export class Home {
  private authService = inject(UserAuthService);
  isAuthenticated = this.authService.isAuthenticated;
}
