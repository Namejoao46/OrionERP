import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsIndicadores } from './cards-indicadores';

describe('CardsIndicadores', () => {
  let component: CardsIndicadores;
  let fixture: ComponentFixture<CardsIndicadores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsIndicadores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsIndicadores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
