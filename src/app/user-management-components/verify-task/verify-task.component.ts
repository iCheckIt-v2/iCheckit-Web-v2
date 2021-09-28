import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth  } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';
import { TaskService } from 'src/app/services/task.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-verify-task',
  templateUrl: './verify-task.component.html',
  styleUrls: ['./verify-task.component.css']
})
export class VerifyTaskComponent implements OnInit {
  dateToday = new Date();
  userData:any;
  fsData: any;
  taskData: any;
  studentTaskList: any;
  p: number = 1;

  constructor(
    public auth: AuthService,
    private router: Router,
    readonly fire: AngularFireAuth,
    private taskService: TaskService,
    private fb: FormBuilder,
    private storage: AngularFireStorage
  ) { }

  ngOnInit(): void {
    this.fire.user.subscribe((user:any) => {
      this.userData = user;
      this.auth.getUserData(user?.uid).subscribe(res => {
        this.fsData = res;
      })
    })

    this.taskService.getVerificationTask().subscribe((res) => {
      this.taskData = res;
    })
  }

  public verifyStudent(data:any) {
    this.taskService.verifyStudent(data.uid,data);
  }

  public deleteSubmission(data:any) {
    this.taskService.deleteStudentVerification(data.uid,data);
  }

}
