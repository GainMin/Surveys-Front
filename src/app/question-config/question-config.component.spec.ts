import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionConfigComponent } from './question-config.component';

describe('QuestionConfigComponent', () => {
  let component: QuestionConfigComponent;
  let fixture: ComponentFixture<QuestionConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
