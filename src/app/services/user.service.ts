import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireAuth  } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private afs: AngularFirestore,
    readonly fire: AngularFireAuth, 
  ) { }

  public getDeptHeadUsers():Observable<any> {
    return this.afs.collection('users', ref => ref.where('role','==','Department Head').orderBy('createdAt','desc'))
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

  public getStudentUsers():Observable<any> {
    return this.afs.collection('users', ref => ref.where('role','==','Student').orderBy('createdAt','desc'))
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

  public getAdminUsers():Observable<any> {
    return this.afs.collection('users', ref => ref.where('role','==','CICS Office Staff').orderBy('createdAt','desc'))
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
  
  createStudentAccount(displayName:string,section:string,course:string,contactNumber:string,email:string) {
      return this.fire.createUserWithEmailAndPassword(email,'password')
      .then(res => {
        res.user?.updateProfile({displayName: displayName})
        .then(() => {
          const data = {
            uid: res.user?.uid,
            contactNumber: contactNumber,
            email: email,
            section: section,
            course: course,
            displayName: displayName,
            createdAt: Date.now(),
            role: 'Student'
          }
          this.afs.collection('users')
          .doc(res.user?.uid).set(data)
          .catch(error => console.log(error));
        })
        .then(() => {alert('Student account with the email ' + email + ' has been created')})
      })
  }
  
}
