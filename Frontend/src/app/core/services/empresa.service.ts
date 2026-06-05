import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private apiUrl = 'http://localhost:8080/api/empresas'; 

  constructor(private http: HttpClient) {}

  cadastrar(empresa: any, logo: File | null): Observable<any> { 
    const formData = new FormData();
    
    // Transforma o objeto empresa em string JSON para o @RequestParam do Java
    formData.append('empresa', JSON.stringify(empresa));
    
    if (logo) {
      formData.append('logo', logo);
    }
    
    return this.http.post<any>(this.apiUrl, formData);
  }

  buscarPorId(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}