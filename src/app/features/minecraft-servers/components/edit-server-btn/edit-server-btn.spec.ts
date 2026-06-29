import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditServerBtn } from './edit-server-btn';

describe('EditServerBtn', () => {
  let component: EditServerBtn;
  let fixture: ComponentFixture<EditServerBtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditServerBtn],
    }).compileComponents();

    fixture = TestBed.createComponent(EditServerBtn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
