import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CardsComponent } from './components/cards/cards.component';
import {HttpClientModule} from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

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
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSelectModule,
    BrowserAnimationsModule,
    MatButtonModule, 
    HttpClientModule,
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
    
    
  ],
  providers: [
    LoggingService, 
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
