import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditorDashboardComponent } from './auditor-dashboard.component';

describe('AuditorDashboardComponent', () => {
  let component: AuditorDashboardComponent;
  let fixture: ComponentFixture<AuditorDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditorDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
