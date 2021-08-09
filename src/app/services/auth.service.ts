import { Injectable } from '@angular/core';
import { AngularFireAuth  } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData:any;

  constructor(
    private afs: AngularFirestore,
    private fns: AngularFireFunctions,
    readonly fire: AngularFireAuth, 
  ) {
    this.fire.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        console.log('logged in')
        localStorage.setItem('user', JSON.stringify(this.userData));
      } else {
        console.log('logged out')
        localStorage.removeItem('user');
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
    })
    
  }
  
}
