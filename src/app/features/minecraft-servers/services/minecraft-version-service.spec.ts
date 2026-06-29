import { TestBed } from '@angular/core/testing';

import { MinecraftVersionService } from './minecraft-version-service';

describe('MinecraftVersionService', () => {
  let service: MinecraftVersionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MinecraftVersionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
