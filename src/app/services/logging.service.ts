import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  log(message: string) {
    console.log(`Log: ${message}`);
  }

  error(message: string) {
    console.error(`Error: ${message}`);
  }

}
