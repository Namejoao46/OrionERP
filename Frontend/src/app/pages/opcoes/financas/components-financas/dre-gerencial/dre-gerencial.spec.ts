import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DreGerencial } from './dre-gerencial';

describe('DreGerencial', () => {
  let component: DreGerencial;
  let fixture: ComponentFixture<DreGerencial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DreGerencial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DreGerencial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
