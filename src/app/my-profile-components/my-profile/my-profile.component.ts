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
  displayName!:string;
  newEmail!:string;
  currentEmail!:string;
  password!:string;
  contactNumber!:string;

  constructor(
    public auth: AuthService,
    readonly fire: AngularFireAuth, 
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.fire.user.subscribe((user:any) => {
      this.userData = user;
      this.auth.getUserData(user?.uid).subscribe(res => {
        this.fsData = res;
      })
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

  
  public editMyProfile() {
    this.auth.editMyProfile(this.displayName,this.contactNumber,this.currentEmail,this.newEmail,this.password,this.fsData.id).then(() => alert('User Profile Has Been Updated')).then(() => this.triggerEditModal())
  } 

  public deleteMyProfile() {
    this.auth.deleteMyProfile(this.currentEmail,this.password,this.fsData.id)
  }


  


}
