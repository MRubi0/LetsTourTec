import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient) { }

  getProfile(email: string) {
    return this.http.get(`${environment.apiUrl}profile/get?id=${email}`)
      .pipe(map((data: any) => {
        return data;
      }));
  }
}
