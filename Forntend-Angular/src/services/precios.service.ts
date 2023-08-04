import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreciosService {
  private apiUrl = 'http://localhost:3100/prices'; // URL de la API externa

  constructor(private http: HttpClient) {}

  getPrices(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getPricesByProduct(idProduct: string): Observable<any>{
    return this.http.get(this.apiUrl + "/byProduct/" + idProduct);
  }
}