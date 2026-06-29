import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateServerBtn } from './create-server-btn';

describe('CreateServerBtn', () => {
  let component: CreateServerBtn;
  let fixture: ComponentFixture<CreateServerBtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateServerBtn],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateServerBtn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
