import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BotoesService {

  private url = 'http://127.0.0.1:1880/set-number';

  constructor(private http: HttpClient) {}


  postNumber(number: number): Observable<any> {
    return this.http.post(this.url, {"number": number});
  }
}
