import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutosFornecedor } from './produtos-fornecedor';

describe('ProdutosFornecedor', () => {
  let component: ProdutosFornecedor;
  let fixture: ComponentFixture<ProdutosFornecedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdutosFornecedor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdutosFornecedor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
