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

    this.authService.login(credentials).subscribe(response => {
      this.authService.saveToken(response.access_token);
      this.authService.saveUser(response.userId);
      this.router.navigate(['/dashboard']);
    }, error => {
      console.error('Error al iniciar sesión:', error);
      if (error.status === 422) {
        this.errorMessage = 'invalid credentials, please try again';
      } else {
        this.errorMessage = 'an error occuring during login, please try again';
      }
    });
  }
}
