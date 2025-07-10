import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroBox } from './hero-box';

describe('HeroBox', () => {
  let component: HeroBox;
  let fixture: ComponentFixture<HeroBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroBox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroBox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
