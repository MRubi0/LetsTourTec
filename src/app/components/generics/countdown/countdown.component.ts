import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent {
  countdown:number=5;

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
        this.router.navigate(['/exit']);
        this.ngbModal.dismissAll("close")
      }
    }, 1000);
  }
  accept(): void {
    this.router.navigate(['/exit']);
    this.ngbModal.dismissAll("close")
  }

  cancel(): void {
    this.ngbModal.dismissAll("close")
  }
}
