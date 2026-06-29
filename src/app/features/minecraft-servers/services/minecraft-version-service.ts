import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const API_VERSIONS_URL = 'https://launchermeta.mojang.com/mc/game/version_manifest_v2.json';

export interface MojangVersionManifest {
  versions: { id: string; type: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class MinecraftVersionService {
  private http: HttpClient = inject(HttpClient);

  public getStableReleases(): Observable<string[]> {
    return this.http
      .get<MojangVersionManifest>(
        API_VERSIONS_URL,
      )
      .pipe(
        map(
          (res: MojangVersionManifest): string[] =>
            res.versions
              .filter((v) => v.type === 'release') // Ignore snapshots and old_beta
              .map((v) => v.id), // Extract just the "1.20.4" string
        ),
      );
  }
}
