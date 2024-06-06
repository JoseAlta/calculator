import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RandomService {
  private apiUrl = 'https://www.random.org/strings/?num=1&len=10&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new';

  constructor(private http: HttpClient) {}

  getRandomString(): Observable<string> {
    return this.http.get<string>(this.apiUrl, { responseType: 'text' as 'json' });
  }
}
