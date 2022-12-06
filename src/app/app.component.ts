import { Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  public currentPage:string = "MainPage";
  public redirectPage:string = "";
  public currentUser:any;

  public redirect(data:any){

    if (data.user) this.currentUser = data.user;
    if (data.redirectPage) this.redirectPage = data.redirectPage;
    if (data.page) this.currentPage = data.page;

    if (!data.page && data.redirectPage) {
      this.currentPage = data.redirectPage
      this.redirectPage = "";
    };

  }

}
