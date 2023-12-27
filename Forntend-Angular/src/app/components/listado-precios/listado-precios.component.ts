import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DemoMaterialModule } from 'src/app/demo-material-module';
import { NgFor, NgIf } from '@angular/common';
import { PreciosService } from '../../services/precios.service';
import { DataSharingService } from '../../services/data-sharing.service';
import { ActivatedRoute } from '@angular/router';
import { DetallesZapatosComponent } from '../detalles-zapatos/detalles-zapatos.component';

@Component({
  selector: 'app-listado-precios',
  standalone: true,
  imports: [DemoMaterialModule, NgIf, NgFor],
  templateUrl: './listado-precios.component.html'
})
export class ListadoPreciosComponent implements OnInit, OnChanges {

  @Input() data: any;

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

  constructor(private detallesZapatosComponent: DetallesZapatosComponent, private preciosService: PreciosService, private dataSharingService: DataSharingService, private route: ActivatedRoute) {
    
  }

  formatDate(fecha: Date): any{
    
    const dateObject = new Date(fecha);
    
    const formattedDate = dateObject.toLocaleDateString('es-ES', this.optionsDate);

    return formattedDate;
  }

  ngOnDestroy() {
    // Importante: Desuscribirse al servicio al destruir el componente
    //this.dataSharingService.getZapatoSelected().unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.preciosData = this.detallesZapatosComponent.zapatoSelect.estadisticasPrecios.vectorPrecios;
  }

  ngOnInit(){
  }

}
