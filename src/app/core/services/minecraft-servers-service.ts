import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

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

export interface MinecraftServerInstanceResponse {
  id: string;
  configuration: MinecraftServerInstanceConfiguration;
}

export interface MinecraftServerStatus {
  status: string;
  player_count: number;
  ram_usage_mb: number;
  cpu_usage_percentage: number;
  ram_usage_limit_mb: number;
}

@Injectable({
  providedIn: 'root',
})
export class MinecraftServersService {
  private _http: HttpClient = inject(HttpClient);
  private _platformId = inject(PLATFORM_ID);
  private wsSubject: WebSocketSubject<MinecraftServerStatus> | null = null;

  getAllServers(): Observable<MinecraftServerInstanceResponse[]> {
    return this._http.get<MinecraftServerInstanceResponse[]>(`${environment.apiBaseUrl}/v1/minecraft-servers`);
  }

  getServerConfig(id: string): Observable<MinecraftServerInstanceResponse> {
    return this._http.get<MinecraftServerInstanceResponse>(`${environment.apiBaseUrl}/v1/minecraft-servers/${id}`);
  }

  createMinecraftServer(config: MinecraftServerInstanceConfiguration): Observable<string> {
    return this._http.post(`${environment.apiBaseUrl}/v1/minecraft-servers`, {configuration: config}, {
      responseType: 'text',
    });
  }

  startServer(id: string): Observable<void> {
    return this._http.post<void>(`${environment.apiBaseUrl}/v1/minecraft-servers/${id}/start`, {});
  }

  stopServer(id: string): Observable<void> {
    return this._http.post<void>(`${environment.apiBaseUrl}/v1/minecraft-servers/${id}/stop`, {});
  }

  deleteServer(id: string): Observable<void> {
    return this._http.delete<void>(`${environment.apiBaseUrl}/v1/minecraft-servers/${id}`);
  }

  connectToStatusStream(id: string): Observable<MinecraftServerStatus> {
    const wsUrl = `${environment.wsBaseUrl}/v1/minecraft-servers/${id}/status/ws`;
    const token = isPlatformBrowser(this._platformId) ? localStorage.getItem('accessToken') ?? '' : '';
    this.wsSubject = webSocket<MinecraftServerStatus>({
      url: wsUrl,
      protocol: token ? [token] : [],
    });
    return this.wsSubject.asObservable();
  }

  disconnect(): void {
    this.wsSubject?.complete();
    this.wsSubject = null;
  }
}
