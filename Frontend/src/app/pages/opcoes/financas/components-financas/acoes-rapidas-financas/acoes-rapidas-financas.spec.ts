import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcoesRapidasFinancas } from './acoes-rapidas-financas';

describe('AcoesRapidasFinancas', () => {
  let component: AcoesRapidasFinancas;
  let fixture: ComponentFixture<AcoesRapidasFinancas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcoesRapidasFinancas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcoesRapidasFinancas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
