import { Injectable, Inject } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, deleteDoc, DocumentData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { collectionData } from 'rxfire/firestore';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private collectionName = 'users';

  constructor(private firestore: Firestore) {}

  getUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, this.collectionName);
    return collectionData(usersRef, { idField: 'id' }) as Observable<User[]>;
  }

  addUser(user: User): Promise<void> {
    const userDoc = doc(this.firestore, `${this.collectionName}/${user.id}`);
    return setDoc(userDoc, user);
  }

  updateUser(user: User): Promise<void> {
    const userDoc = doc(this.firestore, `${this.collectionName}/${user.id}`);
    return updateDoc(userDoc, { ...user });
  }

  deleteUser(id: string): Promise<void> {
    const userDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(userDoc);
  }
}
