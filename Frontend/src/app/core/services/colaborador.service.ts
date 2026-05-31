import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ColaboradorService {
  // Garantindo que aponta para o Backend (8080)
  private apiUrl = 'http://localhost:8080/api/colaboradores'; 

  constructor(private http: HttpClient) { }

  listarEquipe(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/equipe`);
  }

  uploadFoto(id: number, foto: File): Observable<any> {
    const formData = new FormData();
    formData.append('foto', foto);
    return this.http.post(`${this.apiUrl}/${id}/upload-foto`, formData, { responseType: 'text' });
  }

  cadastrar(colaborador: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cadastrar`, colaborador);
  }
}