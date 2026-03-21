import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaisComponent } from './mais.component';

describe('MaisComponent', () => {
  let component: MaisComponent;
  let fixture: ComponentFixture<MaisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
