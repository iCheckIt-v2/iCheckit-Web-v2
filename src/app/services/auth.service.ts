import { Injectable } from '@angular/core';
import { AngularFireAuth  } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData:any;
  fsData!: Observable<any>;

  constructor(
    private afs: AngularFirestore,
    private fns: AngularFireFunctions,
    readonly fire: AngularFireAuth, 
    public router: Router
  ) {
/*
    this.fire.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        console.log('logged in')

      } else {
        console.log('logged out')
        /*
        localStorage.removeItem('userData');
        localStorage.removeItem('fsData');

      }
    })
    */
  }


  public get auth() { return this.fire; }


  public signup(email:string, password:string,displayName:string,contactNumber:string) {
    
    return this.fire.createUserWithEmailAndPassword(email, password)
      // Update the user info with the given name
      .then(res=> {
        res.user?.updateProfile({displayName: displayName})
        .then(() => {
          const data = {
            uid: res.user?.uid,
            photoUrl: '',
            email: email,
            displayName: displayName,
            role: 'Admin'
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
    return this.fire.signOut();
  }

  public signIn(email: string, password: string) {
    return this.fire.setPersistence('local').then(()=> {
      this.fire.signInWithEmailAndPassword(email,password).then(res => {res.user, console.log(res.user)})
      .then(a => {this.router.navigate(['/dashboard'])})
    })
  }

  public getUserData(id:string) {
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
  
}
