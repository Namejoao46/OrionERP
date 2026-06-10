import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardMetricaRh } from './card-metrica-rh';

describe('CardMetricaRh', () => {
  let component: CardMetricaRh;
  let fixture: ComponentFixture<CardMetricaRh>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardMetricaRh]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardMetricaRh);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
