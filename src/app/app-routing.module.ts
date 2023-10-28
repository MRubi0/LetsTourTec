import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AlltoursComponent } from './components/alltours/alltours.component';
import { TourDetailComponent } from './components/tour-detail/tour-detail.component';
import { StepperComponent } from './components/stepper/stepper.component';
import { SigninComponent } from './components/signin/signin.component';
import { CustomToursPageComponent } from './components/custom-tours-page/custom-tours-page.component';
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
    path: 'stepper', 
    component: StepperComponent
  },
  { 
    path: 'sigin', 
    component: SigninComponent
  },
  {
     path: 'custom_tours_page', 
     component: CustomToursPageComponent 
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
