import { TestBed } from '@angular/core/testing';

import { Qna } from './qna';

describe('Qna', () => {
  let service: Qna;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Qna);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
