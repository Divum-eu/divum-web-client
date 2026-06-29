import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { credentialsInterceptor } from './core/http/credentials.interceptor';
import { authInterceptor } from './core/http/auth.interceptor';
import { provideSpartanHlm } from '@spartan-ng/helm/utils';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        credentialsInterceptor,
        authInterceptor,
      ])
    ),
    provideSpartanHlm(), // fixes z-index conflict between sonner(toast messages) and dialog windows
  ],
};
