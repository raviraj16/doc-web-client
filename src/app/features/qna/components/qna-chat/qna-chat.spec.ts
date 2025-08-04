import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QnaChat } from './qna-chat';

describe('QnaChat', () => {
  let component: QnaChat;
  let fixture: ComponentFixture<QnaChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QnaChat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QnaChat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
