import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  getZapatosWithTalla(tallaZapato: string): Observable<any> {
    // Construir los parámetros de la consulta
    const params = new HttpParams().set('talla', tallaZapato);
    
    return this.http.get(this.apiUrl, { params });
  }

  getZapatoById(idZapato: string, tallaZapato: string): Observable<any> {
    // Construir los parámetros de la consulta
    const params = new HttpParams().set('talla', tallaZapato);

    return this.http.get(this.apiUrl + idZapato, { params });
  }

  getAllBrand(): Observable<any> {
    return this.http.post(this.apiUrl + "allBrand", {});
  }
}

