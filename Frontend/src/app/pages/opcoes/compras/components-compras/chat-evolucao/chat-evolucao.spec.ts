import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatEvolucao } from './chat-evolucao';

describe('ChatEvolucao', () => {
  let component: ChatEvolucao;
  let fixture: ComponentFixture<ChatEvolucao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatEvolucao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatEvolucao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
