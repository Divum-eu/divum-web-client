import { TestBed } from '@angular/core/testing';

import { UserAuthService } from './user-auth.service';

describe('UserAuthService', () => {
  let service: UserAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserAuthService);
  });

  it('User auth service should be created', () => {
    expect(service).toBeTruthy();
  });
});
