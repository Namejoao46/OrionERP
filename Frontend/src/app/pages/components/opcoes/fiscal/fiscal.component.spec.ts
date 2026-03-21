import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiscalComponent } from './fiscal.component';

describe('FiscalComponent', () => {
  let component: FiscalComponent;
  let fixture: ComponentFixture<FiscalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiscalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiscalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
