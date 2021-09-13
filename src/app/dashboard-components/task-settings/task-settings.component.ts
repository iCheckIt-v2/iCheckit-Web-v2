import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Params, ActivatedRoute } from '@angular/router';
import { AngularFireAuth  } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';
import { TaskService } from 'src/app/services/task.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
// modal dialog import
@Component({
	selector: 'task-settings',
	templateUrl: './task-settings.component.html',
	styleUrls: ['./task-settings.component.css']
})

export class TaskSettingsComponent implements OnInit {
  dateToday = new Date();
  userData:any;
  fsData: any;
   id!: any;
  taskData: any;
  taskStatus: any = ['Pending','Completed']
  // start of edit task import
  // taskScope: any = ['1ITA','1ITB','1ITC','1ITD','1ITE','1ITF','1ITH','2ITA','2ITB','2ITC','2ITD','2ITE','2ITF','3ITA','3ITB','3ITC','3ITD','3ITF','3ITG','3ITF','3ITG','4ITA','4ITB','4ITC','4ITD','4ITE','BS Information Technology', 'BS Information Systems', 'BS Computer Science'];
  taskScopeArray!: string[];
  // newTaskScope: any = ['1ITA','1ITB','1ITC','1ITD','1ITE','1ITF','1ITH','2ITA','2ITB','2ITC','2ITD','2ITE','2ITF','3ITA','3ITB','3ITC','3ITD','3ITF','3ITG','3ITF','3ITG','4ITA','4ITB','4ITC','4ITD','4ITE','BS Information Technology', 'BS Information Systems', 'BS Computer Science'];
  newTaskScopeArray!: string[];
  addTaskForm!:any;
  newTaskForm!: any;
  taskRecipients: { uid: any; status: string; section: any; submissionLink: string; displayName: any; }[] = [];
  userPushTokens: { pushToken: string; }[] = [];
  addTaskModal!: boolean;
  addScopeModal!: boolean;
  editTaskScope!: any;
  verifyTasks$: any;

  // editTaskScope! : any;
  // end of edit task import

	constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    readonly fire: AngularFireAuth,
    private taskService: TaskService,
    // start of edit task constructors
    private fb: FormBuilder,
    // end of edit task constructors
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
          console.log(params['id']);
          return this.taskService.getTask(params['id'])
        })
      ).subscribe((res) => {
        this.taskData = res;
        console.log(res);
      })

  this.taskScopeArray = [];

    this.addTaskForm = this.fb.group({
      title: ['', Validators.required,],
      description: ['', Validators.required],
      scope: ['', Validators.required],
      deadline: ['', Validators.required],
    });


  this.addTaskForm = this.fb.group({
    scope: ['', Validators.required],


  });
   }

   public triggerAddTaskModal() {
    this.addTaskModal = !this.addTaskModal;
    this.taskScopeArray=this.taskData.scope




   }

   changeTaskScope(e:any) {
    console.log(e.target.value);
    console.log(typeof e.target.value);
    // if (this.taskScopeArray.includes(e.target.value)) {
    //   console.log('already included')
    // } else if (!this.taskScopeArray.includes(e.target.value)) {
    //   this.taskScopeArray.push(e.target.value)
    //   console.log(this.taskScopeArray);

    //   this.taskScopeArray.forEach(element => {
    //     this.taskService.setRecipients(element).subscribe(res => {
    //       res.forEach((data: any) => {
    //         let pushToken = {
    //           pushToken: data.pushToken
    //         }
    //         let userData = {
    //           uid: data.id,
    //           status: 'Pending',
    //           section: data.section,
    //           submissionLink: '',
    //           displayName: data.displayName
    //         }
    //         console.log(data.pushToken)
    //         if (!this.taskRecipients.some(e => e.uid === userData.uid)) {
    //           this.taskRecipients.push(userData);

    //         }
    //         if (!this.userPushTokens.some(e => e.pushToken === pushToken.pushToken)) {
    //           this.userPushTokens.push(pushToken);

    //         }


    //       });
    //     })
    //   })
    // }
    // console.log(this.taskRecipients)
    // console.log(this.userPushTokens)
  }




  addTask() {

    if (this.addTaskForm.valid) {
      this.taskService.addTask(
        this.addTaskForm.controls['title'].value,
        this.addTaskForm.controls['description'].value,
        // this.taskScopeArray,
        this.newTaskScopeArray,
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
  updateTaskScope() {

  }

  }










