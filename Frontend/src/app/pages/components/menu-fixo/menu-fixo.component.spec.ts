import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuFixoComponent } from './menu-fixo.component';

describe('MenuFixoComponent', () => {
  let component: MenuFixoComponent;
  let fixture: ComponentFixture<MenuFixoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuFixoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuFixoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
