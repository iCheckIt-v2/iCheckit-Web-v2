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
  fsData!:Observable<any>


  constructor(
    public auth: AuthService,
    readonly fire: AngularFireAuth, 
    public router: Router
    ) { }

  ngOnInit(): void {
    this.fire.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        console.log(this.userData)
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
