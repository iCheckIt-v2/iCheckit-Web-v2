import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Params, ActivatedRoute } from '@angular/router';
import { AngularFireAuth  } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';
import { TaskService } from 'src/app/services/task.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  dateToday = new Date();
  userData:any;
  fsData: any;
   id!: any;
  taskData: any;
  p: number = 1;
  updateStatusModal!: boolean;
  updateStatusForm: any;
  updatedStatus:any;
  displayName!:string;
  submissionLink!:string;
  status!:string;
  uid!:string;
  section!:string;
  acceptAllModal!: boolean;
  rejectAllModal!: boolean;
  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    readonly fire: AngularFireAuth,
    private taskService: TaskService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.fire.user.subscribe((user:any) => {
      this.userData = user;
      this.auth.getUserData(user?.uid).subscribe(res => {
        this.fsData = res;
      })
    })
    // this.id = this.route.snapshot.paramMap.get('id');
    // this.taskService.getTask(this.route.snapshot.paramMap.get('id')?.toString()).subscribe((res) => {
    //   this.taskData = res;
    //   console.log(this.taskData);
    // })
    this.route.params.pipe(
      switchMap((params: Params) => {
        console.log(params['id']);
        return this.taskService.getTask(params['id'])
      })
    ).subscribe((res) => {
      this.taskData = res;
      console.log(res);
      console.log(res.recipients.length);
    })

    this.updateStatusForm = this.fb.group({
      status: ['', Validators.required,],
    });
  }

  public triggerAddTaskModal(recipient?:any) {
    if (recipient == null) {
      this.updateStatusModal = !this.updateStatusModal;
      this.displayName = '';
      this.submissionLink = '';
      this.status = '';
      this.uid = '';
      this.section = '';
    }
    else {
      this.displayName = recipient.displayName;
      this.submissionLink = recipient.submissionLink;
      this.status = recipient.status;
      this.uid = recipient.uid;
      this.section = recipient.section;

      this.updateStatusModal = !this.updateStatusModal;
      this.updateStatusForm.controls.status.setValue(recipient.status);
    }
  }

  changeTaskScope(e:any) {
    // this.status = e.target.value;
    this.updatedStatus = e.target.value;
    console.log(this.updatedStatus);
  }

  public triggerAcceptAllSubmissionModal() {
    this.acceptAllModal =! this.acceptAllModal;
  }
  public triggerRejectAllSubmissionModal() {
    this.rejectAllModal =! this.rejectAllModal;
  }

  updateStudentStatus() {
    let oldRecipientData = {
      displayName: this.displayName,
      submissionLink: this.submissionLink,
      status: this.status,
      uid: this.uid,
      section: this.section
    }
    let recipientData = {
      displayName: this.displayName,
      submissionLink: this.submissionLink,
      status: this.updatedStatus,
      uid: this.uid,
      section: this.section
    }
    // console.log(recipientData);
    this.taskService.updateStudentStatus(this.taskData.taskId,recipientData,oldRecipientData).then(() => {
      this.displayName = '';
      this.submissionLink = '';
      this.status = '';
      this.uid = '';
      this.section = '';
      this.updatedStatus = null;
      this.triggerAddTaskModal();
    })
  }

}
