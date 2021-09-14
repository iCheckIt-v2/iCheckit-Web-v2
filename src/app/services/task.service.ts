import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth  } from '@angular/fire/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from './toast.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    public toastService: ToastService
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

  public addTask(title:string, description:string, scope:Array<string>,deadline:Date,uploadedBy:string, recipients: Array<any>,pushTokens: any ) {
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
      this.afs.collection('tasks').doc(taskId).set(task)
  }

  public updateStudentStatus(id:string,newData:any,oldData:any) {
    return this.afs.collection('tasks').doc(id).update({
      recipients: firebase.firestore.FieldValue.arrayRemove(oldData),
    }).then(() => {
      this.afs.collection('tasks').doc(id).update({
        recipients: firebase.firestore.FieldValue.arrayUnion(newData),
      })
    }).then((res) => {
      console.log(res);
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


