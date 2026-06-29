import { Component } from '@angular/core';
import { CreateServerBtn } from './components/create-server-btn/create-server-btn';

@Component({
  selector: 'app-minecraft-servers',
  templateUrl: './minecraft-servers.html',
  styleUrl: './minecraft-servers.css',
  standalone: true,
  imports: [
    CreateServerBtn,
  ],
})
export class MinecraftServers {}
