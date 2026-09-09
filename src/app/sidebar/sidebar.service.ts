import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidebarOpenSubject = new BehaviorSubject<boolean>(window.innerWidth > 768);
  sidebarOpen$ = this.sidebarOpenSubject.asObservable();

  toggle() {
    this.sidebarOpenSubject.next(!this.sidebarOpenSubject.value);
  }

  setOpen(state: boolean) {
    this.sidebarOpenSubject.next(state);
  }
}
