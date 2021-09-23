import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Params, ActivatedRoute } from '@angular/router';
import { AngularFireAuth  } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';
import { TaskService } from 'src/app/services/task.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  dateToday = new Date();
  userData:any;
  fsData: any;
  id!: any;
  taskData: any;
  totalRecipients = 0;
  pendingRecipients = 0;
  lateRecipients = 0;
  forApprovalRecipients = 0;
  accomplishedRecipients = 0;
  pendingRecipientsPct = 0;
  lateRecipientsPct = 0;
  forApprovalRecipientsPct = 0;
  accomplishedRecipientsPct = 0;
  constructor( 
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    readonly fire: AngularFireAuth,
    private taskService: TaskService,
    private fb: FormBuilder,
    private storage: AngularFireStorage) { }

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

      this.totalRecipients = res.recipients.length;

      console.log('Pending recipients length');
      console.log(res.recipients)
      this.pendingRecipients = 0;
      this.forApprovalRecipients = 0;
      this.lateRecipients = 0;
      this.accomplishedRecipients = 0;
      
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
      this.pendingRecipientsPct = (this.pendingRecipients / this.totalRecipients) * 100;
      this.lateRecipientsPct = (this.lateRecipients / this.totalRecipients) * 100;
      this.forApprovalRecipientsPct = (this.forApprovalRecipients / this.totalRecipients) * 100;
      this.accomplishedRecipientsPct = (this.accomplishedRecipients / this.totalRecipients) * 100;
    })
  }

}
