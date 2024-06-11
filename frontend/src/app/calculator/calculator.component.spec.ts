import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CalculatorComponent } from './calculator.component';
import { AuthService } from '../auth.service';
import { RandomService } from '../random.service';
import { ApiService } from '../api.service';
import { TopScreensComponent } from '../top-screens/top-screens.component';
import { of, throwError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

describe('CalculatorComponent', () => {
  let component: CalculatorComponent;
  let fixture: ComponentFixture<CalculatorComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let randomService: jasmine.SpyObj<RandomService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    const randomSpy = jasmine.createSpyObj('RandomService', ['getRandomString']);
    const apiSpy = jasmine.createSpyObj('ApiService', ['apiUrl']);

    await TestBed.configureTestingModule({
      declarations: [CalculatorComponent, TopScreensComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: RandomService, useValue: randomSpy },
        { provide: ApiService, useValue: apiSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CalculatorComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    randomService = TestBed.inject(RandomService) as jasmine.SpyObj<RandomService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get user data on init if token exists', () => {
    const mockToken = 'mockToken';
    const mockUserData = { credit: '100.000' };
    authService.getToken.and.returnValue(mockToken);
    apiService.apiUrl = 'http://mockapi.com/';
    component.ngOnInit();
    const req = httpMock.expectOne('http://mockapi.com/user');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush(mockUserData);
    expect(component.userData).toEqual(mockUserData);
    expect(component.credit).toBe('100.000');
  });

  it('should handle click events correctly', () => {
    component.display = '1';
    component.handleClick('2');
    expect(component.display).toBe('12');
  });

  it('should perform addition operation correctly', () => {
    const mockToken = 'mockToken';
    const mockResponse = { new_balance: '97.000', result: '3' };
    authService.getToken.and.returnValue(mockToken);
    apiService.apiUrl = 'http://mockapi.com/';
    component.display = '1+2';
    component.performOperation(component.display);
    const req = httpMock.expectOne('http://mockapi.com/user/operations');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
    expect(component.credit).toBe('97.000');
    expect(component.display).toBe('3');
    expect(component.answer).toBe(true);
  });

  it('should handle random operation correctly', () => {
    const mockToken = 'mockToken';
    const mockResponse = { new_balance: '90.000', result: '42' };
    authService.getToken.and.returnValue(mockToken);
    apiService.apiUrl = 'http://mockapi.com/';
    component.display = 'rdm';
    component.performOperation(component.display);
    const req = httpMock.expectOne('http://mockapi.com/user/operations');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
    expect(component.credit).toBe('90.000');
    expect(component.display).toBe('42');
    expect(component.answer).toBe(true);
  });

  it('should fetch random string', () => {
    const mockString = 'randomString';
    randomService.getRandomString.and.returnValue(of(mockString));
    component.fetchRandomString();
    expect(component.display).toBe(mockString);
  });

});
