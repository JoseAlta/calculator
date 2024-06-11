import { Component,Input } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

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
    private apiService: ApiService,
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
      this.http.get<any>(this.apiService.apiUrl+'user',{ headers }).subscribe(
        userData => {
          this.userData = userData;
          console.log(this.userData.credit);
          if(this.userData.credit == null){
            this.userData.credit = "0";
          }
          this.credit = parseFloat(userData.credit).toFixed(3);
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
    this.dropMenu = !this.dropMenu;
  }
  goToTransactions(): void {
    this.router.navigate(['/transactions', this.userData.id]);
  }
}
