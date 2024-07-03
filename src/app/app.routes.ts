import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AreaDashboardComponent } from './area-dashboard/area-dashboard.component';
import { AuditorDashboardComponent } from './auditor-dashboard/auditor-dashboard.component';
import { BodegaDashboardComponent } from './bodega-dashboard/bodega-dashboard.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { UserProfileComponent } from './user-profile-component/user-profile-component.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { OrdenCompraComponent } from './orden-compra/orden-compra.component';
import { InicioComponent } from './inicio/inicio.component';
import { AuthGuard } from './auth/auth.guard';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { ReportComponent } from './report-page/report-page.component';
import { ProyectosComponent } from './proyectos/proyectos.component';
import { BulkUploadComponent } from './bulk-upload/bulk-upload.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'proveedores', component: ProveedorComponent },
  { path: 'orden-compra', component: OrdenCompraComponent },
  { path: 'admin-dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
  { path: 'area-dashboard', component: AreaDashboardComponent, canActivate: [AuthGuard], data: { role: 'Área' } },
  { path: 'auditor-dashboard', component: AuditorDashboardComponent, canActivate: [AuthGuard], data: { role: 'Auditor' } },
  { path: 'proyectos', component: ProyectosComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'inicio', component: InicioComponent, canActivate: [AuthGuard] },
  { path: 'bodega-dashboard', component: BodegaDashboardComponent },
  { path: 'notificaciones', component: NotificacionesComponent },
  { path: 'user-profile', component: UserProfileComponent },
  { path: 'usuarios', component: UserManagementComponent },
  { path: 'bulk-upload', component: BulkUploadComponent },
  { path: 'reportes', component: ReportComponent },
  { path: '**', redirectTo: 'login' }
];
