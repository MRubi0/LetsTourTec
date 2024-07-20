import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AlltoursComponent } from './components/alltours/alltours.component';
import { TourDetailComponent } from './components/tour-detail/tour-detail.component';
import { StepperComponent } from './components/stepper/stepper.component';
import { SignupComponent } from './components/signup/signup.component';
import { CustomToursPageComponent } from './components/custom-tours-page/custom-tours-page.component';
import { RegistrationSuccessComponent } from 'src/app/components/registration-success/registration-success.component';
import { ProfileComponent } from 'src/app/components/profile/profile.component';
import { MapsComponent } from './components/maps/maps.component';
import { AuthGuard } from './services/auth.guard';
import { UploadTourComponent } from './components/upload-tour/upload-tour.component'; 
import { AboutUsComponent } from './components/about-us/about-us.component';

import { MyToursComponent } from './components/my-tours/my-tours.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { HistoryToursComponent } from './components/history-tours/history-tours.component';
import { ExitComponent } from './components/exit/exit.component'
import { MusicPlayerDetailComponent } from './components/generics/music-player-detail/music-player-detail.component';
import { ProfilecardsComponent } from './components/profilecards/profilecards.component';
import { EdittoursComponent } from './components/edittours/edittours.component';


const routes: Routes = [
  {
    path:'',
    redirectTo:'/home',
    pathMatch:'full'
  },
  { 
    path: 'home', 
    component: HomeComponent
  },  
  { 
    path: 'login', 
    component: LoginComponent
  },
  { 
    path: 'alltours', 
    component: AlltoursComponent
  },  
  { 
    path: 'tour/:id', 
    component: TourDetailComponent
  },
  { 
    path: 'stepper/:id', 
    component: StepperComponent
  },
  { 
    path: 'signup', 
    component: SignupComponent
  },
  { 
    path: 'about-us',
    component: AboutUsComponent
  },
  {
     path: 'custom_tours_page', 
     component: CustomToursPageComponent 
  },
  {
     path: 'registration-success',
     component: RegistrationSuccessComponent 
  },
  {
    path: 'registration-success',
    component: RegistrationSuccessComponent
  },

  {
    path: 'maps/:lat/:long/:id',
    component: MapsComponent
  },
  {
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [AuthGuard] 
  },

  {
    path: 'upload-tour', 
    component: UploadTourComponent,
    canActivate: [AuthGuard] 
  },
  {
    path: 'my-tours', 
    component: MyToursComponent
  },
  {
    path: 'history-tours', 
    component: HistoryToursComponent
  },
  {
    path: 'edit-profile', 
    component: EditProfileComponent,
    canActivate: [AuthGuard] 
  },  
  {
    path: 'edit-tours/:id', 
    component: EdittoursComponent,
    canActivate: [AuthGuard] 
  },
  {
    path: 'exit/:id', 
    component: ExitComponent,
  },
  {
    path:'music-detail',
    component: MusicPlayerDetailComponent,
  },
  {
    path:'profile-card',
    component: ProfilecardsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
