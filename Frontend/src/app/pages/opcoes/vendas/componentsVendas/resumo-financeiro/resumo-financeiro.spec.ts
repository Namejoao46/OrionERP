import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumoFinanceiro } from './resumo-financeiro';

describe('ResumoFinanceiro', () => {
  let component: ResumoFinanceiro;
  let fixture: ComponentFixture<ResumoFinanceiro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumoFinanceiro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumoFinanceiro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
