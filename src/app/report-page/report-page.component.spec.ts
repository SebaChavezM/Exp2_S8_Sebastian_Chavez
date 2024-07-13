import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportComponent } from './report-page.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReportService } from '../service/report.service';
import * as XLSX from 'xlsx';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;
  let reportService: ReportService;

  const mockReportService = {
    generateReport: jasmine.createSpy('generateReport').and.callFake((reportType, params) => {
      return [
        { name: 'Product 1', stock: 10 },
        { name: 'Product 2', stock: 20 }
      ];
    }),
    getReportHeaders: jasmine.createSpy('getReportHeaders').and.returnValue(['Name', 'Stock'])
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule, ReportComponent],
      providers: [{ provide: ReportService, useValue: mockReportService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportComponent);
    component = fixture.componentInstance;
    reportService = TestBed.inject(ReportService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should alert if no report type is selected', () => {
    spyOn(window, 'alert');
    component.generateReport();
    expect(window.alert).toHaveBeenCalledWith('Seleccione un tipo de reporte');
  });

  it('should generate report data and headers', () => {
    component.selectedReportType = 'generalInventory';
    component.generateReport();
    expect(reportService.generateReport).toHaveBeenCalledWith('generalInventory', component.reportParams);
    expect(component.reportData.length).toBe(2);
    expect(component.reportHeaders).toEqual(['Name', 'Stock']);
  });

  it('should alert if there is no data to export', () => {
    spyOn(window, 'alert');
    component.downloadExcel();
    expect(window.alert).toHaveBeenCalledWith('No hay datos para exportar');
  });

  it('should reset report params and data', () => {
    component.reportParams = { someParam: 'value' };
    component.reportData = [{ name: 'Product 1', stock: 10 }];
    component.reportHeaders = ['Name', 'Stock'];

    component.resetParams();

    expect(component.reportParams).toEqual({});
    expect(component.reportData).toEqual([]);
    expect(component.reportHeaders).toEqual([]);
  });
});
