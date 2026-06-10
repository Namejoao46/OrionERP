import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisaoGeralEquipe } from './visao-geral-equipe';

describe('VisaoGeralEquipe', () => {
  let component: VisaoGeralEquipe;
  let fixture: ComponentFixture<VisaoGeralEquipe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisaoGeralEquipe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisaoGeralEquipe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
