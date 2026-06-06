import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatStatus } from './chat-status';

describe('ChatStatus', () => {
  let component: ChatStatus;
  let fixture: ComponentFixture<ChatStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
