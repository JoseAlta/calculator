import { Component, HostListener, OnInit, ViewChild} from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { operatorMap } from '../shared/constants/operators';
import { Router } from '@angular/router';
import { TopScreensComponent } from '../top-screens/top-screens.component';
import { RandomService } from '../random.service';
import { ApiService } from '../api.service';
@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent {
  display: string = '';
  userData: any;
  type: string = '';
  selected: { [key: string]: boolean } = {};
  credit: string = '';
  errorMessage: string = '';
  answer:boolean = false;
  userId:string = '';
  randomString!: string;
  display_1 : string = "1+1";

  @ViewChild(TopScreensComponent) topScreensComponent!: TopScreensComponent;

  buttons: Array<{ displayName: string, value: string }> = [
    { displayName: '√', value: 'square' },
    { displayName: 'CE', value: 'clear' },
    { displayName: 'RM', value: 'random' },
    { displayName: '<--', value: 'Backspace' },
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

  operations = {
    '+' : { type: 'addition', cost: 3 },
    '-' : { type: 'subtraction', cost: 4 },
    '*' : { type: 'multiply', cost: 5 },
    '/' : { type: 'division', cost: 6 },
    'RM' : { type: 'random', cost: 10 },
    '√' : { type: 'square', cost: 8 }
  };


  constructor(private authService: AuthService,
              private http: HttpClient,
              private randomService: RandomService,
              private router: Router,
              private apiService: ApiService) { }

  ngOnInit(): void {

    const token = this.authService.getToken();
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      this.http.get<any>(this.apiService.apiUrl+'user',{ headers }).subscribe(
        userData => {
          this.userData = userData;
          this.credit = parseFloat(userData.credit).toFixed(3);
        },
        error => {
          console.error('Error al obtener la información del usuario:', error);
        }
      );
    }
  }


  handleClick(value: string): void {
    console.log("handleClick()");

    if (this.answer) {
      this.display = "";
      this.answer = false;
    }

    console.log("value:", value);
    this.errorMessage = '';

    if (value === '=') {
      this.performOperation(this.display);
    } else if (value === 'random') {
      this.display = 'rdm'
      this.performOperation(this.display);
    } else if (value === 'clear') {
      this.display = '';
    } else if (value === 'Backspace') {
      this.display = this.display.slice(0, -1);
    } else if (value === 'square') {
      const hasOperator = /[+\-*/]/.test(this.display);
      if (this.display && !hasOperator && !isNaN(parseFloat(this.display))) {
        this.display = '√' + this.display;
        this.performOperation(this.display);
      }
    } else if (['+', '-', '*', '/'].includes(value)) {
      const hasOperator = /[+\-*/]/.test(this.display);
      if (!hasOperator && this.display.length > 0) {
        this.display += value;
      }
    } else if (value === '.') {
      const parts = this.display.split(/[+\-*/]/);
      const currentNumber = parts[parts.length - 1];
      if (!currentNumber.includes('.')) {
        this.display += value;
      }
    } else {
      this.display += value;
    }
  }

  performOperation(display: string): void {
    const token = this.authService.getToken();

    if (!token) {
      console.error('No se encontró un token de acceso en sessionStorage.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const regex = /[+\-*/√]|rdm/;
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

    const operand2 = parseFloat(parts[1]);

    const operatorName = operatorMap[sign];

    if (!operatorName) {
      console.error('Operador no válido.');
      return;
    }

    const payload = {
      operation: this.display
    };


    this.http.post<any>(this.apiService.apiUrl+'user/operations', payload, { headers }).subscribe(
      response => {
        this.credit = parseFloat(response.new_balance).toFixed(3);

        this.display = response.result;
        this.answer = true;
        if (this.topScreensComponent) {
          this.topScreensComponent.updateCredit(this.credit); // Actualiza el crédito con el resultado de la operación
        }
        console.log("response",response);
      },
      error => {
        console.error('Error al realizar la operación:', error.error);
        console.error('Error al realizar la operación:', error);
        this.errorMessage = JSON.stringify(error.error.message);
        console.error('Error al realizar la operación:', this.errorMessage);

      }
    );
  }
  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    const key = event.key;
    console.log(key);
    this.errorMessage = '';
    const button = this.buttons.find(btn => btn.value === key || (key === 'Enter' && btn.value === '='));
    if (button ) {
      if(this.checkIfFocused() == false){
        this.handleClick(button.value);
      }
      this.applyButtonEffect(button.value);
    }
  }
  applyButtonEffect(value: string): void {
    this.selected[value] = true;
    setTimeout(() => this.selected[value] = false, 200);
  }

  goToTransactions(): void {
    this.router.navigate(['/transactions', this.userData.id]);
  }

  checkIfFocused(): boolean {
    let myTextInput = document.getElementById('display') as HTMLInputElement;
    if (document.activeElement == myTextInput) {
      return true;
    } else {
      return false;
    }
  }
  fetchRandomString(){
    this.randomService.getRandomString().subscribe((data) => {
      this.display = data;
    });
  }

}


