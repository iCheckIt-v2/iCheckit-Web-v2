import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from '../app/dashboard-components/dashboard/dashboard.component'
import { LoginComponent } from './auth-components/login/login.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { ForgotPasswordComponent } from './auth-components/forgot-password/forgot-password.component';
import { MyProfileComponent } from './my-profile-components/my-profile/my-profile.component';
import { UserManagementComponent } from './user-management-components/user-management/user-management.component';
import { UserComponent } from './user-management-components/user/user.component';

import { AngularFireAuthGuard, canActivate, customClaims, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';


const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, ...canActivate(redirectUnauthorizedToLogin)},
  { path: 'login', component: LoginComponent },
  { path: 'my-profile', component: MyProfileComponent, ...canActivate(redirectUnauthorizedToLogin)},
  { path: 'user/:id', component: UserComponent, ...canActivate(redirectUnauthorizedToLogin)},
  { path: 'user-management', component: UserManagementComponent, ...canActivate(redirectUnauthorizedToLogin)},
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: '',   redirectTo: '/dashboard', pathMatch: 'full' }, // redirect to `Home`
  { path: '**', component: PagenotfoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
