import { Routes } from '@angular/router';
import { MinecraftServers } from './features/minecraft-servers/minecraft-servers';
import { Home } from './features/home/home';
import { Register } from './features/register/register';
import { Login } from './features/login/login';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'register', component: Register},
  { path: 'login', component: Login},
  { path: 'minecraft-servers', component: MinecraftServers },
];
