import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ScrollService } from './services/scroll.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private translate: TranslateService, private scrollService:ScrollService) {
    this.initializeAppLanguage();    
  }
  ngAfterViewInit(){
    this.scrollService.init();
  }
  initializeAppLanguage() {  
    const browserLang = this.translate.getBrowserLang() || 'en';
    const lang = localStorage.getItem('language') || (browserLang.match(/en|es/) ? browserLang : 'en');
    this.translate.use(lang);
  }
}
