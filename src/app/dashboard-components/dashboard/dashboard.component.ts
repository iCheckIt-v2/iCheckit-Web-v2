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
    this.fire.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        this.auth.getUserData(user.uid).subscribe(res => {
          this.fsData = res;
          if (res.role == 'CICS Office Staff' || res.role == 'Department Head') {
          } else {
            this.auth.signOut().then(a => {
              this.router.navigate(['login'])
            })
          }
        })
      } else {
        this.auth.signOut().then(a => {
          this.router.navigate(['login'])
        })
      }
    })
  }

}
