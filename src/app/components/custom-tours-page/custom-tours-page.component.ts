import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-custom-tours-page',
  templateUrl: './custom-tours-page.component.html',
  styleUrls: ['./custom-tours-page.component.scss']
})
export class CustomToursPageComponent implements OnInit {
  latitude?: number;
  longitude?: number;
  location?: string;
  tours: any[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
          this.latitude = +params['latitude'];
          this.longitude = +params['longitude'];
          this.location = params['location']; 
          if (this.latitude && this.longitude) { 
            this.fetchTours();
          }
      });
  }

  async fetchTours() {
      const baseUrl = 'http://localhost:8000'; 
      const url = `${baseUrl}/get_nearest_tours_all/?page=1&latitude=${this.latitude}&longitude=${this.longitude}`;
      
      try {
        const response = await fetch(url);
        
        const data = await response.json();
        console.log("Data received:", data);
        this.tours = data.tours;
 
    } catch (error) {
        console.error("Error fetching tours:", error);
    }
    
  }
}
