import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth  } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { TaskService } from 'src/app/services/task.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  taskScope: any = ['1ITA','1ITB','1ITC','1ITD','1ITE','1ITF','1ITH','2ITA','2ITB','2ITC','2ITD','2ITE','2ITF','3ITA','3ITB','3ITC','3ITD','3ITF','3ITG','3ITF','3ITG','4ITA','4ITB','4ITC','4ITD','4ITE','BS Information Technology', 'BS Information Systems', 'BS Computer Science'];
  taskScopeArray!: string[];
  p: number = 1;
  email!:string;
  password!:string;
  name!:string;
  number!:string;
  userData:any;
  fsData: any;
  addTaskModal!: boolean;
  dateToday = new Date();
  verifyTasks$: any;
  addTaskForm!:any;
  taskRecipients: { uid: any; status: string; section: any; submissionLink: string; displayName: any; }[] = [];
  userPushTokens: { pushToken: string; }[] = [];

  constructor(
    public auth: AuthService,
    readonly fire: AngularFireAuth,
    public router: Router,
    public taskService: TaskService,
    private fb: FormBuilder,
    ) { }

  ngOnInit(): void {
    this.fire.user.subscribe((user:any) => {
      this.userData = user;
      this.auth.getUserData(user?.uid).subscribe(res => {
        this.fsData = res;
      })
    })
    this.taskService.getVerifyTasks().subscribe((res) => {
      this.verifyTasks$ = res;
      console.log(this.verifyTasks$);
    })

    this.taskScopeArray = [];

    this.addTaskForm = this.fb.group({
      title: ['', Validators.required,],
      description: ['', Validators.required],
      scope: ['', Validators.required],
      deadline: ['', Validators.required],
    });
  }

  public triggerAddTaskModal() {
    this.addTaskModal = !this.addTaskModal;
  }

  changeTaskScope(e:any) {
    console.log(e.target.value);
    console.log(typeof e.target.value);
    if (this.taskScopeArray.includes(e.target.value)) {
      console.log('already included')
    } else if (!this.taskScopeArray.includes(e.target.value)) {
      this.taskScopeArray.push(e.target.value)
      console.log(this.taskScopeArray);

      this.taskScopeArray.forEach(element => {
        this.taskService.setRecipients(element).subscribe(res => {
          res.forEach((data: any) => {
            let pushToken = {
              pushToken: data.pushToken
            }
            let userData = {
              uid: data.id,
              status: 'Pending',
              section: data.section,
              submissionLink: '',
              displayName: data.displayName
            }
            console.log(data.pushToken)
            if (!this.taskRecipients.some(e => e.uid === userData.uid)) {
              this.taskRecipients.push(userData);
              /* vendors contains the element we're looking for */
            }
            if (!this.userPushTokens.some(e => e.pushToken === pushToken.pushToken)) {
              this.userPushTokens.push(pushToken);
              /* vendors contains the element we're looking for */
            }
            // if (!this.userPushTokens.some(e => e.pushToken === data.pushToken)) {
            //   this.userPushTokens.push(data.pushToken);
            //   /* vendors contains the element we're looking for */
            // }

          });
        })
      })
    }
    console.log(this.taskRecipients)
    console.log(this.userPushTokens)


    // this.createStudentForm.controls.section.setValue(e.target.value, {
    //   onlySelf: true
    // });
  }

  addTask() {

    if (this.addTaskForm.valid) {
      this.taskService.addTask(
        this.addTaskForm.controls['title'].value,
        this.addTaskForm.controls['description'].value,
        this.taskScopeArray,
        new Date(this.addTaskForm.controls['deadline'].value),
        this.fsData.displayName,
        this.taskRecipients,
        this.userPushTokens
      )
    }
    else if (this.addTaskForm.invalid) {
      this.addTaskForm.controls['title'].markAsTouched();
      this.addTaskForm.controls['description'].markAsTouched();
      this.addTaskForm.controls['scope'].markAsTouched();
      this.addTaskForm.controls['deadline'].markAsTouched();
    }
  }

}
