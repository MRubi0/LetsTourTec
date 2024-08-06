import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+'api/users/');
  }


  
  editUsers(user_id:number, role:string){
    return this.http.post<any>(`${environment.apiUrl}api/change-role/${user_id}/`, { rol: role  })
    .pipe(map((users:any) => {
      return users;
    }));
  }
}
