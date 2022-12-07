import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgChartsModule, NgChartsConfiguration } from 'ng2-charts';
import { ChartDataset, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent {
  constructor(private http: HttpClient ){};

  @Input() public currentUser:any;

  public allSurveys:any;
  public activeSurvey:any;
  public currentAnswers:any;

  public barData:any = {};
  public barLabels:any = {};

  public barChartData:ChartDataset[] = [];
  public barChartLabels:string[] = [];
  public barChartOptions:ChartOptions = {
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      },
    },
    responsive: true
  }

  public defaultOptionsForCharts:any = {
    barChartType: 'bar',
    barChartPlugins: []
  }

  chartHovered(event:any){

  }

  chartClicked(event:any){

  }

  async ngOnInit(){
    await this.updateAllSurveys();
    this.setActiveSurvey(0);
  }

  async setActiveSurvey(index:number){
    const that = this;
    await that.updateAllSurveys();
    await that.getResults(this.allSurveys[index].ID);

    that.activeSurvey = this.allSurveys[index];
    that.countBarData();
  }

  countBarData(){
    const that = this;
    that.barData = {};
    that.barLabels = {};

    for (let i = 0; i < that.activeSurvey.Questions.length; i++){
      var q = that.activeSurvey.Questions[i];
      var qa = that.currentAnswers.map((el:any) => {
        return el.Answers[q.ID].Data;
      })

      that.processAnswers(q, qa);

    }

  }

  processAnswers(q:any, qa:any){
    const that = this;

    if (q.Type === "Выбор (1 вариант)"){
      var map = that.getMapAndCount(qa);
      that.barLabels[q.ID] = [...map.keys()];

      var set:ChartDataset[] = [{data: [...map.values()]}];
      that.barData[q.ID] = set;
    }
    if (q.Type === "Выбор (несколько вариантов)"){
      var qasum = qa.reduce((acc:any, el:any) => [...acc, ...el], []);

      var map = that.getMapAndCount(qasum);
      that.barLabels[q.ID] = [...map.keys()];

      var set:ChartDataset[] = [{data: [...map.values()]}];
      that.barData[q.ID] = set;
    }

    if (q.Type === "Выбор (шкала оценок)"){
      var uniq = [...new Set(Object.keys(qa[0]))];
      that.barLabels[q.ID] = uniq;

      var counted = new Map();
      for (let i = 0; i < uniq.length; i++){
        var lbl = uniq[i];
        counted.set(lbl, 0);
        qa.forEach((el:any) => counted.set(lbl, counted.get(lbl) + Number(el[lbl])))
      }

      that.barData[q.ID] = [{data:[...counted.values()]}];

    }

    console.log(that.barData);
    console.log(that.barLabels);

    return false;
  }

  getMapAndCount(arr:any){
    return arr.reduce((acc:any, e:any) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
  }

  /*
  public barChartData:ChartDataset[] = [{data: [1, 6, 5]}];
  public barChartLabels:string[] = ['qwd', 'rthrth', 'wokwfekowef'];
  */


  async getResults(id:string){
    const that = this;
    await that.apiReq({
      method: "getSurveysResults",
      data: { ID: id }
    }, async (data:any) => {
      that.currentAnswers = data;
      that.currentAnswers = that.currentAnswers.map((el:any) => {
        el.Answers = JSON.parse(el.Answers);
        return el;
      })

      that.currentAnswers.forEach((el:any, i:number) => {
        var objRepresentation = {};
        that.currentAnswers[i].Answers.forEach((qa:any) => {
          objRepresentation = {...objRepresentation, ...qa};
        })
        that.currentAnswers[i].Answers = objRepresentation;
      })
    })
  }

  updateAllSurveys(){
    const that = this;

    return new Promise(async (res, rej) => {

      await that.apiReq({
        method: 'getAllSurveys'
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

  apiReq(data:any, cb:any){
    const that = this;

    data.credentials = that.currentUser;

    return new Promise((res:any, rej:any) => {
      const headers = {'Content-Type' : 'text/plain; charset=UTF-8'};

      that.http.post<any>('http://176.113.83.241/_api', data, { headers }).subscribe(async (dt:any) => {
        await cb(dt);
        res(dt);
      });
    })

  }
}
