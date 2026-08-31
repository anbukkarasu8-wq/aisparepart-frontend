import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationPageComponent } from './quotation-page.component';

describe('QuotationPageComponent', () => {
  let component: QuotationPageComponent;
  let fixture: ComponentFixture<QuotationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
