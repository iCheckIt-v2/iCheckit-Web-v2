import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Params, ActivatedRoute } from '@angular/router';
import { AngularFireAuth  } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';
import { TaskService } from 'src/app/services/task.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import JSZip from 'jszip';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
})
export class TaskComponent implements OnInit {
  studentTaskList: any;
  dateToday = new Date();
  userData: any;
  fsData: any;
  id!: any;
  taskData: any;
  p: number = 1;
  updateStatusModal!: boolean;
  updateStatusForm: any;
  updatedStatus: any;
  displayName!: string;
  submissionLink!: string;
  status!: string;
  uid!: string;
  section!: string;
  uploadedBy!: string;
  createdAt!: string;
  taskId!: string;
  title!: string;
  description!: string;
  deadline!: any;
  email!: any;
  totalRecipients = 0;
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
  term!: string;
  closeSubmission!: boolean;
  submissionUrls: any;

  constructor(
    private afs: AngularFirestore,
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    readonly fire: AngularFireAuth,
    private taskService: TaskService,
    private fb: FormBuilder,
    private storage: AngularFireStorage,
    public toastService: ToastService
  ) {}

  ngOnInit(): void {
    var d = new Date();
    var y = d.getFullYear();
    var n = d.getMonth();
    console.log(n);
    console.log(y);
    if (n >= 1 && n <= 6) {
      console.log('January to June');
      console.log('2nd Term SY ' + y + '-' + (y + 1));
      this.term = '2nd Term SY ' + y + '-' + (y + 1);
    } else if (n >= 8 && n <= 12) {
      console.log('August to December');
      console.log('1st Term SY ' + y + '-' + (y + 1));
      this.term = '1st Term SY ' + y + '-' + (y + 1);
    } else {
      console.log('Summer Term' + y + '-' + (y + 1));
      this.term = 'Summer Term' + y + '-' + (y + 1);
    }

    this.fire.user.subscribe((user: any) => {
      this.userData = user;
      this.auth.getUserData(user?.uid).subscribe((res) => {
        this.fsData = res;
      });
    });
    // this.id = this.route.snapshot.paramMap.get('id');
    // this.taskService.getTask(this.route.snapshot.paramMap.get('id')?.toString()).subscribe((res) => {
    //   this.taskData = res;
    //   console.log(this.taskData);
    // })
    this.route.params
      .pipe(
        switchMap((params: Params) => {
          console.log(params['id']);
          return this.taskService.getTask(params['id']);
        })
      )
      .subscribe((res) => {
        this.taskData = res;
        console.log(res);
        this.totalRecipients = res.recipients.length;

        console.log('Pending recipients length');
        console.log(res.recipients);
        this.pendingRecipients = 0;
        this.forApprovalRecipients = 0;
        this.lateRecipients = 0;
        this.accomplishedRecipients = 0;

        res.recipients.forEach((element: any) => {
          // console.log(new Date(element.startsAt).getDate())
          if (Object.values(element).includes('Pending')) {
            this.pendingRecipients += 1;
          }
          if (Object.values(element).includes('For Approval')) {
            this.forApprovalRecipients += 1;
          }
          if (Object.values(element).includes('No Submission')) {
            this.lateRecipients += 1;
          }
          if (Object.values(element).includes('Accomplished')) {
            this.accomplishedRecipients += 1;
          }
        });
        this.pendingRecipientsPct =
          (this.pendingRecipients / this.totalRecipients) * 100;
        this.lateRecipientsPct =
          (this.lateRecipients / this.totalRecipients) * 100;
        this.forApprovalRecipientsPct =
          (this.forApprovalRecipients / this.totalRecipients) * 100;
        this.accomplishedRecipientsPct =
          (this.accomplishedRecipients / this.totalRecipients) * 100;

        console.log(this.pendingRecipients);
        console.log(this.forApprovalRecipients);
        console.log(this.lateRecipients);
        console.log(this.accomplishedRecipients);

        // this.lateRecipientsPct = Math.floor((this.totalRecipients / this.lateRecipients) * 100);
        // this.pendingRecipientsPct = Math.floor((this.totalRecipients / this.pendingRecipients) * 100);
        // this.forApprovalRecipientsPct = Math.floor((this.totalRecipients / this.forApprovalRecipients) * 100);
        // this.accomplishedRecipientsPct = Math.floor((this.totalRecipients / this.accomplishedRecipients) * 100)
        // console.log(this.lateRecipientsPct)
      });

    this.route.params
      .pipe(
        switchMap((params: Params) => {
          console.log(params['id']);
          return this.taskService.getAccomplishedTasks(params['id']);
        })
      )
      .subscribe((res) => {
        this.submissionUrls = res
          .filter((a: any) => a !== undefined)
          .map((url: any) => {
            return {
              studentId: url.studentId,
              displayName: url.displayName,
              section: url.section,
              url: url.attachmentPaths,
            };
          });
      });

    this.updateStatusForm = this.fb.group({
      status: ['', Validators.required],
    });
  }

