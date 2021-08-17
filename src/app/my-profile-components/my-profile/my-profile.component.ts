import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth  } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
  dateToday = Date.now();
  userData:any;
  fsData: any;
  editModal!: boolean;
  deleteModal!: boolean;

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

    this.editModal = false;
    this.deleteModal = false;
  }

  public triggerEditModal() {
    this.editModal = !this.editModal
  }

  public triggerDeleteModal() {
    this.deleteModal = !this.deleteModal
  }

 

}
