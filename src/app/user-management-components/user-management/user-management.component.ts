import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth  } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  dateToday = Date.now();
  userData:any;
  fsData: any;
  constructor(
    public auth: AuthService,
    readonly fire: AngularFireAuth, 
    public router: Router,
    private fb: FormBuilder,
    public toastService: ToastService,
  ) { }

  ngOnInit(): void {
    this.fire.user.subscribe((user:any) => {
      this.userData = user;
      this.auth.getUserData(user?.uid).subscribe(res => {
        this.fsData = res;
      })
    })
  }

}
