import { Component, inject, Signal, signal, ViewChild, WritableSignal } from '@angular/core';
import { BrnDialogTrigger } from '@spartan-ng/brain/dialog';
import { form, FormField, FormRoot, max, min, pattern, required, validate } from '@angular/forms/signals';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogClose, HlmDialogContent, HlmDialogDescription, HlmDialogFooter, HlmDialogHeader,
  HlmDialogPortal, HlmDialogTitle
} from '@spartan-ng/helm/dialog';
import { HlmField, HlmFieldError, HlmFieldGroup, HlmFieldLabel } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSlider } from '@spartan-ng/helm/slider';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { MinecraftVersionService } from '../../../../core/services/minecraft-version-service';
import {
  MinecraftServerDifficulty,
  MinecraftServerInstanceConfiguration,
  MinecraftServerMode,
  MinecraftServersService,
  MinecraftServerType,
} from '../../../../core/services/minecraft-servers-service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { toast } from '@spartan-ng/brain/sonner';
import { HttpErrorResponse } from '@angular/common/http';
import { lucidePlus } from '@ng-icons/lucide';

export interface MinecraftServerFormState extends Omit<
  MinecraftServerInstanceConfiguration,
  'whitelist' | 'ops' | 'opPermissionLevel'
> {
  whitelist: string;
  ops: string;
  opPermissionLevel: string;
}

const DEFAULT_SERVER_STATE: MinecraftServerFormState = {
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

@Component({
  selector: 'create-server-btn',
  imports: [
    HlmButton,
    NgIcon,
    HlmField,
    HlmFieldGroup,
    HlmDialogHeader,
    HlmDialogFooter,
    HlmDialogContent,
    HlmDialog,
    HlmDialogPortal,
    BrnDialogTrigger,
    HlmDialogTitle,
    HlmFieldLabel,
    HlmInput,
    HlmDialogClose,
    HlmDialogDescription,
    HlmSlider,
    FormRoot,
    FormField,
    HlmFieldError,
  ],
  providers: [provideIcons({ lucidePlus })],
  templateUrl: './create-server-btn.html',
  styleUrl: './create-server-btn.css',
})
export class CreateServerBtn {
  @ViewChild('createServerDialog', { read: HlmDialog }) public dialog!: HlmDialog;

  private _versionService: MinecraftVersionService = inject(MinecraftVersionService);
  private _minecraftServersService: MinecraftServersService = inject(MinecraftServersService);
  private _router: Router = inject(Router);

  public availableVersions = signal<string[]>(['LATEST']);
  private _isLoading: WritableSignal<boolean> = signal<boolean>(false);

  protected readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();

  protected readonly _createMinecraftServerModel = signal<MinecraftServerFormState>({
    ...DEFAULT_SERVER_STATE,
  });

  protected readonly createMinecraftServerForm = form(
    this._createMinecraftServerModel,
    (schemaPath) => {
      required(schemaPath.memoryLimit, { message: 'Memory limit is required.' });
      min(schemaPath.memoryLimit, 1, { message: 'Minimum RAM is 1 GB.' });
      max(schemaPath.memoryLimit, 8, { message: 'Maximum RAM is 8 GB.' });

      required(schemaPath.cpuCoresLimit, { message: 'CPU cores limit is required.' });
      min(schemaPath.cpuCoresLimit, 0.5, { message: 'Minimum of 0.5 CPU cores is required.' });
      max(schemaPath.cpuCoresLimit, 8, { message: 'Maximum of 8 CPU cores is allowed.' });

      validate(schemaPath.eula, (ctx) => {
        if (!ctx.value()) {
          return { kind: 'eulaRequired', message: 'Accepting the EULA is required.' };
        }
        return null;
      });

      required(schemaPath.serverName, { message: 'Server name is required.' });
      required(schemaPath.serverAddress, { message: 'Server address is required.' });
      pattern(schemaPath.serverAddress, /^[a-zA-Z0-9-]+$/, {
        message: 'Address can only contain letters, numbers, and hyphens.',
      });
      required(schemaPath.version, { message: 'Server version is required.' });
      required(schemaPath.type, { message: 'Server type is required.' });
      required(schemaPath.difficulty, { message: 'Difficulty is required.' });
      required(schemaPath.mode, { message: 'Server mode is required.' });
      required(schemaPath.rconPassword, { message: 'Server RCON password is required.' });
    },
    {
      submission: {
        action: async () => {
          this._isLoading.set(true);
          const formState = this._createMinecraftServerModel();

          const payload: MinecraftServerInstanceConfiguration = {
            ...formState,
            memoryLimit: Math.round(formState.memoryLimit * 1024),

            serverAddress: formState.serverAddress + '.divum.eu',

            whitelist: formState.whitelist
              ? formState.whitelist
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [],
            ops: formState.ops
              ? formState.ops
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [],
            opPermissionLevel: parseInt(formState.opPermissionLevel, 10),
          };

          this._minecraftServersService
            .createMinecraftServer(payload)
            .pipe(finalize(() => this._isLoading.set(false)))
            .subscribe({
              next: (serverId: string) => {
                this.dialog.close();
                this._createMinecraftServerModel.set({ ...DEFAULT_SERVER_STATE });
                toast.success('Minecraft server created!', {
                  position: 'top-right',
                });
              },
              error: (err: HttpErrorResponse) => {
                if (err.status === 401) {
                  toast.error('Login needed', {
                    description: 'Login to access this functionality',
                    position: 'top-right',
                  });
                  this._router.navigate(['/login']);
                  return;
                }

                let errorData = JSON.parse(err.error);
                toast.error(errorData.title, {
                  description: errorData.detail,
                  position: 'top-right',
                });
              },
            });
        },
      },
    },
  );

  protected onMemoryLimitChange(newValues: number[]) {
    this._createMinecraftServerModel.update((model) => ({
      ...model,
      memoryLimit: newValues[0],
    }));
  }

  protected onCpuCoresLimitChange(newValues: number[]) {
    this._createMinecraftServerModel.update((model) => ({
      ...model,
      cpuCoresLimit: newValues[0],
    }));
  }

  ngOnInit() {
    this._versionService.getStableReleases().subscribe({
      next: (versions) => {
        this.availableVersions.set(['LATEST', ...versions]);
      },
      error: (err) => console.error('Failed to fetch Mojang versions:', err),
    });
  }
}
