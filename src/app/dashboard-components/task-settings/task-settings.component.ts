import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Params, ActivatedRoute } from '@angular/router';
import { AngularFireAuth  } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';
import { TaskService } from 'src/app/services/task.service';
import { switchMap } from 'rxjs/operators';
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


	constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    readonly fire: AngularFireAuth,
    private taskService: TaskService
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
   }
}

