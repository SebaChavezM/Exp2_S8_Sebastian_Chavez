import { Injectable, Inject } from '@angular/core';
import { Firestore, collectionData, collection, doc, setDoc, updateDoc, deleteDoc, DocumentReference, DocumentData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { addDoc } from 'firebase/firestore';

export interface User {
  id?: string;
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
    const usersRef = collection(this.firestore, this.collectionName);
    return addDoc(usersRef, user).then(() => {});
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
