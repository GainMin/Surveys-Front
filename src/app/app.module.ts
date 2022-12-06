import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChartDataset, ChartOptions } from 'chart.js';
import { NgChartsModule, NgChartsConfiguration } from 'ng2-charts';

import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { MainpageComponent } from './mainpage/mainpage.component';
import { SettingsComponent } from './settings/settings.component';
import { QuestionConfigComponent } from './question-config/question-config.component';
import { ResultsComponent } from './results/results.component';
import { StatisticsComponent } from './statistics/statistics.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    AdminPanelComponent,
    MainpageComponent,
    SettingsComponent,
    QuestionConfigComponent,
    ResultsComponent,
    StatisticsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    DragDropModule,
    NgChartsModule
  ],
  providers: [{ provide: NgChartsConfiguration, useValue: { generateColors: false }}],
  bootstrap: [AppComponent]
})

export class AppModule { }
