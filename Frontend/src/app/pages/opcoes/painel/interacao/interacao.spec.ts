import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Interacao } from './interacao';

describe('Interacao', () => {
  let component: Interacao;
  let fixture: ComponentFixture<Interacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Interacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Interacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
