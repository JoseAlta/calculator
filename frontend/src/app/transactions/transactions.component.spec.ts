import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TransactionsComponent } from './transactions.component';
import { AuthService } from '../auth.service';
import { ApiService } from '../api.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let httpMock: HttpTestingController;
  let route: ActivatedRoute;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    const apiSpy = jasmine.createSpyObj('ApiService', ['apiUrl']);

    await TestBed.configureTestingModule({
      declarations: [TransactionsComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ApiService, useValue: apiSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ userId: '123' }),
            queryParams: of({ credit: '100.000', userData: {} })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    route = TestBed.inject(ActivatedRoute);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct user data', () => {
    authService.getToken.and.returnValue('mockToken');
    fixture.detectChanges();
    expect(component.userId).toBe('123');
    expect(component.credit).toBe('100.000');
    expect(component.userData).toEqual({});
    expect(component.token).toBe('mockToken');
  });

  it('should fetch transactions on init', () => {
    authService.getToken.and.returnValue('mockToken');
    const mockTransactions = [
      { id: 1, amount: "10", operation_type: 'add', user_balance: '100', operation_response: '4', date: '2023-01-01',created_at: '2023-01-01',operation_request:'1+3',operation_id:2,user_id:5,updated_at:"" },
      { id: 2, amount: "20", operation_type: 'subtract', user_balance: '80', operation_response: '-2', date: '2023-01-02',created_at: '2023-01-01',operation_request:'1-3',operation_id:4,user_id:5,updated_at:"" }
    ];
    apiService.apiUrl = 'http://mockapi.com/';
    component.ngOnInit();
    const req = httpMock.expectOne('http://mockapi.com/records/user/123');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mockToken');
    req.flush(mockTransactions);
    expect(component.transactions).toEqual(mockTransactions);
  });

  it('should handle delete transaction', () => {
    authService.getToken.and.returnValue('mockToken');
    const mockTransaction = { operation_id: 1 };
    component.transactionToDelete = mockTransaction;
    apiService.apiUrl = 'http://mockapi.com/';
    component.deleteTransaction();
    const req = httpMock.expectOne('http://mockapi.com/operations/delete/1');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mockToken');
    req.flush({});
    expect(window.location.href).toContain('/transactions/123');
  });

  it('should filter transactions based on search text', () => {
    component.transactions = [
      { id: 1, amount: "10", operation_type: 'add', user_balance: '100', operation_response: '4', date: '2023-01-01',created_at: '2023-01-01',operation_request:'1+3',operation_id:2,user_id:5,updated_at:"" },
      { id: 2, amount: "20", operation_type: 'subtract', user_balance: '80', operation_response: '-2', date: '2023-01-02',created_at: '2023-01-01',operation_request:'1-3',operation_id:4,user_id:5,updated_at:"" }
    ];
    component.searchText = 'add';
    const filteredTransactions = component.filterTransactions();
    expect(filteredTransactions.length).toBe(1);
    expect(filteredTransactions[0].operation_type).toBe('add');
  });

  it('should set page correctly', () => {
    component.transactions = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      amount: "10",
      operation_type: 'add',
      user_balance: "100",
      operation_request: '1+1',
      operation_response: '2',
      date: '2023-01-01',
      operation_id:2,
      user_id:2,
      updated_at:'2023-01-01',
      created_at: '2023-01-01'
    }));
    component.calculateTotalPages();
    component.setPage(2);
    expect(component.currentPage).toBe(2);
    expect(component.transactions.length).toBe(5);
  });

});
