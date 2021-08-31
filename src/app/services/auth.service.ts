import { Injectable } from '@angular/core';
import { AngularFireAuth  } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private afs: AngularFirestore,
    private fns: AngularFireFunctions,
    readonly fire: AngularFireAuth, 
    public router: Router,
    public toastService: ToastService
  ) {
    this.fire.authState.subscribe(user => {
      if (user) {
        this.getUserData(user.uid).subscribe(res => {
          if (res.role != 'CICS Office Staff' && res.role != 'Department Head') {
            this.signOut().then(() => {
              this.toastService.publish('You are not allowed to access the web system. Please use the mobile application.','userDoesNotExist');
            })
          } else if (res.role == 'CICS Office Staff' || res.role == 'Department Head') {
              console.log('Authenticated')
          }
        })
      } else {
        console.log('logged out');
      }
    })
  }

  public signup(email:string, password:string,displayName:string,contactNumber:string) {
    return this.fire.createUserWithEmailAndPassword(email, password)
      // Update the user info with the given name
      .then(res=> {
        res.user?.updateProfile({displayName: displayName})
        .then(() => {
          const data = {
            uid: res.user?.uid,
            contactNumber: contactNumber,
            email: email,
            displayName: displayName,
            createdAt: Date.now(),
            role: 'CICS Office Staff'
          }
          this.afs.collection('users')
          .doc(res.user?.uid).set(data)
          .catch(error => console.log(error));
        })
        .then(() => {res.user,console.log(res.user)})
      })
  }

  public signOut(): Promise<void> {
    console.log('Signing-out');
    //this.guard.prompt('signIn').then(user => {})
    return this.fire.signOut()
    .then(() => {this.router.navigate(['/login'])})
  }

  public signIn(email: string, password: string) {
    return this.fire.setPersistence('local').then(()=> {
      this.fire.signInWithEmailAndPassword(email,password)
      .then(a => console.log('logged in!'))
      .then(a => this.router.navigate(['/dashboard']))
      .catch((err) => {
        this.toastService.publish('The credentials you have entered does not match any user in our database','userDoesNotExist');
      })
    })
  }

  public getUserData(id:string):Observable<any> {
    return this.afs.collection('users')
    .doc(id)
    .snapshotChanges()
    .pipe(
      map((doc: any) => {
        // console.log(doc)
        return { id: doc.payload.id, ...doc.payload.data() };
      })
    );
  }

  public sendPasswordReset(email: string) {
    return this.fire.sendPasswordResetEmail(email).then(res => { console.log(res), this.toastService.publish('Email has been sent to ' + email,'formSuccess')}).catch((err) => {
      this.toastService.publish('The credentials you have entered does not match any user in our database','userDoesNotExist');})
  }
//firstName:string,lastName:string,email:string,contactNumber:string

  public changeEmail(currentEmail:string, newEmail:string, password:string,id:string): Promise<any> {
    return this.fire.signInWithEmailAndPassword(currentEmail,password).then((res) => {
      res.user?.updateEmail(newEmail).then(() => {
        this.afs.collection('users').doc(id).set({
          email: newEmail
        }, { merge: true }) })
        .catch(() => {
          this.toastService.publish('The email ' + newEmail + ' is already registered in our database!','userDoesNotExist')
        })
    })
    .then(() => this.toastService.publish('Your email has been updated to ' + newEmail,'formSuccess'))
    .catch(() => this.toastService.publish('The credentials you have entered does not match any user in our database','userDoesNotExist'))
  }

 public editMyProfile(displayName:string, contactNumber:string, currentEmail:string, password:string,id:string): Promise<any> {
    return this.fire.signInWithEmailAndPassword(currentEmail,password).then((res) => {
      res.user?.updateProfile({displayName: displayName})
    }).then(() => {
      this.afs.collection('users').doc(id).set({
        contactNumber: contactNumber,
        displayName: displayName,
      }, { merge: true })
    })
    .then(() => this.toastService.publish('Your profile has been updated','formSuccess'))
    .catch(() => this.toastService.publish('The password you have entered is incorrect','userDoesNotExist'))
  }
  public deleteMyProfile(email:string,password:string,id:string): Promise<any> {
    return this.fire.signInWithEmailAndPassword(email,password).then((res) => {
      this.afs.collection('users').doc(res.user?.uid).delete()
      .then(() => {
        res.user?.delete()
      })
      .then(() => {
        this.router.navigate(['/login'])
      })
      .then(() => {
        this.toastService.publish('Your account with the credentials ' + email + " has been deleted from our system",'userDoesNotExist')      
      })
    }).catch(() => {
      this.toastService.publish('The credentials you have entered does not match any user in our database','userDoesNotExist');
    })
  }

  public changeMyPassword(email:string, oldPassword:string, newPassword:string): Promise<any> {
    return this.fire.signInWithEmailAndPassword(email,oldPassword).then((res) => {
      res.user?.updatePassword(newPassword)
      .then(() => {
        this.toastService.publish('Your password has been updated','formSuccess')
      })
    }).catch(() => {
      this.toastService.publish('The credentials you have entered does not match any user in our database','userDoesNotExist');
    })
  }
  
}
