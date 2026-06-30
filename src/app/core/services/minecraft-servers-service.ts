import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
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

export interface MinecraftServerFormState extends Omit<
  MinecraftServerInstanceConfiguration,
  'whitelist' | 'ops' | 'opPermissionLevel'
> {
  whitelist: string;
  ops: string;
  opPermissionLevel: string;
}

export const DEFAULT_SERVER_STATE: MinecraftServerFormState = {
  memoryLimit: 2, // in GBs
  cpuCoresLimit: 2.0,
  eula: false,
  version: 'LATEST',
  type: MinecraftServerType.VANILLA,
  motd: 'Brought to you by Divum.eu!',
  difficulty: MinecraftServerDifficulty.NORMAL,
  mode: MinecraftServerMode.SURVIVAL,
  level: 'world',
  onlineMode: true,
  resourcePack: '',
  resourcePackSha1: '',
  resourcePackEnforce: false,
  enableWhitelist: false,
  whitelist: '',
  overrideWhitelist: false,
  enableRcon: false,
  rconPassword: '',
  broadcastRconToOps: false,
  ops: '',
  opPermissionLevel: '4',
  seed: '',
  pvp: true,
  serverName: '',
  serverAddress: '',
};

@Injectable({
  providedIn: 'root',
})
export class MinecraftServersService {
  private _http: HttpClient = inject(HttpClient);
  private _platformId = inject(PLATFORM_ID);
  private wsSubject: WebSocketSubject<MinecraftServerStatus> | null = null;

  createMinecraftServer(config: MinecraftServerInstanceConfiguration): Observable<string> {
    return this._http.post(
      `${environment.apiBaseUrl}/v1/minecraft-servers`,
      { configuration: config },
      {
        responseType: 'text',
      },
    );
  }
  
  updateMinecraftServer(id: string, config: MinecraftServerInstanceConfiguration):
    Observable<MinecraftServerInstanceResponse>
  {
    return this._http.patch<MinecraftServerInstanceResponse>(`${environment.apiBaseUrl}/v1/minecraft-servers/${id}`, {configuration: config});
  }

  getAllServers(): Observable<MinecraftServerInstanceResponse[]> {
    return this._http.get<MinecraftServerInstanceResponse[]>(
      `${environment.apiBaseUrl}/v1/minecraft-servers`,
    );
  }

  getServerConfig(id: string): Observable<MinecraftServerInstanceResponse> {
    return this._http.get<MinecraftServerInstanceResponse>(
      `${environment.apiBaseUrl}/v1/minecraft-servers/${id}`,
    );
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
    const token = isPlatformBrowser(this._platformId)
      ? (localStorage.getItem('accessToken') ?? '')
      : '';
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

