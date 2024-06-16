import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AreaDashboardComponent } from './area-dashboard/area-dashboard.component';
import { AuditorDashboardComponent } from './auditor-dashboard/auditor-dashboard.component';
import { UserProfileComponent } from './user-profile-component/user-profile-component.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin-dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
  { path: 'area-dashboard', component: AreaDashboardComponent, canActivate: [AuthGuard], data: { role: 'Área' } },
  { path: 'auditor-dashboard', component: AuditorDashboardComponent, canActivate: [AuthGuard], data: { role: 'Auditor' } },
  { path: 'user-profile', component: UserProfileComponent },
  { path: '**', redirectTo: 'login' }
];
