import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsKpi } from './cards-kpi';

describe('CardsKpi', () => {
  let component: CardsKpi;
  let fixture: ComponentFixture<CardsKpi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsKpi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsKpi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
