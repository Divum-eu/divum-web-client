import { Routes } from '@angular/router';
import { MinecraftServers } from './minecraft-servers/minecraft-servers';
import { Home } from './home/home';
import { Register } from './register/register';
import { Login } from './login/login';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'register', component: Register},
  { path: 'login', component: Login},
  { path: 'minecraft-servers', component: MinecraftServers },
];
