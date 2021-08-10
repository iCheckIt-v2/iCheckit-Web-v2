import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth  } from '@angular/fire/auth';
import { Router } from '@angular/router';

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
  ) { }

  ngOnInit(): void {
  }

  public sendPasswordReset() {
    this.auth.sendPasswordReset(this.email)
  }
}
