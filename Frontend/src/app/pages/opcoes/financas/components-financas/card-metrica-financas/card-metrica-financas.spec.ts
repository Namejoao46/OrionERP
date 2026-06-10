import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardMetricaFinancas } from './card-metrica-financas';

describe('CardMetricaFinancas', () => {
  let component: CardMetricaFinancas;
  let fixture: ComponentFixture<CardMetricaFinancas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardMetricaFinancas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardMetricaFinancas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
