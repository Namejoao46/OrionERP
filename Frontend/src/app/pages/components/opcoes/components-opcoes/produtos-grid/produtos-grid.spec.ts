import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutosGrid } from './produtos-grid';

describe('ProdutosGrid', () => {
  let component: ProdutosGrid;
  let fixture: ComponentFixture<ProdutosGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdutosGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdutosGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
