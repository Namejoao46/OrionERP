import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetsLaterais } from './widgets-laterais';

describe('WidgetsLaterais', () => {
  let component: WidgetsLaterais;
  let fixture: ComponentFixture<WidgetsLaterais>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetsLaterais]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WidgetsLaterais);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
