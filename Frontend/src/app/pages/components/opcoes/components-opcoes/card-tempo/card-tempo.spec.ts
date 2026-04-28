import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardTempo } from './card-tempo';

describe('CardTempo', () => {
  let component: CardTempo;
  let fixture: ComponentFixture<CardTempo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardTempo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardTempo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
