import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Grafico } from './grafico';

describe('Grafico', () => {
  let component: Grafico;
  let fixture: ComponentFixture<Grafico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Grafico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Grafico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
