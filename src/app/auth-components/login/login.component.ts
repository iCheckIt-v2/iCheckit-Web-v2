import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth  } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email!:string;
  password!:string;
  name!:string;
  number!:string;
  constructor(
    public auth: AuthService,
    readonly fire: AngularFireAuth, 
    public router: Router
  ) { }

  ngOnInit(): void {
  }

  public signUp() {
    this.auth.signup(this.email,this.password,this.name,this.number)
  }

  public login() {
    this.auth.signIn(this.email,this.password).then(a => {
      this.router.navigate(['/dashboard'])
    })
  }
  
}
