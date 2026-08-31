import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SparesPageComponent } from './spares-page.component';

describe('SparesPageComponent', () => {
  let component: SparesPageComponent;
  let fixture: ComponentFixture<SparesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SparesPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SparesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
