import { Component, inject, signal, WritableSignal } from '@angular/core';
import {
  ChildFieldContext,
  email,
  form,
  FormField,
  FormRoot,
  maxLength,
  minLength, pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCard, HlmCardContent, HlmCardDescription, HlmCardFooter, HlmCardHeader, HlmCardTitle } from '@spartan-ng/helm/card';
import { HlmField, HlmFieldError, HlmFieldGroup, HlmFieldLabel } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { Router, RouterLink } from '@angular/router';
import { RegisterUserState, UserAuthService } from '../../core/auth/user-auth.service';
import { toast } from '@spartan-ng/brain/sonner';

export interface RegisterUserModel {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrl: './register.css',
  imports: [
    FormRoot,
    HlmButton,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardFooter,
    HlmCardHeader,
    HlmCardTitle,
    HlmField,
    HlmFieldError,
    HlmFieldGroup,
    HlmFieldLabel,
    HlmInput,
    FormField,
    RouterLink,
  ],
})
export class Register {
  private readonly _userAuthService: UserAuthService = inject(UserAuthService);
  private readonly _router: Router = inject(Router);

  isLoading: WritableSignal<boolean> = signal<boolean>(false);

  protected readonly _model: WritableSignal<RegisterUserModel> = signal({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  protected readonly form = form(
    this._model,
    (schemaPath) => {
      required(schemaPath.username, { message: 'Username is required' });
      minLength(schemaPath.username, 5, { message: 'Username must have at least 5 characters' });
      maxLength(schemaPath.username, 30, { message: 'Username must have maximum 30 characters' });

      required(schemaPath.email, { message: 'Email is required' });
      email(schemaPath.email, { message: 'Must be a valid email' });

      required(schemaPath.password, { message: 'Password is required' });
      pattern(schemaPath.password, /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/, {
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, one digit and one special character.',
      });

      required(schemaPath.passwordConfirm, { message: 'Password confirmation is required' });
      validate(schemaPath.passwordConfirm, (ctx) => {
        const passwordValue = ctx.valueOf(schemaPath.password);
        const passwordConfirmValue = ctx.value();

        if (passwordValue && passwordConfirmValue && passwordValue !== passwordConfirmValue) {
          return {
            kind: 'validate',
            message: "Passwords don't match",
          };
        }

        return null;
      });
    },
    {
      submission: {
        action: async () => {
          this.isLoading.set(true);

          const model: RegisterUserModel = this._model();
          const state: RegisterUserState = await this._userAuthService.registerUser({
            username: model.username,
            email: model.email,
            password: model.password,
          });

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
