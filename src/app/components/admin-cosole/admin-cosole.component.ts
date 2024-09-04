import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from 'src/app/services/user-service.service';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-admin-cosole',
  templateUrl: './admin-cosole.component.html',
  styleUrls: ['./admin-cosole.component.scss']
})
export class AdminCosoleComponent {
  displayedColumns: string[] = ['id', 'username', 'rol', 'edit'];
  dataSource!: MatTableDataSource<any>;
  selectedRole: string = 'user';
  role:string = 'user';
  load_elemet!:any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private userService: UserService) { }
  

  ngOnInit(): void {
    this.loadUsers();
  }
  loadUsers(){
    this.userService.getUsers().subscribe((data:any) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  onRoleChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.role=selectedValue;
    
  }
  load_data(element:any){
    this.load_elemet=element;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  editUser(user: any) {
    this.userService.editUsers(user.id, this.role).subscribe((res:any)=>{
      if(res.message=='Role updated successfully'){
        this.loadUsers();
      }      
    });    
  }
}
