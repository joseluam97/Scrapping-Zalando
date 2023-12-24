import { Component, AfterViewInit } from '@angular/core';
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

@Component({
  selector: 'app-detalles-zapatos',
	standalone: true,
  imports: [ListadoPreciosComponent, GraficoPreciosComponent, DemoMaterialModule, NgIf, NgFor, AsyncPipe, MatAutocompleteModule, MatInputModule, MatFormFieldModule],
  templateUrl: './detalles-zapatos.component.html',
  styleUrls: ['./detalles-zapatos.component.css']
})
export class DetallesZapatosComponent{

  zapatoSelect: any
  listadoPrecios: any[] = [];

  tallaZapato = "40"

  constructor(private router: Router, private zapatosService: ZapatosService, private preciosService: PreciosService, private dataSharingService: DataSharingService, private route: ActivatedRoute) { }


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id']; // Aquí obtienes el valor del parámetro 'id'
      console.log('Valor del parámetro id:', id);
      
      this.getZapatoById(id)
    });
  }

  getZapatoById(idZapato: string){
    this.zapatosService.getZapatoById(idZapato, this.tallaZapato).subscribe(
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

}
