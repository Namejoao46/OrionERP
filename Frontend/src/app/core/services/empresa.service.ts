import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private apiUrl = 'http://localhost:8080/api/empresas'; // Ajuste conforme seu endpoint

  constructor(private http: HttpClient) {}

  cadastrar(empresa: any): Observable<any> {
    return this.http.post(this.apiUrl, empresa);
  }
}