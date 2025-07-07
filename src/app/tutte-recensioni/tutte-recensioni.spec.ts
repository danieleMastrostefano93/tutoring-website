import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutteRecensioni } from './tutte-recensioni';

describe('TutteRecensioni', () => {
  let component: TutteRecensioni;
  let fixture: ComponentFixture<TutteRecensioni>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutteRecensioni]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutteRecensioni);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
