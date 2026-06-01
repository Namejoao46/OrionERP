import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvolucaoVendas } from './evolucao-vendas';

describe('EvolucaoVendas', () => {
  let component: EvolucaoVendas;
  let fixture: ComponentFixture<EvolucaoVendas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvolucaoVendas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvolucaoVendas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
