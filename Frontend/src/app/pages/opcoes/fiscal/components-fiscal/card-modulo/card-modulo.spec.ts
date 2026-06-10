import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardModulo } from './card-modulo';

describe('CardModulo', () => {
  let component: CardModulo;
  let fixture: ComponentFixture<CardModulo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardModulo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardModulo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
