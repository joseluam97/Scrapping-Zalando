import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {

  private zapatoSelected: any;
  private selectedZapatoSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor() { }

  setZapatoSelected(zapato: any) {
    this.selectedZapatoSubject.next(zapato);
  }

  getZapatoSelected() : Observable<any> {
    return this.selectedZapatoSubject.asObservable();
  }
}
