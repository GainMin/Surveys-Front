import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as shajs from 'sha.js';

@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.css']
})

export class MainpageComponent {
  constructor(private http: HttpClient ){};

  @Input() currentUser:any;

  public activeSurvey:any;

  public isLoaded:boolean = false;
  public isAnswering:boolean = false;
  public answered:boolean = false;

  public tempAnswers:any;
  public questionsAnswered:any;

  ngOnInit(){
    const that = this;

    that.isLoaded = false;
    that.isAnswering = false;

    setTimeout(() => {
      that.apiReq(
        { method: "getActiveSurvey" },
        async (data:any) => {
          if (data.length){
             that.activeSurvey = data[0];


             var rawPassed = localStorage.getItem("survey-service-passed");
             var jsonPassed = rawPassed ? JSON.parse(rawPassed) : {};

             if (jsonPassed[that.activeSurvey.data.ID]) that.answered = true;

             that.tempAnswers = new Array(that.activeSurvey.questions.length);
             that.questionsAnswered = new Array(that.activeSurvey.questions.length).fill(false);

             for (let i = 0; i < that.tempAnswers.length; i++){
               let q = that.activeSurvey.questions[i];
               that.tempAnswers[i] = that.constructBaseAnswer(q.Type, that.activeSurvey.questions[i].Settings.split(";"));
             }

          };
          that.isLoaded = true;
        }
      )
    }, 1000)

    return true;
  }

  constructBaseAnswer(type:string, options:any){
    if (type === "Текст") return "";
    if (type === "Выбор (1 вариант)") return "";
    if (type === "Выбор (несколько вариантов)") return [];
    if (type === "Выбор (шкала оценок)") return { };
    return "";
  }

  updateAnswerState(i:number, event:any, type:string){

    this.questionsAnswered[i] = (() => {
      if (type === "Выбор (несколько вариантов)"){
        if (this.tempAnswers[i].includes(event.target.value)){
          this.tempAnswers[i].splice(this.tempAnswers[i].findIndex((el:any) => el === event.target.value), 1);
        } else this.tempAnswers[i].push(event.target.value);

        return this.tempAnswers[i].length > 0;
      }

      if (type === "Выбор (шкала оценок)"){
        return Object.keys(this.tempAnswers[i]).length === this.activeSurvey.questions[i].Settings.split(";").length;
      }

      return !!this.tempAnswers[i];
    })()

  }

  startSurvey(){
    this.isAnswering = true;
  }

  async submitSurvey(){

    const that = this;
    that.isLoaded = false;

    if (that.questionsAnswered.includes(false)) return that.isLoaded = true;

    await that.apiReq(
      {
        method: "setResult",
        data: {
          ID: that.activeSurvey.data.ID,
          Answer: JSON.stringify(that.tempAnswers.map((el:any, index:number) => {
            return {
              [that.activeSurvey.questions[index].ID]: {
                Type: that.activeSurvey.questions[index].Type,
                Data: el
              }
            }
          }))
        }
      },
      async (data:any) => {
        if (!data.error){

          var rawPassed = localStorage.getItem("survey-service-passed");
          var jsonPassed = rawPassed ? JSON.parse(rawPassed) : {};
          jsonPassed[that.activeSurvey.data.ID] = true;
          localStorage.setItem("survey-service-passed", JSON.stringify(jsonPassed));
        }
        that.answered = true;
        that.isLoaded = true;
      }
    )

    return true;
  }

  apiReq(data:any, cb:any){
    const that = this;

    data.credentials = that.currentUser ? that.currentUser : { UserName: "anonimus" };

    return new Promise((res:any, rej:any) => {
      const headers = {'Content-Type' : 'text/plain; charset=UTF-8'};

      that.http.post<any>('http://localhost/api', data, { headers }).subscribe(async (dt:any) => {
        await cb(dt);
        res(true);
      });
    })

  }

}
