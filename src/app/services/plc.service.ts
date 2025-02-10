import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlcService {
  private apiUrl = 'http://localhost:4201';

  constructor(private http: HttpClient) { }

  sendNumber(number: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/write`, { "value": number });
  }

  readNumber(): Observable<{value: number}> {
    return this.http.get<{value: number}>(`${this.apiUrl}/read`);
  }
}
