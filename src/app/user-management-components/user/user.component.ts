import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { AngularFireAuth  } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  userData:any;
  fsData: any;
  student:any;
  dateToday = new Date();
  deleteModal!: boolean;
  editUserModal!: boolean;
  editUserForm!:any;
  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    public userService: UserService,
    readonly fire: AngularFireAuth, 
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
    
    this.route.params.pipe(
      switchMap((params: Params) => {
        return this.userService.getStudent(params['id'])
      })
    ).subscribe((res) => {
      this.student = res;
    })

    this.editUserForm = this.fb.group({
      displayName: ['', Validators.required,],
      email: ['', [Validators.required,Validators.email]],
      contactNumber: ['', Validators.required],
    });
  }

  public triggerDeleteModal() {
    this.deleteModal = !this.deleteModal
  }

  public triggerEditUserModal() {
    this.editUserModal = !this.editUserModal;
    this.editUserForm.controls.displayName.setValue(this.student.displayName);
    this.editUserForm.controls.email.setValue(this.student.email);
    this.editUserForm.controls.contactNumber.setValue(this.student.contactNumber);
  }


  public deleteUser(id:string,email:string) {
    this.userService.deleteUserAccount(id,email)
    .then(() => {
      this.router.navigate(['/user-management']);
    })
  }

  public editUserProfile() {
    if (this.editUserForm.valid) {
      this.userService.updateUserAccount(
        this.student.uid,
        this.editUserForm.controls['email'].value,
        this.editUserForm.controls['displayName'].value,
        this.editUserForm.controls['contactNumber'].value,
      ).then(() => this.triggerEditUserModal())
      .finally(() => this.editUserForm.reset())
    }
    else if (this.editUserForm.invalid) {
      this.editUserForm.controls['displayName'].markAsTouched();
      this.editUserForm.controls['email'].markAsTouched();
      this.editUserForm.controls['contactNumber'].markAsTouched();
      this.toastService.publish('Please fill up all required fields properly','formError');

    }
  }

}
