import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth  } from '@angular/fire/auth';
import { Router } from '@angular/router';

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
  userData:any;
  fsData: any;
  dateToday = Date.now();
 
  constructor(
    public auth: AuthService,
    readonly fire: AngularFireAuth, 
    public router: Router,
    ) { }

  ngOnInit(): void {

  }

}
