import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as shajs from 'sha.js';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})

export class AuthComponent {
  constructor(private http: HttpClient ){};

  //LAN12122
  public login:string      = '';
  //Alex121212
  public password:string   = '';

  public isLoading:boolean = false;
  public unhoverable:string = '';
  public errorMessage:string = "";

  @Input() redirectPage:string = "";

  @Output() onLogIn = new EventEmitter<any>();

  public toggleLoading(that:any){
    that.isLoading = that.isLoading ? false : true;
    that.unhoverable = that.isLoading ? 'unhoverable' : '';
  }

  public hideError(){
    this.errorMessage = "";
  }

  public validateAndLogin() {
    const that = this;

    if (!that.isLoading){
      that.toggleLoading(that);

      const data = {
        method: "getUser",
        credentials: {
          UserName: shajs('sha256').update(that.login).digest('hex'),
          UserPassword: shajs('sha256').update(that.password).digest('hex')
        }
      }

      const headers = {};

      this.http.post<any>('http://176.113.83.241/api', JSON.stringify(data), { headers }).subscribe(data => {
        if (!data || data.error){
          that.toggleLoading(that);
          that.errorMessage = "Такой пользователь не найден в системе. Попробуйте снова!"
        } else {
          that.onLogIn.emit({redirectPage: that.redirectPage || "MainPage", user: data});
        }
      })
    }
  }
}
