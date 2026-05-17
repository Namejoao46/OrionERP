import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UltimosProdutos } from './ultimos-produtos';

describe('UltimosProdutos', () => {
  let component: UltimosProdutos;
  let fixture: ComponentFixture<UltimosProdutos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UltimosProdutos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UltimosProdutos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
