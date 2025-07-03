import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferCarousel } from './offer-carousel';

describe('OfferCarousel', () => {
  let component: OfferCarousel;
  let fixture: ComponentFixture<OfferCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferCarousel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferCarousel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
