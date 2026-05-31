import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinecraftServers } from './minecraft-servers';

describe('MinecraftServers', () => {
  let component: MinecraftServers;
  let fixture: ComponentFixture<MinecraftServers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinecraftServers],
    }).compileComponents();

    fixture = TestBed.createComponent(MinecraftServers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create minecraft-servers', () => {
    expect(component).toBeTruthy();
  });
});
