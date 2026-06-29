import { TestBed } from '@angular/core/testing';

import { MinecraftServersService } from './minecraft-servers-service';

describe('MinecraftServersService', () => {
  let service: MinecraftServersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MinecraftServersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
