import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { AngularFireAuth  } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  userData:any;
  fsData: any;
  student:any;
  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    public userService: UserService,
    readonly fire: AngularFireAuth, 
  ) { }

  ngOnInit(): void {
    this.fire.user.subscribe((user:any) => {
      this.userData = user;
      this.auth.getUserData(user?.uid).subscribe(res => {
        this.fsData = res;
      })
    })

    
    //    this.route.queryParams.subscribe(params => {
    //   let id = params['id'];
    //   this.userService.getStudent(id).subscribe((res) => {
    //     console.log(res + id)
    //   })
      
    // });
    
    this.route.params.pipe(
      switchMap((params: Params) => {
        return this.userService.getStudent(params['id'])
      })
    ).subscribe((res) => {
      this.student = res;
    })

  }

}
