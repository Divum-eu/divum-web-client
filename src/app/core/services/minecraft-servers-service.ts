import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export enum MinecraftServerType {
  VANILLA = 'VANILLA',
  PAPER = 'PAPER',
  SPIGOT = 'SPIGOT',
  FORGE = 'FORGE',
  FABRIC = 'FABRIC',
}

export enum MinecraftServerDifficulty {
  PEACEFUL = 'PEACEFUL',
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
}

export enum MinecraftServerMode {
  SURVIVAL = 'SURVIVAL',
  CREATIVE = 'CREATIVE',
  ADVENTURE = 'ADVENTURE',
  SPECTATOR = 'SPECTATOR',
}

export interface MinecraftServerInstanceConfiguration {
  memoryLimit: number;
  cpuCoresLimit: number;
  eula: boolean;
  version: string;
  type: MinecraftServerType;
  motd: string;
  difficulty: MinecraftServerDifficulty;
  mode: MinecraftServerMode;
  level: string;
  onlineMode: boolean;
  resourcePack: string;
  resourcePackSha1: string;
  resourcePackEnforce: boolean;
  enableWhitelist: boolean;
  whitelist: string[];
  overrideWhitelist: boolean;
  enableRcon: boolean;
  rconPassword: string;
  broadcastRconToOps: boolean;
  ops: string[];
  opPermissionLevel: number;
  seed: string;
  pvp: boolean;
  serverName: string;
  serverAddress: string;
}

@Injectable({
  providedIn: 'root',
})
export class MinecraftServersService {
  private _http: HttpClient = inject(HttpClient);

  createMinecraftServer(config: MinecraftServerInstanceConfiguration): Observable<string> {
    return this._http.post(`${environment.apiBaseUrl}/v1/minecraft-servers`, {configuration: config}, {
      responseType: 'text',
    });
  }
}
