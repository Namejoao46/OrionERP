import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetasVendas } from './metas-vendas';

describe('MetasVendas', () => {
  let component: MetasVendas;
  let fixture: ComponentFixture<MetasVendas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetasVendas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetasVendas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
