import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodegaDashboardComponent } from './bodega-dashboard.component';

describe('BodegaDashboardComponent', () => {
  let component: BodegaDashboardComponent;
  let fixture: ComponentFixture<BodegaDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BodegaDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BodegaDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
