import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DemoMaterialModule } from 'src/app/demo-material-module';
import { NgFor, NgIf } from '@angular/common';
import { PreciosService } from '../../services/precios.service';
import { DataSharingService } from '../../services/data-sharing.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-listado-precios',
  standalone: true,
  imports: [DemoMaterialModule, NgIf, NgFor],
  templateUrl: './listado-precios.component.html'
})
export class ListadoPreciosComponent implements OnInit  {

  zapatoSelected: any = "";
  preciosData: any[] = [];

  optionsDate: any = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };

  constructor(private preciosService: PreciosService, private dataSharingService: DataSharingService, private route: ActivatedRoute) {
    
  }

  formatDate(fecha: Date): any{
    
    const dateObject = new Date(fecha);
    
    const formattedDate = dateObject.toLocaleDateString('es-ES', this.optionsDate);

    return formattedDate;
  }

  getPricesByProductD(idZapato: string){

    this.preciosService.getPricesByProduct(idZapato).subscribe(
      (data: any) => {
        this.preciosData = data;
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  ngOnDestroy() {
    // Importante: Desuscribirse al servicio al destruir el componente
    //this.dataSharingService.getZapatoSelected().unsubscribe();
  }


  ngOnInit(){
    this.route.params.subscribe(params => {
      const id = params['id'];
      
      this.getPricesByProductD(id)
    });
  }

}
