import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mensagens } from './mensagens';

describe('Mensagens', () => {
  let component: Mensagens;
  let fixture: ComponentFixture<Mensagens>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mensagens]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mensagens);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
