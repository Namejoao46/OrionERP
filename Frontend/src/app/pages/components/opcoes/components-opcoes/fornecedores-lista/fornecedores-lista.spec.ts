import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FornecedoresLista } from './fornecedores-lista';

describe('FornecedoresLista', () => {
  let component: FornecedoresLista;
  let fixture: ComponentFixture<FornecedoresLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FornecedoresLista]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FornecedoresLista);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
