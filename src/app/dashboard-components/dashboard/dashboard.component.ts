import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

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
  constructor(public auth: AuthService) { }

  ngOnInit(): void {
  }

  public signUp() {
    this.auth.signup(this.email,this.password,this.name,this.number)
  }

}
