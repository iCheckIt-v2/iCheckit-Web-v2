import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  callbacks: ((message: string) => void)[] = [];

  constructor() { }

  publish(message: string) {
    this.callbacks.forEach(callback => {
        callback(message);
    });
  }

  subscribe(callback: (message: string) => void) {
    this.callbacks.push(callback)
  } 
  
}
