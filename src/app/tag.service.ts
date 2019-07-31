import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor() { }

  getUnAddedTags (): Observable<string> {
    return of(localStorage.getItem('unAddedTags'));
  }

  storeUnAddedTags (unAddedTags:string): Observable<boolean> {
    localStorage.setItem("unAddedTags", unAddedTags);
    return of(true);
  }

  getExistingTags (): Observable<string> {
    return of(localStorage.getItem('existingTags'));
  }
  
  storeExistingTags (existingTags:string): Observable<boolean> {
    localStorage.setItem("existingTags", existingTags);
    return of(true);
  }  
}
