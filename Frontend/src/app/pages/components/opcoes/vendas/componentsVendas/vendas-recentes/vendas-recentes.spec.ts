import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendasRecentes } from './vendas-recentes';

describe('VendasRecentes', () => {
  let component: VendasRecentes;
  let fixture: ComponentFixture<VendasRecentes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendasRecentes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendasRecentes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