  public bulkDownloadSubmission = () => {
    console.log('DOWNLOADING...');
    const title = this.taskData.title + ' Submissions';

    /*
    const files = this.submissionUrls.map((student: any) => {
      this.afs
        .collection('users')
        .doc(student.studentId)
        .snapshotChanges()
        .forEach((a) => {
          const d = a.payload.data();
          //@ts-ignore
          return d?.displayName;
        });

      return this.afs
        .collection('users')
        .doc(student.studentId)
        .snapshotChanges()
        .forEach((a) => {
          const d = a.payload.data();
          //@ts-ignore

          const studentFolder = zip.folder(d?.displayName.replace(' ', ''));
          return student.url.map((url: any, idx: any) => {
            return this.download(url, idx, student.studentId, studentFolder);
          });
        });
    });

    console.log('FILES', files);
*/
    const zip = new JSZip();

    if (this.submissionUrls && this.submissionUrls.length > 0) {
      if (this.submissionUrls[0]?.displayName) {
        const files = this.submissionUrls.map((student: any) => {
          const studentFolder = zip.folder(
            student?.section + '_' + student?.displayName.replace(' ', '')
          );
          return student.url.map((url: any, idx: any) => {
            console.log('URL', url);
            return this.download(url?.url, idx, url?.filename, studentFolder);
          });
        });

        console.log('FILES', files);

        files.map((prom: any, idx: number) => {
          Promise.all(prom).then(() => {
            zip.generateAsync({ type: 'blob' }).then(function (content) {
              saveAs(content, title);
            });
          });
        });
      } else {
        const files = this.submissionUrls.map((student: any) => {
          const studentFolder = zip.folder(student.studentId);
          return student.url.map((url: any, idx: any) => {
            return this.download(url, idx, student.studentId, studentFolder);
          });
        });

        console.log('FILES', files);

        files.map((prom: any, idx: number) => {
          Promise.all(prom).then(() => {
            zip.generateAsync({ type: 'blob' }).then(function (content) {
              saveAs(content, title);
            });
          });
        });
      }
    } else {
      this.toastService.publish('No submissions detected', 'formError');
    }
  };

  public download = async (
    url: any,
    idx: any,
    filename: any,
    studentFolder: any
  ) => {
    return axios.get(url, { responseType: 'blob' }).then((resp) => {
      console.log('RESP', resp);
      console.log('RESPONSE from download', resp.data);
      studentFolder.file(this.calculateFileName(url), resp.data);
    });
  };

  public calculateFileName(url: string) {
    const string = url.replace(
      'https://firebasestorage.googleapis.com/v0/b/icheckit-6a8bb.appspot.com/o/studentuploads',
      ''
    );
    const string2 = String(string).replace(/%2F/g, '');
    //console.log(string2);
    const string3 = string2.substring(48);
    console.log('FILENAME', string3.split('?')[0]);
    return string3.split('?')[0];
  }

