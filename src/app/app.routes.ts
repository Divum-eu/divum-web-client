import { Routes } from '@angular/router';
import { MinecraftServers } from './features/minecraft-servers/minecraft-servers';
import { MinecraftServerList } from './features/minecraft-server-list/minecraft-server-list';
import { Home } from './features/home/home';
import { Register } from './features/register/register';
import { Login } from './features/login/login';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'minecraft-servers', component: MinecraftServerList, canActivate: [authGuard] },
  { path: 'minecraft-servers/:id', component: MinecraftServers, canActivate: [authGuard] },
];
