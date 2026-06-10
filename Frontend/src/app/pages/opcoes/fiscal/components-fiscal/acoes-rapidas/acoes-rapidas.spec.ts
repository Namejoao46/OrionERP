import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcoesRapidas } from './acoes-rapidas';

describe('AcoesRapidas', () => {
  let component: AcoesRapidas;
  let fixture: ComponentFixture<AcoesRapidas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcoesRapidas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcoesRapidas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
