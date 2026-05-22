import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFlutuante } from './card-flutuante';

describe('CardFlutuante', () => {
  let component: CardFlutuante;
  let fixture: ComponentFixture<CardFlutuante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFlutuante]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFlutuante);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
