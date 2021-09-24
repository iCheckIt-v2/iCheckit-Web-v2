import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth  } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  studentCourses: any = ['BS Information Technology', 'BS Information Systems', 'BS Computer Science'];
  studentSections: any = ['1ITA','1ITB','1ITC','1ITD','1ITE','1ITF','1ITH','2ITA','2ITB','2ITC','2ITD','2ITE','2ITF','3ITA','3ITB','3ITC','3ITD','3ITF','3ITG','3ITF','3ITG','4ITA','4ITB','4ITC','4ITD','4ITE'];
  itSection: any = ['1ITA','1ITB','1ITC','1ITD','1ITE','1ITF','1ITH','2ITA','2ITB','2ITC','2ITD','2ITE','2ITF','3ITA','3ITB','3ITC','3ITD','3ITF','3ITG','3ITF','3ITG','4ITA','4ITB','4ITC','4ITD','4ITE'];
  csSection: any = ['1CSA','1CSB','1CSC','2CSA','2CSB','2CSC','3CSA','3CSB','3CSC','3CSD','4CSA','4CSB'];
  isSection: any = ['1ISA','1ISB','2ISA','2ISB','3ISA','3ISB','4ISA','4ISB'];
  dateToday = new Date();
  createStudentModal!: boolean;
  createStudentForm!:any;
  createAdminForm!:any;
  createAdminModal!:boolean;
  userData:any;
  fsData: any;
  adminUsers$: any;
  studentUsers$: any;
  deptHeadUsers$:any;
  p: number = 1;
  constructor(
    public auth: AuthService,
    readonly fire: AngularFireAuth,
    public router: Router,
    private fb: FormBuilder,
    public toastService: ToastService,
    public userService: UserService,
  ) { }

  ngOnInit(): void {
    this.fire.user.subscribe((user:any) => {
      this.userData = user;
      this.auth.getUserData(user?.uid).subscribe(res => {
        this.fsData = res;


      })
    })

    this.userService.getStudentUsers().subscribe((res) => {
      this.studentUsers$ = res;
    });
    this.userService.getAdminUsers().subscribe((res) => {
      this.adminUsers$ = res;
    });
    this.userService.getDeptHeadUsers().subscribe((res) => {
      this.deptHeadUsers$ = res;
    });

    // Validators.pattern('^[a-z0-9._%+-]+@[(ust.edu)]+\\.ph$'

    this.createStudentForm = this.fb.group({
      displayName: ['', Validators.required,],
      section: ['', Validators.required],
      course: ['', Validators.required],
      contactNumber: ['', Validators.required],
      email: ['', [Validators.required,Validators.email]],
    });

    this.createAdminForm = this.fb.group({
      displayName: ['', Validators.required,],
      department: ['', Validators.required],
      contactNumber: ['', Validators.required],
      email: ['', [Validators.required,Validators.email]],
    });
  }

  public triggerCreateStudentModal() {
    this.createStudentModal = !this.createStudentModal;
  }

  public triggerCreateAdminModal() {
    this.createAdminModal = !this.createAdminModal;
  }

  public createStudent() {
    if (this.createStudentForm.valid) {
      this.userService.adminCreateStudent(
        this.createStudentForm.controls['displayName'].value,
        this.createStudentForm.controls['section'].value,
        this.createStudentForm.controls['course'].value,
        this.createStudentForm.controls['contactNumber'].value,
        this.createStudentForm.controls['email'].value
      )
      .then(() => this.triggerCreateStudentModal())
      .finally(() => this.createStudentForm.reset())
    }
    else if (this.createStudentForm.invalid) {
      console.log(this.createStudentForm.value)
      this.createStudentForm.controls['displayName'].markAsTouched();
      this.createStudentForm.controls['course'].markAsTouched();
      this.createStudentForm.controls['section'].markAsTouched();
      this.createStudentForm.controls['contactNumber'].markAsTouched();
      this.createStudentForm.controls['email'].markAsTouched();
      this.toastService.publish('Please fill up all required fields properly','formError');
    }
  }

  public createAdmin() {
    if (this.createAdminForm.valid) {
      console.log(this.createAdminForm.value);
      this.userService.createAdmin(
        this.createAdminForm.controls['displayName'].value,
        this.createAdminForm.controls['department'].value,
        this.createAdminForm.controls['contactNumber'].value,
        this.createAdminForm.controls['email'].value,
      )
      .then(() => this.triggerCreateAdminModal())
      .finally(() => this.createAdminForm.reset())
    }
    else if (this.createAdminForm.invalid) {
      console.log(this.createAdminForm.value)
      this.createAdminForm.controls['displayName'].markAsTouched();
      this.createAdminForm.controls['department'].markAsTouched();
      this.createAdminForm.controls['email'].markAsTouched();
      this.createAdminForm.controls['contactNumber'].markAsTouched();
      this.toastService.publish('Please fill up all required fields properly','formError');
    }
  }

  changeDepartment(e:any) {
    this.createAdminForm.controls.department.setValue(e.target.value, {
      onlySelf: true
    });
  }

  changeCourse(e:any) {
    this.createStudentForm.controls.course.setValue(e.target.value, {
      onlySelf: true
    });
  }

  changeSection(e:any) {
    this.createStudentForm.controls.section.setValue(e.target.value, {
      onlySelf: true
    });
  }
}
