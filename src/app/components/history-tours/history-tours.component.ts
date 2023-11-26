import { Component, OnInit } from '@angular/core';




export interface Tour {
  id: number;
  title: string;
  date: Date;
  imageUrl: string;
  description: string;
  // otros campos según sean necesarios...
}

@Component({
  selector: 'app-history-tours',
  templateUrl: './history-tours.component.html',
  styleUrls: ['./history-tours.component.scss']
})


export class HistoryToursComponent implements OnInit {
  tours: Tour[] = [
    { id: 1, title: 'Tour 1', date: new Date(), imageUrl: 'url-de-imagen', description: 'Descripción del Tour 1' },
    // otros tours de prueba...
  ];
  constructor() { }

  ngOnInit() {
      // Aquí cargarías los tours del usuario
  }

  viewTour(id: number) {
      // Lógica para ver los detalles del tour
  }

  editTour(id: number) {
      // Lógica para editar un tour
  }

  deleteTour(id: number) {
      // Lógica para eliminar un tour
  }
}