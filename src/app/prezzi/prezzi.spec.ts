import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Prezzi } from './prezzi';

describe('Prezzi', () => {
  let component: Prezzi;
  let fixture: ComponentFixture<Prezzi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Prezzi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Prezzi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
