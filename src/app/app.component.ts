import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    this.initializeAppLanguage();
  }

  initializeAppLanguage() {
    // Obtener el idioma del navegador o usar 'en' como predeterminado si es undefined
    const browserLang = this.translate.getBrowserLang() || 'en';
    // Verificar si 'en' o 'es' están en browserLang y usar browserLang, de lo contrario usar 'en'
    const lang = localStorage.getItem('language') || (browserLang.match(/en|es/) ? browserLang : 'en');
    this.translate.use(lang);
  }
}
