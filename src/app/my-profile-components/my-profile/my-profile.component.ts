import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth  } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
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
  editAccountForm!:any;
  deleteAccountForm!:any;

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

    this.editAccountForm = this.fb.group({
      displayName: ['', Validators.required,],
      contactNumber: ['', Validators.required],
      currentEmail: ['', [Validators.required,Validators.email]],
      newEmail: ['', [Validators.required,Validators.email]],
      password: ['', Validators.required],
    });

    this.deleteAccountForm = this.fb.group({
      currentEmail: ['', [Validators.required,Validators.email]],
      password: ['', Validators.required]
    });

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
    if (this.editAccountForm.valid) {
      this.auth.editMyProfile(this.editAccountForm.controls['displayName'].value,this.editAccountForm.controls['contactNumber'].value,this.editAccountForm.controls['currentEmail'].value,this.editAccountForm.controls['newEmail'].value,this.editAccountForm.controls['password'].value,this.fsData.id)
      .then(() => this.triggerEditModal())
    }
    else if (this.editAccountForm.invalid) {
      this.editAccountForm.controls['displayName'].markAsTouched();
      this.editAccountForm.controls['contactNumber'].markAsTouched();
      this.editAccountForm.controls['currentEmail'].markAsTouched();
      this.editAccountForm.controls['newEmail'].markAsTouched();
      this.editAccountForm.controls['password'].markAsTouched();
      this.toastService.publish('Please fill up all required fields properly','formError');
    }
    /*
    this.auth.editMyProfile(this.displayName,this.contactNumber,this.currentEmail,this.newEmail,this.password,this.fsData.id).then(() => alert('User Profile Has Been Updated')).then(() => this.triggerEditModal())
    */
  } 

  public deleteMyProfile() {
    if (this.deleteAccountForm.valid) {
      this.auth.deleteMyProfile(this.deleteAccountForm.controls['currentEmail'].value,this.deleteAccountForm.controls['password'].value,this.fsData.id)
    } 
    else if (this.deleteAccountForm.invalid) {
      this.deleteAccountForm.controls['currentEmail'].markAsTouched();
      this.deleteAccountForm.controls['password'].markAsTouched();
      this.toastService.publish('Please fill up all required fields properly','formError');
    }
    /*
    this.auth.deleteMyProfile(this.currentEmail,this.password,this.fsData.id)*/
  }

}
