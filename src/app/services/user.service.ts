import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireAuth  } from '@angular/fire/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from './toast.service';

// import { countReset } from 'console';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private afs: AngularFirestore,
    readonly fire: AngularFireAuth,
    private http: HttpClient,
    public toastService: ToastService
  ) {}

  public getDeptHeadUsers(): Observable<any> {
    return this.afs
      .collection('users', (ref) =>
        ref.where('role', '==', 'Department Head').orderBy('createdAt', 'desc')
      )
      .snapshotChanges()
      .pipe(
        map((doc: any) => {
          // console.log(doc)
          return doc.map(
            (c: { payload: { doc: { data: () => any; id: any } } }) => {
              const data = c.payload.doc.data();
              const id = c.payload.doc.id;
              return { id, ...data };
            }
          );
        })
      );
  }

  public getAdmin(id: string): Observable<any> {
    // return this.afs.collection('users')
    // .doc(id)
    // .snapshotChanges()
    // .pipe(
    //   map((doc: any) => {
    //     // console.log(doc)
    //     return { id: doc.payload.id, ...doc.payload.data() };
    //   })
    // );
    return this.afs.collection('users').doc(id).valueChanges();
  }

  public getStudent(id: string): Observable<any> {
    // return this.afs.collection('users')
    // .doc(id)
    // .snapshotChanges()
    // .pipe(
    //   map((doc: any) => {
    //     // console.log(doc)
    //     return { id: doc.payload.id, ...doc.payload.data() };
    //   })
    // );
    return this.afs.collection('users').doc(id).valueChanges();
  }

  public getStudentUsers(): Observable<any> {
    return this.afs
      .collection('users', (ref) =>
        ref.where('role', '==', 'Student').orderBy('createdAt', 'desc')
      )
      .snapshotChanges()
      .pipe(
        map((doc: any) => {
          // console.log(doc)
          return doc.map(
            (c: { payload: { doc: { data: () => any; id: any } } }) => {
              const data = c.payload.doc.data();
              const id = c.payload.doc.id;
              return { id, ...data };
            }
          );
        })
      );
  }

  public getArchivedUsers(): Observable<any> {
    return this.afs
      .collection('users', (ref) =>
        ref.where('role', '==', 'Archived').orderBy('createdAt', 'desc')
      )
      .snapshotChanges()
      .pipe(
        map((doc: any) => {
          // console.log(doc)
          return doc.map(
            (c: { payload: { doc: { data: () => any; id: any } } }) => {
              const data = c.payload.doc.data();
              const id = c.payload.doc.id;
              return { id, ...data };
            }
          );
        })
      );
  }

  public getAdminUsers(): Observable<any> {
    return this.afs
      .collection('users', (ref) =>
        ref
          .where('role', '==', 'CICS Office Staff')
          .orderBy('createdAt', 'desc')
      )
      .snapshotChanges()
      .pipe(
        map((doc: any) => {
          // console.log(doc)
          return doc.map(
            (c: { payload: { doc: { data: () => any; id: any } } }) => {
              const data = c.payload.doc.data();
              const id = c.payload.doc.id;
              return { id, ...data };
            }
          );
        })
      );
  }
  //https://us-central1-icheckit-6a8bb.cloudfunctions.net/adminCreateStudent

  adminCreateStudent(
    displayName: string,
    section: string,
    course: string,
    contactNumber: string,
    email: string
  ): Promise<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    const params: URLSearchParams = new URLSearchParams();
    params.set('email', email);
    params.set('displayName', displayName);

    return (
      this.http
        .post(
          `https://us-central1-icheckit-6a8bb.cloudfunctions.net/adminCreateStudent`,
          {
            email,
            displayName,
          },
          {
            headers,
          }
        )
        .toPromise()
        .then((cred: any) => {
          const uid = cred.userRecord.uid;
          const data = {
            uid: uid,
            contactNumber: contactNumber,
            email: email,
            section: section,
            verified: 'Enrolled',
            pushToken: '',
            course: course,
            displayName: displayName,
            createdAt: Date.now(),
            role: 'Student',
          };
          this.afs
            .collection('users')
            .doc(uid)
            .set(data)
            .catch((error) => console.log(error));
        })
        .then(() => {
          this.toastService.publish(
            'Student account with the email ' +
              email +
              ' has been successfully created',
            'formSuccess'
          );
        })
        // .catch(() => {
        //   this.toastService.publish('The student account creation was not successful. The user email might have been already existing in our database,','userDoesNotExist');
        // });
        .catch((err) => {
          this.toastService.publish(
            'The student account creation was not successful. The user email might have been already existing in our database,',
            'userDoesNotExist'
          );
        })
    );
  }

  createAdmin(
    displayName: string,
    department: string,
    contactNumber: string,
    email: string
  ): Promise<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    const params: URLSearchParams = new URLSearchParams();
    params.set('email', email);
    params.set('displayName', displayName);

    return this.http
      .post(
        `https://us-central1-icheckit-6a8bb.cloudfunctions.net/adminCreateStudent`,
        {
          email,
          displayName,
        },
        {
          headers,
        }
      )
      .toPromise()
      .then((cred: any) => {
        const uid = cred.userRecord.uid;
        const data = {
          uid: uid,
          contactNumber: contactNumber,
          email: email,
          department: department,
          verified: 'Enrolled',
          displayName: displayName,
          createdAt: Date.now(),
          role: 'Department Head', //just recycled the code for create student
        };
        this.afs
          .collection('users')
          .doc(uid)
          .set(data)
          .catch((error) => console.log(error));
      })
      .then(() => {
        this.toastService.publish(
          'Student account with the email ' +
            email +
            ' has been successfully created',
          'formSuccess'
        );
      })
      .catch((err) => {
        console.log(err);
        this.toastService.publish(
          'The admin account creation was not successful. The user email might have been already existing in our database,',
          'userDoesNotExist'
        );
      });
  }

  // createStudentAccount(displayName:string,section:string,course:string,contactNumber:string,email:string) {
  //     return this.fire.createUserWithEmailAndPassword(email,'password')
  //     .then(res => {
  //       res.user?.updateProfile({displayName: displayName})
  //       .then(() => {
  //         const data = {
  //           uid: res.user?.uid,
  //           contactNumber: contactNumber,
  //           email: email,
  //           section: section,
  //           course: course,
  //           verified: false,
  //           displayName: displayName,
  //           createdAt: Date.now(),
  //           role: 'Student'
  //         }
  //         this.afs.collection('users')
  //         .doc(res.user?.uid).set(data)
  //         .catch(error => console.log(error));
  //       })
  //       .then(() => {alert('Student account with the email ' + email + ' has been created')})
  //     })
  // }

  deleteUserAccount(id: string, email: string): Promise<any> {
    return this.afs
      .collection('users')
      .doc(id)
      .delete()
      .then(() => {
        this.toastService.publish(
          'User account with the email ' +
            email +
            ' has been successfully deleted',
          'formSuccess'
        );
      })
      .catch(() => {
        this.toastService.publish(
          'There has been an issue with the deletion of the account: ' + email,
          'userDoesNotExist'
        );
      });
  }

  archiveUserAccount(
    id: string,
    email: string,
    yearGraduated: number,
  ): Promise<any> {
    
      return this.afs
        .collection('users')
        .doc(id)
        .update({
          role: 'Archived',
          yearGraduated: yearGraduated,
        })
        .then(() => {
          this.toastService.publish(
            'User account with the email ' +
              email +
              ' has been successfully archived',
            'formSuccess'
          );
        })
        .catch(() => {
          this.toastService.publish(
            'There has been an issue with the archiving of the account: ' +
              email,
            'userDoesNotExist'
          );
        });
    
  }

  updateUserAccount(
    id: string,
    email: string,
    displayName: string,
    contactNumber: string,
    course: string,
    section: string
  ): Promise<any> {
    return this.afs
      .collection('users')
      .doc(id)
      .update({
        email: email,
        displayName: displayName,
        contactNumber: contactNumber,
        course: course,
        section: section,
        //  department: department
      })
      .then(() => {
        this.toastService.publish(
          'User account with the email ' +
            email +
            ' has been successfully updated',
          'formSuccess'
        );
      })
      .catch(() => {
        this.toastService.publish(
          'There has been an issue with the update of the account: ' + email,
          'userDoesNotExist'
        );
      });
  }

  updateAdminAccount(
    id: string,
    email: string,
    displayName: string,
    contactNumber: string,
    department: string
  ): Promise<any> {
    return this.afs
      .collection('users')
      .doc(id)
      .update({
        email: email,
        displayName: displayName,
        contactNumber: contactNumber,
        department: department,

        //  department: department
      })
      .then(() => {
        this.toastService.publish(
          'User account with the email ' +
            email +
            ' has been successfully updated',
          'formSuccess'
        );
      })
      .catch(() => {
        this.toastService.publish(
          'There has been an issue with the update of the account: ' + email,
          'userDoesNotExist'
        );
      });
  }
}
