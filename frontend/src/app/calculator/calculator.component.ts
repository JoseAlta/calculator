import { Component } from '@angular/core';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent {
  display: string = '';
  selected: boolean = false;

  buttons: Array<string> = [
    '^', 'CE', 'RM', '√',
    '7', '8', '9', '/',
    '4', '5', '6', 'X',
    '1', '2', '3', '-',
    '0', '.', '=', '+',
  ];

  appendNumber(number: string) {
    this.display += number;
  }

  operation(op: string) {
    this.display += op;
  }

  calculate() {
    try {
      this.display = eval(this.display);
    } catch (e) {
      this.display = 'Error';
    }
  }

  handleClick(button: string) {
    if (button === '=') {
      this.calculate();
    } else if (['+', '-', '*', '/'].includes(button)) {
      this.operation(button);
    } else {
      this.appendNumber(button);
    }
  }
}
