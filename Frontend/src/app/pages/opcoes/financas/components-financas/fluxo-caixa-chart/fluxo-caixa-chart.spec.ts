import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FluxoCaixaChart } from './fluxo-caixa-chart';

describe('FluxoCaixaChart', () => {
  let component: FluxoCaixaChart;
  let fixture: ComponentFixture<FluxoCaixaChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FluxoCaixaChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FluxoCaixaChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
