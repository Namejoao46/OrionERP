import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardModuloRh } from './card-modulo-rh';

describe('CardModuloRh', () => {
  let component: CardModuloRh;
  let fixture: ComponentFixture<CardModuloRh>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardModuloRh]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardModuloRh);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
