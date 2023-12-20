import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  searchText: string= '';
  searchResults: any[] = [];
  selectedLocation: any;

  constructor(private router: Router) {} 

  async searchLocation() {
    if (!this.searchText.trim()) {
      console.log('searchText está vacío o solo contiene espacios.');
        return;
    }
    this.searchResults = [];
    

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchText)}`;
    try {
      const response = await fetch(url);
      const results = await response.json();
      if (results && Array.isArray(results)) {
         this.searchResults = results;
      } else {
         console.error("Unexpected response structure:", results);
      }
      console.log(this.searchResults);
   } catch (error) {
      console.error("Error fetching search results:", error);
   }
  }
  selectLocation(result: any) {
    this.selectedLocation = result;
    this.searchText = result.display_name;
    this.searchResults = []; 
  
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);
    const location = encodeURIComponent(result.display_name);
    
    window.location.href = `/custom_tours_page?latitude=${latitude}&longitude=${longitude}&location=${location}`;
  }

  handleClick(result: any) {
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);
    const location = encodeURIComponent(result.display_name);
    
    
    this.router.navigate(['/custom_tours_page'], { 
      queryParams: { latitude, longitude, location }
    });
  }
}
