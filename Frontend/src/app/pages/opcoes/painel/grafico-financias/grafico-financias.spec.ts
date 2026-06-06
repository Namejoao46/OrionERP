import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoFinancias } from './grafico-financias';

describe('GraficoFinancias', () => {
  let component: GraficoFinancias;
  let fixture: ComponentFixture<GraficoFinancias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoFinancias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoFinancias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
