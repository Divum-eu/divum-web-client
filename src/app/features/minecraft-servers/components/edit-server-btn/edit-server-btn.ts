import {
  Component,
  inject,
  input,
  OnInit,
  output,
  Signal,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import {
  HlmDialog,
  HlmDialogClose,
  HlmDialogContent,
  HlmDialogDescription,
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogPortal,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import {
  DEFAULT_SERVER_STATE,
  MinecraftServerFormState,
  MinecraftServerInstanceConfiguration,
  MinecraftServersService,
} from '../../../../core/services/minecraft-servers-service';
import {
  form,
  FormField,
  FormRoot,
  max,
  min,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { finalize } from 'rxjs';
import { toast } from '@spartan-ng/brain/sonner';
import { HttpErrorResponse } from '@angular/common/http';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEdit } from '@ng-icons/lucide';
import { Router } from '@angular/router';
import { MinecraftVersionService } from '../../../../core/services/minecraft-version-service';
import { HlmField, HlmFieldError, HlmFieldGroup, HlmFieldLabel } from '@spartan-ng/helm/field';
import { HlmButton } from '@spartan-ng/helm/button';
import { BrnDialogTrigger } from '@spartan-ng/brain/dialog';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSlider } from '@spartan-ng/helm/slider';

@Component({
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
  providers: [provideIcons({ lucideEdit })],
  selector: 'edit-server-btn',
  styleUrl: './edit-server-btn.css',
  templateUrl: './edit-server-btn.html',
})
export class EditServerBtn implements OnInit {
  @ViewChild('editServerDialog', { read: HlmDialog }) public dialog!: HlmDialog;

  public server = input.required<any>();
  public onSaved = output<void>();

  private _minecraftServersService: MinecraftServersService = inject(MinecraftServersService);
  private _versionService: MinecraftVersionService = inject(MinecraftVersionService);
  private _router: Router = inject(Router);

  public availableVersions = signal<string[]>(['LATEST']);

  private _isLoading: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();

  protected readonly _editMinecraftServerModel = signal<MinecraftServerFormState>({
    ...DEFAULT_SERVER_STATE,
  });

  protected readonly editMinecraftServerForm = form(
    this._editMinecraftServerModel,
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
          const formState = this._editMinecraftServerModel();

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
            .updateMinecraftServer(this.server().id, payload)
            .pipe(finalize(() => this._isLoading.set(false)))
            .subscribe({
              next: () => {
                this.dialog.close();
                this.onSaved.emit();
                toast.success('Server updated successfully.', { position: 'top-right' });
              },
              error: (err: HttpErrorResponse) => {
                if (err.status === 401 || err.status === 400) {
                  toast.error('Login needed', {
                    description: 'Your session has expired. Please log in again.',
                    position: 'top-right',
                  });
                  this._router.navigate(['/login']);
                  return;
                }

                let errorData = err.error;
                if (typeof errorData === 'string') {
                  try {
                    errorData = JSON.parse(errorData);
                  } catch (e) {
                    errorData = { title: 'Error', detail: 'An unexpected error occurred.' };
                  }
                }

                toast.error(errorData.title || 'Error', {
                  description: errorData.detail || 'Something went wrong.',
                  position: 'top-right',
                });
              },
            });
        },
      },
    },
  );

  protected onMemoryLimitChange(newValues: number[]) {
    this._editMinecraftServerModel.update((model) => ({
      ...model,
      memoryLimit: newValues[0],
    }));
  }

  protected onCpuCoresLimitChange(newValues: number[]) {
    this._editMinecraftServerModel.update((model) => ({
      ...model,
      cpuCoresLimit: newValues[0],
    }));
  }

  ngOnInit(): void {
    this._versionService.getStableReleases().subscribe({
      next: (versions) => {
        this.availableVersions.set(['LATEST', ...versions]);
      },
      error: (err) => console.error('Failed to fetch Mojang versions:', err),
    });

    const config = this.server().configuration;
    this._editMinecraftServerModel.set({
      ...DEFAULT_SERVER_STATE,
      ...config,

      memoryLimit: config.memoryLimit ? (config.memoryLimit / 1024) : 2,
      whitelist: config.whitelist ? config.whitelist.join(', ') : '',
      ops: config.ops ? config.ops.join(', ') : '',
      opPermissionLevel: config.opPermissionLevel.toString(),
      serverAddress: config.serverAddress.replace('.divum.eu', ''),
    });
  }
}
