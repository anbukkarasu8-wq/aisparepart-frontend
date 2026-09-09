import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryPageComponent } from './history-page.component';

declare function describe(name: string, spec: () => void): void;
declare function beforeEach(spec: () => void | Promise<void>): void;
declare function it(name: string, spec: () => void | Promise<void>): void;

describe('HistoryPageComponent', () => {
  let component: HistoryPageComponent;
  let fixture: ComponentFixture<HistoryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    if (!component) {
      throw new Error('Component was not created');
    }
  });
});
