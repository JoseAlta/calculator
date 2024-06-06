import { Component, ViewChild} from '@angular/core';
import { Transaction } from '../models/transaction.interface';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
 help : string = '' ;
 transactions: Transaction[] = [];
//  displayedColumns: string[] = ['id', 'amount', 'created_at', 'operation_id', 'operation_response', 'user_balance', 'user_id'];
 displayedColumns: string[] = ['id','amount','operation_type','user_balance','operation_response','created_at'];
 credit:string = "";
 userData:any ;
 userId: string = '';
 transactionToDelete: any = null;
token:string | null ="";
searchText: string = '';
selectedTransaction: any;
pageSize: number = 5; // Número de elementos por página
  currentPage: number = 1; // Página actual
  totalPages: number = 0; // Número total de páginas
  pages: number[] = []; // Lista de páginas para mostrar en la paginación


 constructor(private http: HttpClient,private authService: AuthService,private route: ActivatedRoute) { }

 ngOnInit(): void {
  this.route.params.subscribe(params => {
    this.userId = params['userId'];

  });
  this.route.queryParams.subscribe(params => {
    this.credit = params['credit'];
    this.userData = params['userData'];
  });
  this.token =  this.authService.getToken() ;

  this.fetchTransactions();

}
ngAfterViewInit() {
  console.log(this.transactions);
  if(this.transactions){
  this.calculateTotalPages();

  }
}
fetchTransactions(): void {
  // const userId =
  console.log("userId fro transactions");
  console.log(this.userId);
  if (this.token) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
    this.http.get<any>('http://localhost:8000/api/records/user/'+this.userId,{ headers }).subscribe(
      userTransactionsData => {
        this.transactions = userTransactionsData


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

viewTransaction(transaction:any){

}
deleteTransaction() {
  if(!this.token){
    return ;
  }
  if (this.transactionToDelete) {

    const operationId = this.transactionToDelete.operation_id;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });
    this.http.delete(`http://localhost:8000/api/operations/delete/${operationId}`,{ headers })
      .subscribe(
        response => {
          window.location.reload();
        },
        error => {
          console.error('Error deleting transaction:', error);
        }
      );
  }
}

confirmDelete(transaction: any) {
  this.transactionToDelete = transaction;
}
openModal(transaction:any) {
  if (window.confirm('Are you sure you want to delete this operation? It wll delete all the transactions from this one')) {
    // this.deleteTransactions(transaction);
    this.transactionToDelete = transaction;
    this.deleteTransaction();
  } else {

  }
}
deleteTransactions(transaction:any){
  console.log("realizar accion",transaction);
}
openTransactionDetail(transaction: any) {
  // Aquí puedes implementar la lógica para abrir el popup y mostrar los detalles de la transacción
  alert(`Detalle de la transacción: ${JSON.stringify(transaction)}`);
  this.selectedTransaction = transaction; // Agrega una variable para almacenar la transacción seleccionada

}

filterTransactions() {
  return this.transactions.filter(transaction => {
    return (
      transaction.operation_id.toString().includes(this.searchText) ||
      transaction.amount.toString().includes(this.searchText) ||
      transaction.operation_type.toLowerCase().includes(this.searchText.toLowerCase()) ||
      transaction.user_balance.toString().includes(this.searchText) ||
      transaction.operation_response.toLowerCase().includes(this.searchText.toLowerCase()) ||
      transaction.created_at.toString().includes(this.searchText)
    );
  });


}

setPage(page: number) {
  if (page < 1 || page > this.totalPages) {
    return;
  }
  this.fetchTransactions();
  this.currentPage = page;
  var startIndex = (this.currentPage - 1) * this.pageSize;
  var endIndex = Math.min(startIndex + this.pageSize, this.transactions.length);

  console.log("startIndex");
  console.log(startIndex);
  console.log("endIndex");
  console.log(endIndex);

this.transactions.filter(transaction => transaction.id >= startIndex && transaction.id <= endIndex);
// const registrosFiltrados = registros.filter(registro => registro.id >= idInicial && registro.id <= idFinal);

  // Obtener los registros correspondientes a la página actual
  let currentPageTransactions = this.transactions.slice(startIndex, endIndex);
  // Actualizar la tabla con los registros de la página actual
  this.transactions = currentPageTransactions;
}


calculateTotalPages() {
  this.totalPages = Math.ceil(this.transactions.length / this.pageSize);
  this.pages = Array.from(Array(this.totalPages), (_, index) => index + 1);
  this.setPage(2);
}


}
