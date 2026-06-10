import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelaContas } from './tabela-contas';

describe('TabelaContas', () => {
  let component: TabelaContas;
  let fixture: ComponentFixture<TabelaContas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabelaContas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabelaContas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
