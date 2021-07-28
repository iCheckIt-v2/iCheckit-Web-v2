import { Injectable } from '@angular/core';
import { AngularFireAuth  } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private afs: AngularFirestore,
    private fns: AngularFireFunctions,
    readonly fire: AngularFireAuth, 
  ) {} 

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
  
}