  public triggerAddTaskModal(recipient?: any) {
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
    } else {
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

  changeTaskScope(e: any) {
    // this.status = e.target.value;
    this.updatedStatus = e.target.value;
    console.log(this.updatedStatus);
  }

  public triggerAcceptAllSubmissionModal() {
    this.acceptAllModal = !this.acceptAllModal;
  }
  public triggerRejectAllSubmissionModal() {
    this.rejectAllModal = !this.rejectAllModal;
  }

  public acceptAllSubmissions() {
    let oldData: any[] = [];
    let acceptedSubmissions: any[] = [];
    this.taskData.recipients.forEach((element: any) => {
      if (Object.values(element).includes('For Approval')) {
        console.log('Approved!');
        oldData.push(element);
      }
    });

    oldData.forEach((element: any) => {
      let updatedData = {
        createdAt: element.createdAt,
        startsAt: element.startsAt,
        deadline: element.deadline,
        description: element.description,
        displayName: element.displayName,
        email: element.email,
        pushToken: element.pushToken,
        section: element.section,
        status: 'Accomplished',
        submissionLink: element.submissionLink,
        taskId: element.taskId,
        title: element.title,
        uid: element.uid,
        uploadedBy: element.uploadedBy,
        term: element.term,
        submittedAt: element.submittedAt,
        attemptsLeft: element.attemptsLeft,
        deadlineLimit: element.deadlineLimit,
      };
      acceptedSubmissions.push(updatedData);
    });
    // acceptedSubmissions.forEach(data => {
    //   if (data.status == 'For Approval') {
    //     data.status == 'Accomplished'
    //   }
    // });
    // acceptedSubmissions.forEach(element => {
    //   oldData.forEach(oldElement => {
    //     console.log(element)
    //     console.log(oldElement)
    //     // this.taskService.updateStudentStatus(this.taskData.taskId,element,oldElement)
    //   });
    // });
    console.log(oldData);
    console.log(acceptedSubmissions);
    this.taskService.updateMultipleStudentStatus(
      this.taskData.taskId,
      acceptedSubmissions,
      oldData
    );
    this.acceptAllModal = !this.acceptAllModal;
  }

  public rejectAllSubmission() {
    let oldData: any[] = [];
    let acceptedSubmissions: any[] = [];
    this.taskData.recipients.forEach((element: any) => {
      if (Object.values(element).includes('For Approval')) {
        console.log('Approved!');
        oldData.push(element);
      }
    });

    oldData.forEach((element: any) => {
      let updatedData = {
        createdAt: element.createdAt,
        startsAt: element.startsAt,
        deadline: element.deadline,
        description: element.description,
        displayName: element.displayName,
        email: element.email,
        pushToken: element.pushToken,
        section: element.section,
        status: 'Pending',
        submissionLink: element.submissionLink,
        taskId: element.taskId,
        title: element.title,
        uid: element.uid,
        submittedAt: '',
        uploadedBy: element.uploadedBy,
        term: element.term,
        attemptsLeft: element.attemptsLeft,
        deadlineLimit: element.deadlineLimit,
      };
      acceptedSubmissions.push(updatedData);
    });
    // acceptedSubmissions.forEach(data => {
    //   if (data.status == 'For Approval') {
    //     data.status == 'Accomplished'
    //   }
    // });
    // acceptedSubmissions.forEach(element => {
    //   oldData.forEach(oldElement => {
    //     console.log(element)
    //     console.log(oldElement)
    //     // this.taskService.updateStudentStatus(this.taskData.taskId,element,oldElement)
    //   });
    // });
    console.log(oldData);
    console.log(acceptedSubmissions);
    this.taskService.updateMultipleStudentStatus(
      this.taskData.taskId,
      acceptedSubmissions,
      oldData
    );
    this.rejectAllModal = !this.rejectAllModal;
  }

  public acceptSubmission(recipient: any) {
    let accomplishedData = {
      createdAt: recipient.createdAt,
      startsAt: recipient.startsAt,
      deadline: recipient.deadline,
      description: recipient.description,
      displayName: recipient.displayName,
      email: recipient.email,
      section: recipient.section,
      pushToken: recipient.pushToken,
      status: 'Accomplished',
      submissionLink: recipient.submissionLink,
      submittedAt: recipient.submittedAt,
      taskId: recipient.taskId,
      title: recipient.title,
      uid: recipient.uid,
      uploadedBy: recipient.uploadedBy,
      term: recipient.term,
      attemptsLeft: recipient.attemptsLeft,
      deadlineLimit: recipient.deadlineLimit,
    };

    this.taskService.updateStudentStatus(
      this.taskData.taskId,
      accomplishedData,
      recipient
    );
  }

  public rejectSubmission(recipient: any) {
    let accomplishedData = {
      createdAt: recipient.createdAt,
      startsAt: recipient.startsAt,
      deadline: recipient.deadline,
      description: recipient.description,
      displayName: recipient.displayName,
      email: recipient.email,
      section: recipient.section,
      pushToken: recipient.pushToken,
      status: 'Pending',
      submissionLink: '',
      taskId: recipient.taskId,
      title: recipient.title,
      submittedAt: '',
      uid: recipient.uid,
      uploadedBy: recipient.uploadedBy,
      term: recipient.term,
      attemptsLeft: recipient.attemptsLeft,
      deadlineLimit: recipient.deadlineLimit,
    };
    console.log(recipient.submissionLink);
    this.storage
      .refFromURL(recipient.submissionLink)
      .delete()
      .subscribe((res) => console.log(res));

    this.taskService.updateStudentStatus(
      this.taskData.taskId,
      accomplishedData,
      recipient
    );
  }
  // updateStudentStatus() {
  //   let oldRecipientData = {
  //     displayName: this.displayName,
  //     submissionLink: this.submissionLink,
  //     status: this.status,
  //     uid: this.uid,
  //     section: this.section,
  //     title: this.taskData.title,
  //     taskId: this.taskData.taskId,
  //     description: this.taskData.description,
  //     deadline: this.taskData.deadline,
  //     uploadedBy: this.taskData.uploadedBy,
  //     createdAt: this.taskData.createdAt,
  //     email: this.email
  //   }
  //   let recipientData = {
  //     displayName: this.displayName,
  //     submissionLink: this.submissionLink,
  //     status: this.updatedStatus,
  //     uid: this.uid,
  //     section: this.section,
  //     title: this.taskData.title,
  //     taskId: this.taskData.taskId,
  //     description: this.taskData.description,
  //     deadline: this.taskData.deadline,
  //     uploadedBy: this.taskData.uploadedBy,
  //     createdAt: this.taskData.createdAt,
  //     email: this.email
  //   }
  //   // console.log(recipientData);
  //   this.taskService.updateStudentStatus(this.taskData.taskId,recipientData,oldRecipientData).then(() => {
  //     this.displayName = '';
  //     this.submissionLink = '';
  //     this.status = '';
  //     this.uid = '';
  //     this.section = '';
  //     this.createdAt = '';
  //     this.uploadedBy = '';
  //     this.title = '';
  //     this.description = '';
  //     this.deadline = '';
  //     this.taskId = '';
  //     this.email = '';
  //     this.updatedStatus = null;
  //     this.triggerAddTaskModal();
  //   })
  // }

  public triggerCloseSubmission() {
    this.closeSubmission = !this.closeSubmission;
  }

  public closeAllSubmission() {
    let oldData: any[] = [];
    let acceptedSubmissions: any[] = [];
    this.taskData.recipients.forEach((element: any) => {
      if (Object.values(element).includes('Pending')) {
        oldData.push(element);
      }
      if (Object.values(element).includes('No Submission')) {
        oldData.push(element);
      }
    });

    oldData.forEach((element: any) => {
      let updatedData = {
        createdAt: element.createdAt,
        startsAt: element.startsAt,
        deadline: element.deadline,
        description: element.description,
        displayName: element.displayName,
        email: element.email,
        pushToken: element.pushToken,
        section: element.section,
        status: 'No Submission',
        submissionLink: element.submissionLink,
        taskId: element.taskId,
        title: element.title,
        uid: element.uid,
        uploadedBy: element.uploadedBy,
        term: element.term,
        attemptsLeft: element.attemptsLeft,
        deadlineLimit: 0,
      };
      acceptedSubmissions.push(updatedData);
    });
    console.log(acceptedSubmissions);
    this.taskService
      .closeSubmissions(
        this.taskData.taskId,
        oldData,
        acceptedSubmissions,
        this.taskData.recipients
      )
      .then(() => {
        this.closeSubmission = !this.closeSubmission;
      });
  }
}
