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
  uploadedBy!:string;
  createdAt!:string;
  taskId!:string;
  title!:string;
  description!:string;
  deadline!:any;
  email!:any;
  totalRecipients: any;
  pendingRecipients = 0;
  lateRecipients = 0;
  forApprovalRecipients = 0;
  accomplishedRecipients = 0;
  pendingRecipientsPct = 0;
  lateRecipientsPct = 0;
  forApprovalRecipientsPct = 0;
  accomplishedRecipientsPct = 0;
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
      this.totalRecipients = res.recipients.length;
      res.recipients.forEach((element: any) => {
        if(Object.values(element).includes("Pending")) { 
          this.pendingRecipients += 1;
        }
        if(Object.values(element).includes("For Approval")) { 
          this.forApprovalRecipients += 1;
        }
        if(Object.values(element).includes("Late")) { 
          this.lateRecipients += 1;
        }
        if(Object.values(element).includes("Accomplished")) { 
          this.accomplishedRecipients += 1;
        }
      });
      console.log(this.pendingRecipients)
      console.log(this.forApprovalRecipients)
      console.log(this.lateRecipients)
      console.log(this.accomplishedRecipients)

      // this.lateRecipientsPct = Math.floor((this.totalRecipients / this.lateRecipients) * 100);
      // this.pendingRecipientsPct = Math.floor((this.totalRecipients / this.pendingRecipients) * 100);
      // this.forApprovalRecipientsPct = Math.floor((this.totalRecipients / this.forApprovalRecipients) * 100);
      // this.accomplishedRecipientsPct = Math.floor((this.totalRecipients / this.accomplishedRecipients) * 100)
      // console.log(this.lateRecipientsPct)
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
      this.createdAt = '';
      this.uploadedBy = '';
      this.title = '';   
      this.description = '';    
      this.deadline = '';
      this.taskId = '';
      this.email = '';
    }
    else {
      this.displayName = recipient.displayName;
      this.submissionLink = recipient.submissionLink;
      this.status = recipient.status;
      this.uid = recipient.uid;
      this.section = recipient.section; 
      this.title = this.taskData.title; 
      this.taskId = this.taskData.taskId; 
      this.description = this.taskData.description; 
      this.deadline = this.taskData.deadline; 
      this.uploadedBy = this.taskData.uploadedBy; 
      this.createdAt = this.taskData.createdAt;
      this.email = recipient.uid;
    
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
      section: this.section,
      title: this.taskData.title,
      taskId: this.taskData.taskId,
      description: this.taskData.description,
      deadline: this.taskData.deadline,
      uploadedBy: this.taskData.uploadedBy,
      createdAt: this.taskData.createdAt,
      email: this.email
    }
    let recipientData = {
      displayName: this.displayName,
      submissionLink: this.submissionLink,
      status: this.updatedStatus,
      uid: this.uid,
      section: this.section,
      title: this.taskData.title,
      taskId: this.taskData.taskId,
      description: this.taskData.description,
      deadline: this.taskData.deadline,
      uploadedBy: this.taskData.uploadedBy,
      createdAt: this.taskData.createdAt,
      email: this.email
    }
    // console.log(recipientData);
    this.taskService.updateStudentStatus(this.taskData.taskId,recipientData,oldRecipientData).then(() => {
      this.displayName = '';
      this.submissionLink = '';
      this.status = '';
      this.uid = '';
      this.section = '';   
      this.createdAt = '';
      this.uploadedBy = '';
      this.title = '';   
      this.description = '';    
      this.deadline = '';
      this.taskId = '';
      this.email = '';
      this.updatedStatus = null;
      this.triggerAddTaskModal();
    })
  }

}
