import { Component,Input } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-screens',
  templateUrl: './top-screens.component.html',
  styleUrls: ['./top-screens.component.css']
})
export class TopScreensComponent {
  userData: any;
  // credit: any;
  @Input() credit: string = "";
  dropMenu:boolean = false;

  constructor(private authService: AuthService,
    private http: HttpClient,
    private router: Router) { }

  ngOnInit(): void {
    this.fetchCredit();
  }
  fetchCredit(){
    const token = this.authService.getToken();
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      this.http.get<any>('http://localhost:8000/api/user',{ headers }).subscribe(
        userData => {
          this.userData = userData;
          this.credit = parseFloat(userData.credit).toFixed(3);
          console.log('Información del usuario:', this.userData);
        },
        error => {
          console.error('Error al obtener la información del usuario:', error);
        }
      );
    }
  }
  updateCredit(newCredit: string): void {
    this.credit = newCredit;
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  toggleDropMenu() {
    this.dropMenu = !this.dropMenu; // Invierte el valor de dropMenu
  }
}
