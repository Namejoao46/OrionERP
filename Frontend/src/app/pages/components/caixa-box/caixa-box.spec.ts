import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaixaBox } from './caixa-box';

describe('CaixaBox', () => {
  let component: CaixaBox;
  let fixture: ComponentFixture<CaixaBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaixaBox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaixaBox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
