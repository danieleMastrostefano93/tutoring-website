import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Materiale } from './materiale';

describe('Materiale', () => {
  let component: Materiale;
  let fixture: ComponentFixture<Materiale>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Materiale]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Materiale);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
