import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardMetrica } from './card-metrica';

describe('CardMetrica', () => {
  let component: CardMetrica;
  let fixture: ComponentFixture<CardMetrica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardMetrica]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardMetrica);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
