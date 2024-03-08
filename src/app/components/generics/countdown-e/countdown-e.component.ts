import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-countdown-e',
  templateUrl: './countdown-e.component.html',
  styleUrls: ['./countdown-e.component.scss']
})
export class CountdownEComponent {
  countdown:number=5;
  validate=false;
  constructor(public ngbModal: NgbModal, private router: Router,){
    
  }

  ngOnInit(){
    this.startCountdown();
  }
  startCountdown(): void {
    const countdownInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(countdownInterval);        
        if(!this.validate){
          this.router.navigate(['/home']);
        }
        this.ngbModal.dismissAll("close")
      }
    }, 1000);
  }
  accept(): void {
    this.router.navigate(['/home']);
    this.ngbModal.dismissAll("close");
    this.validate=true;
  }

  cancel(): void {
    this.ngbModal.dismissAll("close");
    this.validate=true;
  }
}
