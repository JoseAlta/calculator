import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopScreensComponent } from './top-screens.component';

describe('TopScreensComponent', () => {
  let component: TopScreensComponent;
  let fixture: ComponentFixture<TopScreensComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TopScreensComponent]
    });
    fixture = TestBed.createComponent(TopScreensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
