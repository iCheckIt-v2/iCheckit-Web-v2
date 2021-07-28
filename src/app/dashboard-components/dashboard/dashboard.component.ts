import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth  } from '@angular/fire/auth';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  email!:string;
  password!:string;
  name!:string;
  number!:string;
  constructor(
    public auth: AuthService,
    readonly fire: AngularFireAuth, 
    ) { }

  ngOnInit(): void {
    
  }

  public signUp() {
    this.auth.signup(this.email,this.password,this.name,this.number)
  }

  public login() {
    this.auth.signIn(this.email,this.password)
  }

}
