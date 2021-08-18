import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth  } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  email!:string;

  constructor(
    public auth: AuthService,
    readonly fire: AngularFireAuth,
    public toastService: ToastService 
  ) { }

  ngOnInit(): void {
    this.email = ''
  }

  public sendPasswordReset() {
    if (this.email == '') {
      this.toastService.publish('Please fill up all required fields properly','formError');    
    } 
    if (this.email != '') {
    this.auth.sendPasswordReset(this.email)
    }
  }
}
