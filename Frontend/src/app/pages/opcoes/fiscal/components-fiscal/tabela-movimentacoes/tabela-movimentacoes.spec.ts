import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelaMovimentacoes } from './tabela-movimentacoes';

describe('TabelaMovimentacoes', () => {
  let component: TabelaMovimentacoes;
  let fixture: ComponentFixture<TabelaMovimentacoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabelaMovimentacoes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabelaMovimentacoes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
