import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BannerMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class BannerService {

  constructor() { }

  private bannerSubject = new BehaviorSubject<BannerMessage | null>(null);
  banner$ = this.bannerSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.bannerSubject.next({ message, type });
  }

  clear() {
    this.bannerSubject.next(null);
  }
}


