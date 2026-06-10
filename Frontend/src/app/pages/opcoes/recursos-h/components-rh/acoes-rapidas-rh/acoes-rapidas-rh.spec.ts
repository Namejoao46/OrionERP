import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcoesRapidasRh } from './acoes-rapidas-rh';

describe('AcoesRapidasRh', () => {
  let component: AcoesRapidasRh;
  let fixture: ComponentFixture<AcoesRapidasRh>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcoesRapidasRh]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcoesRapidasRh);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
