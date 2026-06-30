import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BrnDialogTrigger } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { MinecraftServersService, MinecraftServerInstanceResponse } from '../../core/services/minecraft-servers-service';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { CreateServerBtn } from '../minecraft-servers/components/create-server-btn/create-server-btn';
import { toast } from '@spartan-ng/brain/sonner';
import { finalize } from 'rxjs';
import { EditServerBtn } from '../minecraft-servers/components/edit-server-btn/edit-server-btn';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-minecraft-server-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HlmCardImports,
    HlmAlertImports,
    HlmButtonImports,
    HlmDialogImports,
    BrnDialogTrigger,
    CreateServerBtn,
    EditServerBtn,
  ],
  templateUrl: './minecraft-server-list.html',
})
export class MinecraftServerList implements OnInit {
  private _mcService = inject(MinecraftServersService);
  private _platformId = inject(PLATFORM_ID);
  private _router: Router = inject(Router);

  servers = signal<MinecraftServerInstanceResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  deleting = signal(false);
  private _loadingTimer: ReturnType<typeof setTimeout> | null = null;

  loadServers(): void {
    this._loadingTimer = setTimeout(() => this.loading.set(true), 500);

    this._mcService.getAllServers().subscribe({
      next: (data) => {
        this.servers.set(data);
        this._clearLoading();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this._router.navigate(['/login']);
          this._clearLoading();
          return;
        }

        this.error.set(
          "Failed to load servers.",
        )

        this._clearLoading();
      }
    })
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    this.loadServers();
  }

  private _clearLoading() {
    if (this._loadingTimer !== null) {
      clearTimeout(this._loadingTimer);
      this._loadingTimer = null;
    }
    this.loading.set(false);
  }

  confirmDelete(server: MinecraftServerInstanceResponse) {
    this.deleting.set(true);
    this._mcService
      .deleteServer(server.id)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        complete: () => {
          this.servers.update((list) => list.filter((s) => s.id !== server.id));
          toast.success('Server deleted', {
            description: `"${server.configuration.serverName}" has been deleted.`,
            position: 'top-right',
          });
        },
        error: () => {
          toast.error('Failed to delete server', {
            position: 'top-right',
          });
        },
      });
  }
}
