import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CardsComponent } from './components/cards/cards.component';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { SecondsToTimePipe } from './pipes/SecondsToTimePipe';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AlltoursComponent } from './components/alltours/alltours.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { GenericCardComponent } from './components/generics/generic-card/generic-card.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { TourDetailComponent } from './components/tour-detail/tour-detail.component';
import { StepperComponent } from './components/stepper/stepper.component';
import {MatStepperModule} from '@angular/material/stepper';
import { SignupComponent } from './components/signup/signup.component';
import { CustomToursPageComponent } from './components/custom-tours-page/custom-tours-page.component';
import { RegistrationSuccessComponent } from './components/registration-success/registration-success.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoggingService } from './services/logging.service';
import { MapsComponent } from './components/maps/maps.component';
import { AuthGuard } from './services/auth.guard';
import { UploadTourComponent } from './components/upload-tour/upload-tour.component';
import { MatSelectModule } from '@angular/material/select';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { MyToursComponent } from './components/my-tours/my-tours.component';
import { MapModalComponent } from './components/map-modal/map-modal.component'; 
import { MatDialogModule } from '@angular/material/dialog';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { HistoryToursComponent } from './components/history-tours/history-tours.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { MusicPlayerComponent } from './components/generics/music-player/music-player.component';
import { ExitComponent } from './components/exit/exit.component';
import { MusicPlayerDetailComponent } from './components/generics/music-player-detail/music-player-detail.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CountdownComponent } from './components/generics/countdown/countdown.component';
import { MiModalComponent } from './components/mi-modal/mi-modal.component';
import { MsgInicioModalComponent } from './components/msg-inicio-modal/msg-inicio-modal.component';
import { CountdownEComponent } from './components/generics/countdown-e/countdown-e.component';
import { ModalVelocityComponent } from './components/generics/modal-velocity/modal-velocity.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { ProfilecardsComponent } from './components/profilecards/profilecards.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { CustomSnackBarComponent } from './components/generics/custom-snack-bar/custom-snack-bar.component';
import { VotacionModalComponent } from './components/votacion-modal/votacion-modal.component';
import { EdittoursComponent } from './components/edittours/edittours.component';
import { CoordinateValidatorDirective } from './directives/coordinateValidatorDirective';
import { DragedittoursComponent } from './components/dragedittours/dragedittours.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {MatExpansionModule} from '@angular/material/expansion';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MapModalComponent,
    AppComponent,
    NavbarComponent,
    CardsComponent,
    LoginComponent,
    HomeComponent,
    SearchBarComponent,
    AlltoursComponent,
    GenericCardComponent,
    TourDetailComponent,
    StepperComponent,
    SignupComponent,
    CustomToursPageComponent,
    RegistrationSuccessComponent,
    ProfileComponent,
    MapsComponent,
    UploadTourComponent,
    MyToursComponent,
    AboutUsComponent,
    HistoryToursComponent,
    EditProfileComponent,
    MusicPlayerComponent,
    SecondsToTimePipe,
    ExitComponent,
    MusicPlayerDetailComponent,
    CountdownComponent,
    MiModalComponent,
    MsgInicioModalComponent,
    CountdownEComponent,
    ModalVelocityComponent,
    VotacionModalComponent,
    ProfilecardsComponent,
    CustomSnackBarComponent,
    EdittoursComponent,   
    CoordinateValidatorDirective, 
    DragedittoursComponent 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSelectModule,
    BrowserAnimationsModule,
    MatButtonModule, 
    HttpClientModule,
    MatPaginatorModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    FlexLayoutModule,
    MatTooltipModule,
    NgxPaginationModule,
    MatStepperModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    NgbRatingModule,
    DragDropModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgbModule    
  ],
  providers: [
    LoggingService, 
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
