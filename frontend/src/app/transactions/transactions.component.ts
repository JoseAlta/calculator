import { Component } from '@angular/core';
import { Transaction } from '../models/transaction.interface';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent {
 help : string = '' ;
 transactions: Transaction[] = [];
//  displayedColumns: string[] = ['id', 'amount', 'created_at', 'operation_id', 'operation_response', 'user_balance', 'user_id'];
 displayedColumns: string[] = ['id','amount','operation_type','user_balance','operation_response','created_at'];
 credit:string = "";
 userData:any ;
 userId: string = '';
 constructor(private http: HttpClient,private authService: AuthService,private route: ActivatedRoute) { }

 ngOnInit(): void {
  this.route.params.subscribe(params => {
    this.userId = params['userId'];

  });
  this.route.queryParams.subscribe(params => {
    this.credit = params['credit'];
    this.userData = params['userData'].name;
  });
  console.log("aqui van");
  console.log(this.userId );
  console.log(this.credit );
  console.log(this.userData );
  this.fetchTransactions();
}

fetchTransactions(): void {
  const token = this.authService.getToken();
  // const userId =
  console.log("userId fro transactions");
  console.log(this.userId);
  if (token) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    this.http.get<any>('http://localhost:8000/api/records/user/'+this.userId,{ headers }).subscribe(
      userTransactionsData => {
        this.transactions = userTransactionsData
        // this.userData = userData;
        // this.credit = parseFloat(userData.credit).toFixed(3);
        // console.log('Información del usuario:', this.userData);
        console.log(userTransactionsData);
      },
      error => {
        console.error('Error al obtener la información del usuario:', error);
      }
    );
  } else {
  }



  // this.http.get<any>('http://localhost:8000/api/records/user/'+id).subscribe(
  //   (response: any) => {
  //     this.transactions = response.map((transaction: any) => ({
  //       amount: parseFloat(transaction.amount),
  //       user_balance: transaction.user_balance,
  //       operation_response: transaction.operation_response,
  //       date: new Date(transaction.date)
  //     }));
  //   },
  //   (error) => {
  //     console.error('Error fetching transactions:', error);
  //   }
  // );
}

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


}
