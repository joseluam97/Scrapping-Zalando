import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { ZapatosService } from 'src/app/services/zapatos.service';
import { PreciosService } from 'src/app/services/precios.service';
import {GraficoPreciosComponent} from '../grafico-precios/grafico-precios.component'

import { DemoMaterialModule } from 'src/app/demo-material-module';
import {AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { NgFor, NgIf } from '@angular/common';

import {ListadoPreciosComponent} from '../listado-precios/listado-precios.component'
import { Router } from '@angular/router';
import { ListadoZapatosComponent } from 'src/app/dashboard/listado-zapatos.component';

@Component({
  selector: 'app-detalles-zapatos',
	standalone: true,
  imports: [ListadoZapatosComponent, ListadoPreciosComponent, GraficoPreciosComponent, DemoMaterialModule, NgIf, NgFor, AsyncPipe, MatAutocompleteModule, MatInputModule, MatFormFieldModule],
  providers: [ListadoZapatosComponent],
  templateUrl: './detalles-zapatos.component.html',
  styleUrls: ['./detalles-zapatos.component.css']
})
export class DetallesZapatosComponent implements OnInit {

  idZapatoSelected = ""
  zapatoSelect: any
  listadoPrecios: any[] = [];
  allSizesProducto: any[] = [];

  tallaArgumento = ""
  tallaSeleccionada = ""

  constructor(private listadoZapatosComponent: ListadoZapatosComponent, private router: Router, private zapatosService: ZapatosService, private preciosService: PreciosService, private dataSharingService: DataSharingService, private route: ActivatedRoute) { }


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id']; // Aquí obtienes el valor del parámetro 'id'
      
      this.idZapatoSelected = params['id'];

      //this.getZapatoById(id)
      this.getSizesByProducto(id)
    });

    this.route.queryParams.subscribe(params => {
      
      console.log("INFO talla")
      console.log(params['talla'])
      this.tallaArgumento = params['talla']
    });
  }

  ngOnDestroy() {

  }

  getSizesByProducto(idZapato: string){
    this.zapatosService.getSizesByProducto(idZapato).subscribe(
      (data: any) => {
        if(data != null){
          this.allSizesProducto = data;

          if(this.tallaArgumento != "" && this.tallaArgumento != undefined && this.tallaArgumento != null){
            if(data.includes(this.tallaArgumento) == true){
              this.tallaSeleccionada = this.tallaArgumento
            }
            else{
              this.tallaSeleccionada = data[0];
            }
          }
          else{
            this.tallaSeleccionada = data[0];
          }

          this.getZapatoById(idZapato)
        }
        else{
          this.router.navigate(['/']);
        }
        
      },
      (error) => {
        console.error('Error:', error);
        this.router.navigate(['/']);
      }
    );
  }

  getZapatoById(idZapato: string){
    this.zapatosService.getZapatoById(idZapato, this.tallaSeleccionada).subscribe(
      (data: any) => {
        if(data != null){
          this.zapatoSelect = data;
        }
        else{
          this.router.navigate(['/']);
        }
        
      },
      (error) => {
        console.error('Error:', error);
        this.router.navigate(['/']);
      }
    );
  }

  //Funcion de select de talla
  onOptionTallaSelected(){
    if(this.tallaSeleccionada == "" || this.tallaSeleccionada == undefined || this.tallaSeleccionada == null){
      this.router.navigate(['/']);
    }
    else{
      this.getZapatoById(this.idZapatoSelected)
    }
  }

}
