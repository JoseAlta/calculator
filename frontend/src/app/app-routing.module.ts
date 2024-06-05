import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'
import { CalculatorComponent } from './calculator/calculator.component'
import { AuthGuard } from './guards/auth.guard';
import { TransactionsComponent } from './transactions/transactions.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: CalculatorComponent, canActivate: [AuthGuard] },
  { path: 'transactions/:userId', component: TransactionsComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
