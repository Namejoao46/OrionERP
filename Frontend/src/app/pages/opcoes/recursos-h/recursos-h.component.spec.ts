import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecursosHComponent } from './recursos-h.component';

describe('RecursosHComponent', () => {
  let component: RecursosHComponent;
  let fixture: ComponentFixture<RecursosHComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecursosHComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecursosHComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
