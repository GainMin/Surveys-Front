import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent {
  @Input() public currentUser:any;
  @Input() public redirectPage:string = "";
  @Input() public currentPage:string = "";

  @Output() onElClick = new EventEmitter<any>();

  public authOrShowOptions(){
    const that = this;
    that.onElClick.emit({
      page: that.currentUser ? "Settings" : "Auth",
      redirectPage: that.redirectPage
    });
  }

  public redirect(cmd:string){
    const that = this;

    that.onElClick.emit({
      MainPage: {
        page: "MainPage"
      },
      Settings: {
        page: that.currentUser ? "Settings" : "Auth",
        redirectPage: "Settings"
      },
      Statistics: {
        page: that.currentUser ? "Statistics" : "Auth",
        redirectPage: "Statistics"
      }
    }[cmd])
  }

}
