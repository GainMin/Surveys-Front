import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-question-config',
  templateUrl: './question-config.component.html',
  styleUrls: ['./question-config.component.css']
})

export class QuestionConfigComponent {
  @Input() activeQuestion:any;
  @Output() onQuestionSave = new EventEmitter();
  public tempQuestion:any;

  public typeOptions:any = [
    "Текст",
    "Выбор (1 вариант)",
    "Выбор (несколько вариантов)",
    "Выбор (шкала оценок)"
  ]

  ngOnInit(){
    this.tempQuestion = this.activeQuestion !== "new" ? JSON.parse(JSON.stringify(this.activeQuestion)) : {
      Title: null,
      Addition: null,
      Type: null,
      Settings: null
    }
  }

  saveQuestion(){
    if (this.tempQuestion.Type === "Текст"){
      this.tempQuestion.Settings = "";
    }
    this.onQuestionSave.emit(this.tempQuestion);
  }

}
