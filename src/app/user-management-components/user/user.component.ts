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
  studentCourses: any = ['Information Technology', 'Information Systems', 'Computer Science'];
  studentSections: any = ['1ITA','1ITB','1ITC','1ITD','1ITE','1ITF','1ITH','2ITA','2ITB','2ITC','2ITD','2ITE','2ITF','3ITA','3ITB','3ITC','3ITD','3ITF','3ITG','3ITF','3ITG','4ITA','4ITB','4ITC','4ITD','4ITE'];
  itSection: any = ['1ITA','1ITB','1ITC','1ITD','1ITE','1ITF','1ITH','2ITA','2ITB','2ITC','2ITD','2ITE','2ITF','3ITA','3ITB','3ITC','3ITD','3ITF','3ITG','3ITF','3ITG','4ITA','4ITB','4ITC','4ITD','4ITE'];
  csSection: any = ['1CSA','1CSB','1CSC','2CSA','2CSB','2CSC','3CSA','3CSB','3CSC','3CSD','4CSA','4CSB'];
  isSection: any = ['1ISA','1ISB','2ISA','2ISB','3ISA','3ISB','4ISA','4ISB'];
  userData:any;
  fsData: any;
  student:any;
  admin: any;
  dateToday = new Date();
  deleteModal!: boolean;
  editUserModal!: boolean;
  editAdminModal!: boolean;
  editUserForm!:any;
  deptHeadUsers$:any;
  studentUsers$: any;
  editAdminForm!: any;
  term!:string;

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
    var d = new Date();
    var y = d.getFullYear()
    var n = d.getMonth();
    console.log(n)
    console.log(y)
    if (n >= 1 && n <= 6) {
      console.log('January to June');
      console.log('2nd Term SY ' + y + '-' + (y + 1))
      this.term = '2nd Term SY ' + y + '-' + (y + 1);
    }
    else if (n >= 8 && n <= 12) {
      console.log('August to December');
      console.log('1st Term SY ' + y + '-' + (y + 1))
      this.term = '1st Term SY ' + y + '-' + (y + 1);
    }
    else {
      console.log('Summer Term' + y + '-' + (y + 1))
      this.term = 'Summer Term' + y + '-' + (y + 1);
    }
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

    this.route.params.pipe(
      switchMap((params: Params) => {
        return this.userService.getAdmin(params['id'])
      })
    ).subscribe((res) => {
      this.admin = res;
    })

    // Validators.pattern('^[a-z0-9._%+-]+@[(ust.edu)]+\\.ph$')


    this.editUserForm = this.fb.group({
      displayName: ['', Validators.required,],
      email: ['', [Validators.required,Validators.email]],
      contactNumber: ['', Validators.required],
      course: ['',Validators.required],
      section: ['',Validators.required],

    });

    this.editAdminForm = this.fb.group({
      displayName: ['', Validators.required,],
      email: ['', [Validators.required,Validators.email]],
      contactNumber: ['', Validators.required],
      department: ['',Validators.required],


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
    this.editUserForm.controls.course.setValue(this.student.course);
    this.editUserForm.controls.section.setValue(this.student.section);
    // this.editUserForm.controls.department.setValue(this.student.department);
  }
  public triggerEditAdminModal() {
    this.editAdminModal = !this.editAdminModal;
    this.editAdminForm.controls.displayName.setValue(this.admin.displayName);
    this.editAdminForm.controls.email.setValue(this.admin.email);
    this.editAdminForm.controls.contactNumber.setValue(this.admin.contactNumber);
    this.editAdminForm.controls.department.setValue(this.admin.department);

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
        this.editUserForm.controls['course'].value,
        this.editUserForm.controls['section'].value,

      ).then(() => this.triggerEditUserModal())
      .finally(() => this.editUserForm.reset())
    }
    else if (this.editUserForm.invalid) {
      this.editUserForm.controls['displayName'].markAsTouched();
      this.editUserForm.controls['email'].markAsTouched();
      this.editUserForm.controls['contactNumber'].markAsTouched();
      this.editUserForm.controls['course'].markAsTouched();
      this.editUserForm.controls['section'].markAsTouched();
      // this.editUserForm.controls['department'].markAsTouched();
      this.toastService.publish('Please fill up all required fields properly','formError');

    }
  }

  public editAdminProfile() {
    if (this.editAdminForm.valid) {
      this.userService.updateAdminAccount(
        this.admin.uid,
        this.editAdminForm.controls['email'].value,
        this.editAdminForm.controls['displayName'].value,
        this.editAdminForm.controls['contactNumber'].value,
        this.editAdminForm.controls['department'].value,

      ).then(() => this.triggerEditAdminModal())
      .finally(() => this.editAdminForm.reset())
    }
    else if (this.editAdminForm.invalid) {
      this.editAdminForm.controls['displayName'].markAsTouched();
      this.editAdminForm.controls['email'].markAsTouched();
      this.editAdminForm.controls['contactNumber'].markAsTouched();
      this.editAdminForm.controls['department'].markAsTouched();
      this.toastService.publish('Please fill up all required fields properly','formError');

    }
  }


}
