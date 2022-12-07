import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import * as shajs from 'sha.js';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  constructor(private http: HttpClient ){};

  @Input() currentUser:any;

  public allSurveys:any = [];

  public activeSurvey:any;
  public tempSurvey:any;

  public activeTab:any = "Main";
  public isChanged:boolean = false;
  public isChangedQuestion:boolean = false;

  public questionBeingConfigured:any;

  async ngOnInit(){
    await this.updateAllSurveys();
  }

  updateAllSurveys(){
    const that = this;

    return new Promise(async (res, rej) => {

      await that.apiReq({
        method: 'getAllSurveys',
        credentials: that.currentUser
      }, (data:any) => {
        if (data.error) console.log(data);
        else that.allSurveys = data.map((survey:any) => {
          survey.IsActive = survey.IsActive === "1" ? true : false;
          return survey;
        });
        res(true);
      })
    })

  }

  setTab(event:any, tabName:string){
    if (!event.target.classList.contains('disabled-tab') && tabName !== this.activeTab){
      this.activeTab = tabName;
      if (this.activeTab !== "Questions"){
        this.questionBeingConfigured = undefined;
      }
    }
  }

  getActiveQuestion(){
    const that = this;
    return that.questionBeingConfigured === "new" ? "new" : that.tempSurvey.Questions.find((el:any) => that.questionBeingConfigured === el.ID);
  }

  editQuestion(index:any){
    this.questionBeingConfigured = index === "new" ? "new" : this.tempSurvey.Questions[index].ID;
  }

  pushQuestionToSurvey(data:any){
    const that = this;
    if (!data.ID){
      this.tempSurvey.Questions.push(data);
      this.reorderQuestions();
    } else {
      const index = this.activeSurvey.Questions.findIndex((el:any) => el.ID === data.ID);
      this.tempSurvey.Questions[index] = data;
    }

    this.isChangedQuestion = true;
    this.questionBeingConfigured = undefined;
    this.activeTab = 'Questions';

    this.checkIfChanged();

  }

  setActiveSurvey(index:number){
    this.configureSurvey(this.allSurveys[index].ID, this.activeTab);
  }

  dndQuestions(event:any){
    moveItemInArray(this.tempSurvey.Questions, event.previousIndex, event.currentIndex);
    this.reorderQuestions();
  }

  reorderQuestions(){
    const that = this;
    that.tempSurvey.Questions.forEach((el:any, i:number) => {
      that.tempSurvey.Questions[i].AskOrder = i;
    })

    that.checkIfChanged();
  }

  checkIfChanged(){
    const as = this.activeSurvey;
    const ts = this.tempSurvey;

    if (
      as.Title !== ts.Title ||
      as.Description !== ts.Description ||
      as.IsActive !== ts.IsActive ||
      JSON.stringify(as.Questions) !== JSON.stringify(ts.Questions)
    ) return this.isChanged = true;

    return this.isChanged = false;
  }

  async configureSurvey(id:string, tab:string){
    const that = this;
    await that.updateAllSurveys();

    if (id !== 'new'){
      that.activeSurvey = that.allSurveys.find((el:any) => el.ID.toString() === id.toString());
    } else {
      that.activeSurvey = {
        Title: '',
        Description: '',
        IsActive: false,
        Questions: []
      };
    }

    that.tempSurvey = JSON.parse(JSON.stringify(that.activeSurvey));

    that.activeTab = tab;
    that.questionBeingConfigured = undefined;
  }

  async submitCurrentSurvey(){

    const that = this;
    var curid = "";

    await that.apiReq({
      method: 'setSurvey',
      data: {
        ID: that.tempSurvey.ID ? that.tempSurvey.ID : null,
        Title: that.tempSurvey.Title,
        Description: that.tempSurvey.Description,
        IsActive: that.tempSurvey.IsActive ? "1" : "0"
      }
    }, async (data:any) => {
      if (!data.error){
          curid = data.ID;
      }
    });

    await that.submitQuestions();

    await that.configureSurvey(curid, that.activeTab);
    that.checkIfChanged();

  }

  async submitQuestions(){
    const that = this;

    for (let i = 0; i < that.tempSurvey.Questions.length; i++){
      await that.apiReq({
        method: 'setSurveyQuestion',
        data: {
          ID: that.tempSurvey.ID,
          question: that.tempSurvey.Questions[i]
        }
      }, async (data:any) => {})
    }
  }

  async deleteCurrentSurvey(){
    const that = this;

    await that.apiReq({
      method: 'deleteSurvey',
      data: { ID: that.activeSurvey.ID }
    }, async (data:any) => {
      if (!data.error){
        await that.updateAllSurveys();
        that.activeSurvey = null;
      }
    });
  }

  async deleteQuestion(index:number){
    const that = this;

    await that.apiReq({
      method: 'deleteSurveyQuestion',
      data: {
        ID: that.tempSurvey.ID,
        question: {
          ID: that.tempSurvey.Questions.splice(index, 1)[0].ID
        }
      }
    }, async (data:any) => {
      await that.updateAllSurveys();
    })

  }

  apiReq(data:any, cb:any){
    const that = this;

    data.credentials = that.currentUser;

    return new Promise((res:any, rej:any) => {
      const headers = {'Content-Type' : 'text/plain; charset=UTF-8'};

      that.http.post<any>('http://176.113.83.241/_api/', data, { headers }).subscribe(async (dt:any) => {
        await cb(dt);
        res(true);
      });
    })

  }

}
