import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZapatosService {
  private apiUrl = 'http://localhost:3100/productos/'; // URL de la API externa

  constructor(private http: HttpClient) {}

  getZapatos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getZapatoById(idZapato: string): Observable<any> {
    return this.http.get(this.apiUrl + idZapato);
  }

  getAllBrand(): Observable<any> {
    return this.http.post(this.apiUrl + "allBrand", {});
  }
}

