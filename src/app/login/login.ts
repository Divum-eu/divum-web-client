import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { UserAuthService, LoginUserCredentials, LoginUserState } from '../user-auth.service';
import { toast } from '@spartan-ng/brain/sonner';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'spartan-login-form',
  imports: [
    FormRoot,
    FormField,
    HlmCardImports,
    HlmFieldImports,
    HlmButtonImports,
    HlmInputImports,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
})
export class Login {
  protected readonly _userAuthService: UserAuthService = inject(UserAuthService);
  protected readonly _router: Router = inject(Router);

  public isLoading: WritableSignal<boolean> = signal<boolean>(false);

  protected readonly _model: WritableSignal<LoginUserCredentials> = signal({
    username: '',
    password: '',
  });

  public readonly form = form(
    this._model,
    (schemaPath) => {
      required(schemaPath.username, { message: 'Username is required.' });

      required(schemaPath.password, { message: 'Password is required.' });
    },
    {
      submission: {
        action: async () => {
          this.isLoading.set(true);
          const state: LoginUserState = await this._userAuthService.loginUser(this._model());

          if (state.success) {
            await this._router.navigate(['/']);
          } else {
            toast.error(state.errorTitle, {
              description: state.errorDetail,
              position: 'top-right',
            });
          }

          this.isLoading.set(false);
        },
      },
    },
  );
}
