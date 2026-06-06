import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({    
    providedIn: 'root'
})
export class ConfigService{
    private apiUrl = 'http://localhost:8080/api/config';

    constructor(private http: HttpClient){}

    getDbpath(): Observable<string> {
        return this.http.get(`${this.apiUrl}/banco`, { responseType: 'text' });
    }

    saveDbPath(novoCaminho: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/banco`, novoCaminho, {
            headers: {'Content-Type': 'application/json' }
        });
    }
}