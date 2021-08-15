import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth  } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

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
          console.log(this.fsData)
          if (res.role == 'CICS Office Staff' || res.role == 'Department Head') {
            console.log('Allowed to access')
          } else {
            console.log('Restricted!')
            this.logout();
            this.router.navigate(['/login'])
          }
        })
      } else {
        this.logout()
      }
    })
  }

  public logout() {
    this.auth.signOut().then(a => {
      this.router.navigate(['login'])
    })
  }




}
