import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from '../app/dashboard-components/dashboard/dashboard.component'
import { LoginComponent } from './auth-components/login/login.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { ForgotPasswordComponent } from './auth-components/forgot-password/forgot-password.component';
import { environment } from "src/environments/environment";
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './navbar/navbar.component';
import { MyProfileComponent } from './my-profile-components/my-profile/my-profile.component';
import { UserManagementComponent } from './user-management-components/user-management/user-management.component';
import {NgxPaginationModule} from 'ngx-pagination'; // <-- import the module
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { HttpClientModule } from '@angular/common/http';
import { UserComponent } from './user-management-components/user/user.component';
import { TaskComponent } from './dashboard-components/task/task.component';
import { TaskSettingsComponent } from './dashboard-components/task-settings/task-settings.component';
import { ReportComponent } from './dashboard-components/report/report.component';
@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    PagenotfoundComponent,
    ForgotPasswordComponent,
    NavbarComponent,
    MyProfileComponent,
    UserManagementComponent,
    UserComponent,
    TaskComponent,
    TaskSettingsComponent,
    ReportComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    AngularFirestoreModule, //Firebase imports
    AngularFireAuthModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    AngularFireFunctionsModule,
    AngularFireStorageModule,
    AngularFireModule.initializeApp(environment.firebase),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
