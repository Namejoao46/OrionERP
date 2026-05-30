import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroGeralComponent } from './cadastro-geral-component';

describe('CadastroGeralComponent', () => {
  let component: CadastroGeralComponent;
  let fixture: ComponentFixture<CadastroGeralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroGeralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroGeralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
