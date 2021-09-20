import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth  } from '@angular/fire/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from './toast.service';
import { Observable } from 'rxjs';
import { map, retry } from 'rxjs/operators';
import firebase from 'firebase/app';
import { Router } from '@angular/router';

// import * as firestore from '@google-cloud/firestore';
@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(
    private afs: AngularFirestore,
    readonly fire: AngularFireAuth,
    private http: HttpClient,
    public toastService: ToastService,
    public router: Router,
  ) { }

  public getVerifyTasks():Observable<any> {
    return this.afs.collection('tasks',ref => ref.orderBy('type','desc'))
    .snapshotChanges()
    .pipe(
      map((doc: any) => {
        // console.log(doc)
        return doc.map(
          (c: { payload: { doc: { data: () => any; id: any; }; }; }) => {
            const data = c.payload.doc.data();
            const id = c.payload.doc.id;
            return { id, ...data };
          }
        )})
    );
  }

  public getTaskRecipients():Observable<any> {
    return this.afs.collection('tasks',ref => ref.orderBy('type','desc'))
    .snapshotChanges()
    .pipe(
      map((doc: any) => {
        // console.log(doc)
        return doc.map(
          (c: { payload: { doc: { data: () => any; id: any; }; }; }) => {
            const data = c.payload.doc.data();
            const id = c.payload.doc.id;
            return { id, ...data };
          }
        )})
    );
  }

  public setRecipients(scope:string):Observable<any> {
    return this.afs.collection('users',ref => ref.where('section','==',scope))
    .snapshotChanges()
    .pipe(
      map((doc: any) => {
        // console.log(doc)
        return doc.map(
          (c: { payload: { doc: { data: () => any; id: any; }; }; }) => {
            const data = c.payload.doc.data();
            const id = c.payload.doc.id;
            return { id, ...data };
          }
        )})
    );
  }

  public getTask(id:string):Observable<any> {
    // return this.afs.collection('tasks',ref => ref.where('taskId','==',id))
    // .snapshotChanges()
    // .pipe(
    //   map((doc: any) => {
    //     // console.log(doc)
    //     return doc.map(
    //       (c: { payload: { doc: { data: () => any; id: any; }; }; }) => {
    //         const data = c.payload.doc.data();
    //         const id = c.payload.doc.id;
    //         return { id, ...data };
    //       }
    //     )})
    // );
    return this.afs.collection('tasks',ref => ref.where('taskId','==',id))
    .doc(id)
    .snapshotChanges()
    .pipe(
      map((doc: any) => {
        // console.log(doc)
        return { id: doc.payload.id, ...doc.payload.data() };
      })
    );
  }

  public addTask(title:string, description:string, scope:Array<string>,deadline:Date,uploadedBy:string, recipients: Array<any>,pushTokens: any ):Promise<any> {
    let taskId = this.afs.createId();
    
    recipients.forEach(recipient => {
      recipient.title = title;
      recipient.taskId = taskId;
      recipient.description = description;
      recipient.deadline = + deadline;
      recipient.uploadedBy = uploadedBy;
      recipient.createdAt = + new Date();
      console.log(recipient)
    });
      let task = {
        taskId: taskId,
        title: title,
        description: description,
        scope: scope,
        status: 'Pending',
        createdAt:+ new Date(),
        deadline:+ deadline,
        uploadedBy: uploadedBy,
        recipients: recipients,
        type: 'task',
        pushTokens: pushTokens
      }

      console.log(task)
      console.log(+ new Date(Date.now()))

      return this.afs.collection('tasks').doc(taskId).set(task)
      .then(() => {
        this.toastService.publish('Task has been succesfully created!','formSuccess')      
      }).then(() => {
        this.router.navigate(['/task/',taskId])
      })
      .catch(() => {
        this.toastService.publish('There has been an error with the creation of the task','userDoesNotExist')
      })
  }

  public updateStudentStatus(id:string,newData:any,oldData:any) {
    return this.afs.collection('tasks').doc(id).update({
      recipients: firebase.firestore.FieldValue.arrayRemove(oldData),
    }).then(() => {
      this.afs.collection('tasks').doc(id).update({
        recipients: firebase.firestore.FieldValue.arrayUnion(newData),
      })
    }).then((res) => {
      if (newData.status == 'Pending') {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        const params: URLSearchParams = new URLSearchParams();
    
        // console.log(newData.email);
        var email = newData.email;
        var uploadedBy = newData.uploadedBy;
        var title = newData.title;
        var deadline = newData.deadline;
        var description = newData.description;
        var status = newData.status;
        var message = 'Your task status has been updated to ' + status + '!';
        var instructions = 'Your submission was rejected! Please re-submit your proof of completion and follow the proper instructions of the given task.'
  
        params.set('email', email);
        params.set('uploadedBy', uploadedBy);
        params.set('title', title);
        params.set('deadline', deadline);
        params.set('description', description);
        params.set('status', status);
        params.set('message', message);
        params.set('instructions', instructions);

  
        this.http.post(`https://us-central1-icheckit-6a8bb.cloudfunctions.net/sendEmail`, {
        email,
        uploadedBy,
        title,
        deadline,
        description,
        status,
        message
        }, {
          headers
        }).toPromise().then(
          () => {
            this.toastService.publish('Email has been sent to ' + email,'formSuccess')      
          }
        )
      }

      if (newData.status == 'Accomplished') {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        const params: URLSearchParams = new URLSearchParams();
    
        // console.log(newData.email);
        var email = newData.email;
        var uploadedBy = newData.uploadedBy;
        var title = newData.title;
        var deadline = newData.deadline;
        var description = newData.description;
        var status = newData.status;
        var message = 'Your task status has been updated to ' + status + '!';
        var instructions = 'Your submission was approved! Visit the mobile app to view your accomplished submission.'
  
        params.set('email', email);
        params.set('uploadedBy', uploadedBy);
        params.set('title', title);
        params.set('deadline', deadline);
        params.set('description', description);
        params.set('status', status);
        params.set('message', message);
        params.set('instructions', instructions);

  
        this.http.post(`https://us-central1-icheckit-6a8bb.cloudfunctions.net/sendEmail`, {
        email,
        uploadedBy,
        title,
        deadline,
        description,
        status,
        message
        }, {
          headers
        }).toPromise().then(
          () => {
            this.toastService.publish('Email has been sent to ' + email,'formSuccess')      
          }
        )
      }
    
    }).catch((err) => {
      console.log(err);
    })


  }



  public deleteTask(id:string): Promise <any> {
    return this.afs.collection('tasks').doc(id).delete().then((res) => {
      console.log(res)
    })
    .catch((err) =>{
      console.log(err)
    })
  }

}


