import { Component, HostListener, OnInit} from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { operatorMap } from '../shared/constants/operators';
import { Router } from '@angular/router';
@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent {
  display: string = '';
  // selected: boolean = false;
  userData: any;
  type: string = '';
  selected: { [key: string]: boolean } = {};
  credit: string = '';
  errorMessage: string = '';
  answer:boolean = false;
  userId:string = '';

  // buttons: Array<string> = [
  //   '√', 'CE', 'RM', '<--',
  //   '7', '8', '9', '/',
  //   '4', '5', '6', 'X',
  //   '1', '2', '3', '-',
  //   '0', '.', '=', '+',
  // ];
  buttons: Array<{ displayName: string, value: string }> = [
    { displayName: '√', value: 'square' },
    { displayName: 'CE', value: 'clear' },
    { displayName: 'RM', value: 'random' },
    { displayName: '<--', value: 'backspace' },
    { displayName: '7', value: '7' },
    { displayName: '8', value: '8' },
    { displayName: '9', value: '9' },
    { displayName: 'X', value: '*' },
    { displayName: '4', value: '4' },
    { displayName: '5', value: '5' },
    { displayName: '6', value: '6' },
    { displayName: '-', value: '-' },

    { displayName: '1', value: '1' },
    { displayName: '2', value: '2' },
    { displayName: '3', value: '3' },
    { displayName: '+', value: '+' },

    { displayName: '0', value: '0' },
    { displayName: '.', value: '.' },
    { displayName: '/', value: '/' },
    { displayName: '=', value: '=' },

  ];


  constructor(private authService: AuthService,
              private http: HttpClient,
              private router: Router) { }

  ngOnInit(): void {
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


  handleClick(value: string): void {
    console.log("handleClick()");
    if(this.answer){
      this.display = "";
      this.answer = false;
    }

    this.errorMessage = '';
    if (value === '=') {
      this.performOperation(this.display);
    } else if (value === 'clear') {
      this.display = '';
    } else if (value === 'backspace') {
      this.display = this.display.slice(0, -1);
    } else if (value === 'square') {
      // this.display = Math.sqrt(parseFloat(this.display)).toString();
      this.display = '√'+this.credit;
      this.performOperation(this.display);


    } else if (['+', '-', '*', '/'].includes(value)) {
      if (this.display.length === 0 || ['+', '-', '*', '/'].includes(this.display[0])) {
        this.display = value + this.display.slice(1);
      } else {
        this.display = value + this.display;
      }
    } else {
      this.display += value;
    }
  }

  performOperation(display: string): void {
    const token = this.authService.getToken();

// userId = this.authService.getToken();
    if (!token) {
      console.error('No se encontró un token de acceso en sessionStorage.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const regex = /[+\-*/√]/;
    const matches = display.match(regex);

    if (!matches || matches.length !== 1) {
      console.error('No se encontró un operador en la expresión.');
      return;
    }

    const sign = matches[0];
    const parts = display.split(sign);

    if (parts.length !== 2) {
      console.error('Formato de la expresión no válido.');
      return;
    }

    const operand1 = parseFloat(parts[0]);
    const operand2 = parseFloat(parts[1]);

    // const operatorMap: { [key: string]: string } = {
    //   '+': 'sumar',
    //   '-': 'restar',
    //   '*': 'multiplicar',
    //   '/': 'dividir'
    // };

    const operatorName = operatorMap[sign];
    console.log("operator name");
    console.log(operatorName);
    console.log(sign);
    console.log(operatorMap);

    if (!operatorName) {
      console.error('Operador no válido.');
      return;
    }

    const payload = {
      cost: operand2,
      type: operatorName
    };

    this.http.post<any>('http://localhost:8000/api/operations', payload, { headers }).subscribe(
      response => {
        this.credit = parseFloat(response.credit).toFixed(3);

        this.display = this.credit;
        this.answer = true;
      },
      error => {
        console.error('Error al realizar la operación:', error.error);
        console.error('Error al realizar la operación:', error);
        var error = error.error.pop();
        this.errorMessage = JSON.stringify(error);
        console.error('Error al realizar la operación:', this.errorMessage);

      }
    );
  }
  // Agrega este método para manejar pulsaciones de teclado
  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    const key = event.key;
    this.errorMessage = '';
    // Encuentra el botón correspondiente a la tecla presionada
    const button = this.buttons.find(btn => btn.value === key || (key === 'Enter' && btn.value === '='));

    console.log(button);
    console.log("button");
    if (button ) {
    console.log("button");

      this.handleClick(button.value);
      this.applyButtonEffect(button.value);
    }
  }
  applyButtonEffect(value: string): void {
    this.selected[value] = true;
    setTimeout(() => this.selected[value] = false, 200); // Remueve la clase después de 200 ms
  }

  goToTransactions(): void {
    console.log("userdata from transaccion");
    console.log(this.userData);

    this.router.navigate(['/transactions', this.userData.id]);
  }

}


