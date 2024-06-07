import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // apiUrl = 'http://18.116.61.173:8000/api/'; // Puedes definir la URL aquí
  apiUrl = 'http://127.0.0.1:8000/api/'; // Puedes definir la URL aquí

  constructor() { }
}
