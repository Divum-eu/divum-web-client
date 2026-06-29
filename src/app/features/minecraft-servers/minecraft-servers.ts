import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, inject, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { BrnDialogTrigger } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { MinecraftServersService, MinecraftServerStatus, MinecraftServerInstanceConfiguration } from '../../core/services/minecraft-servers-service';
import { Subscription, finalize } from 'rxjs';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { toast } from '@spartan-ng/brain/sonner';

@Component({
  selector: 'app-minecraft-servers',
  standalone: true,
  imports: [CommonModule, HlmCardImports, HlmButtonImports, HlmDialogImports, BrnDialogTrigger],
  templateUrl: './minecraft-servers.html',
})
export class MinecraftServers implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('cpuChart') cpuChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ramChart') ramChartRef!: ElementRef<HTMLCanvasElement>;

  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _mcService = inject(MinecraftServersService);
  private _platformId = inject(PLATFORM_ID);

  serverId = '';
  config = signal<MinecraftServerInstanceConfiguration | null>(null);
  status = signal<MinecraftServerStatus | null>(null);
  toggleInProgress = signal(false);
  deleting = signal(false);

  private statusSub: Subscription | null = null;
  private ignoreWs = false;
  private cpuChart: any;
  private ramChart: any;
  private maxDataPoints = 30;

  ngOnInit() {
    const idParam = this._route.snapshot.paramMap.get('id');
    if (idParam) {
      this.serverId = idParam;
    }

    if (this.serverId) {
      this._mcService.getServerConfig(this.serverId).subscribe({
        next: (res) => this.config.set(res.configuration),
        error: (err) => console.error('Failed to load server config', err),
      });

      if (isPlatformBrowser(this._platformId)) {
        this.connectWebSocket();
      }
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this._platformId)) {
      import('chart.js').then(({ Chart, registerables }: any) => {
        Chart.register(...registerables);
        this.initCharts(Chart);
      }).catch((err: any) => console.error('Error loading Chart.js', err));
    }
  }

  start() {
    if (this.toggleInProgress() || !isPlatformBrowser(this._platformId)) return;
    this.toggleInProgress.set(true);
    this.ignoreWs = false;
    this._mcService.startServer(this.serverId).subscribe({
      complete: () => {
        this.connectWebSocket();
      },
      error: () => this.toggleInProgress.set(false),
    });
  }

  stop() {
    if (this.toggleInProgress() || !isPlatformBrowser(this._platformId)) return;
    this.toggleInProgress.set(true);
    this.ignoreWs = true;
    this._mcService.stopServer(this.serverId).subscribe({
      complete: () => {
        this.disconnectWebSocket();
        this.status.set({ status: 'stopped', player_count: 0, ram_usage_mb: 0, cpu_usage_percentage: 0, ram_usage_limit_mb: 0 });
        this.ignoreWs = false;
        this.toggleInProgress.set(false);
      },
      error: () => {
        this.ignoreWs = false;
        this.toggleInProgress.set(false);
      },
    });
  }

  deleteServer() {
    if (this.deleting()) return;
    this.deleting.set(true);
    this.disconnectWebSocket();
    this._mcService.deleteServer(this.serverId)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        complete: () => {
          toast.success('Server deleted', {
            description: `"${this.config()?.serverName || this.serverId}" has been deleted.`,
            position: 'top-right',
          });
          this._router.navigate(['/minecraft-servers']);
        },
      });
  }

  private disconnectWebSocket() {
    this.statusSub?.unsubscribe();
    this._mcService.disconnect();
  }

  private connectWebSocket() {
    this.disconnectWebSocket();
    this.statusSub = this._mcService.connectToStatusStream(this.serverId).subscribe({
      next: (status) => {
        this.status.set(status);
        this.updateCharts(status);
        if (!this.ignoreWs) {
          this.toggleInProgress.set(false);
        }
        if (status.status === 'stopped' && !this.toggleInProgress()) {
          this.disconnectWebSocket();
        }
      },
    });
  }

  ngOnDestroy() {
    this.disconnectWebSocket();
    if (this.cpuChart) this.cpuChart.destroy();
    if (this.ramChart) this.ramChart.destroy();
  }

  private initCharts(ChartClass: any) {
    const timeAxis = {
      display: true,
      ticks: { maxTicksLimit: 8, color: '#a3a3a3', font: { size: 10 } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    };

    this.cpuChart = new ChartClass(this.cpuChartRef.nativeElement, {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'CPU Usage (%)', data: [], borderColor: 'rgba(59, 130, 246, 1)', backgroundColor: 'rgba(59, 130, 246, 0.2)', fill: true, tension: 0.4 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ...timeAxis },
          y: { beginAtZero: true, suggestedMax: 100, ticks: { color: '#a3a3a3', font: { size: 10 }, callback: (v: number) => v + '%' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        },
        plugins: { legend: { display: false } },
        animation: { duration: 0 },
      },
    });

    this.ramChart = new ChartClass(this.ramChartRef.nativeElement, {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'RAM Usage (MB)', data: [], borderColor: 'rgba(16, 185, 129, 1)', backgroundColor: 'rgba(16, 185, 129, 0.2)', fill: true, tension: 0.4 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ...timeAxis },
          y: { beginAtZero: true, ticks: { color: '#a3a3a3', font: { size: 10 }, callback: (v: number) => v + ' MB' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        },
        plugins: { legend: { display: false } },
        animation: { duration: 0 },
      },
    });
  }

  private updateCharts(status: MinecraftServerStatus) {
    if (!this.cpuChart || !this.ramChart) return;

    const timeLabel = new Date().toLocaleTimeString();

    this.cpuChart.data.labels!.push(timeLabel);
    this.cpuChart.data.datasets[0].data.push(status.cpu_usage_percentage);
    if (this.cpuChart.data.labels!.length > this.maxDataPoints) {
      this.cpuChart.data.labels!.shift();
      this.cpuChart.data.datasets[0].data.shift();
    }
    this.cpuChart.update();

    this.ramChart.data.labels!.push(timeLabel);
    this.ramChart.data.datasets[0].data.push(status.ram_usage_mb);
    if (this.ramChart.data.labels!.length > this.maxDataPoints) {
      this.ramChart.data.labels!.shift();
      this.ramChart.data.datasets[0].data.shift();
    }
    this.ramChart.update();
  }
}
