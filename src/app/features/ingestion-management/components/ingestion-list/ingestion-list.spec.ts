import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngestionList } from './ingestion-list';

describe('IngestionList', () => {
  let component: IngestionList;
  let fixture: ComponentFixture<IngestionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngestionList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngestionList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
