import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  login() {
    const credentials = { email: this.email, password: this.password };
    console.log("credencials");
    console.log(credentials);
    this.authService.login(credentials).subscribe(response => {
      console.log('Token de acceso:', response.access_token);
      this.authService.saveToken(response.access_token);
      this.router.navigate(['/dashboard']);
    }, error => {
      console.error('Error al iniciar sesión:', error);
      if (error.status === 422) {
        this.errorMessage = 'Credenciales inválidas. Por favor, intenta de nuevo.';
      } else {
        this.errorMessage = 'Ocurrio un problema al conectarno, intenta de nuevo';
      }
    });
  }
}
