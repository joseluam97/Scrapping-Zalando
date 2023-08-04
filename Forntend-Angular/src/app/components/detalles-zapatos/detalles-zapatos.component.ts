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

  precioMasAlto: number = 0
  precioMasBajo: number = 0
  precioMedio: number = 0
  nRegistros: number = 0

  constructor(private router: Router, private zapatosService: ZapatosService, private preciosService: PreciosService, private dataSharingService: DataSharingService, private route: ActivatedRoute) { }


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id']; // Aquí obtienes el valor del parámetro 'id'
      console.log('Valor del parámetro id:', id);
      
      this.getZapatoById(id)
      this.getPricesByProductD(id)
    });
  }

  getZapatoById(idZapato: string){
    this.zapatosService.getZapatoById(idZapato).subscribe(
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

  getPricesByProductD(idZapato: string){

    this.preciosService.getPricesByProduct(idZapato).subscribe(
      (data: any) => {
        this.listadoPrecios = data;
        this.obtenerValoresIndividualesPrecios(data)
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  obtenerValoresIndividualesPrecios(listPrice: any[]){
    //PRECIO MAS ALTO
    let copyAlto = [...listPrice]
    const maxPrice = copyAlto.reduce((max, item) => {
      const price = parseFloat(item.price);
      return !isNaN(price) && price > max ? price : max;
    }, -Infinity);

    this.precioMasAlto = maxPrice

    //PRECIO MAS BAJO
    let copyBajo = [...listPrice]
    const minPrice = copyBajo.reduce((min, item) => {
      const price = parseFloat(item.price);
      return !isNaN(price) && price < min ? price : min;
    }, Infinity);

    this.precioMasBajo = minPrice

    //PRECIO MEDIO
    let copyMedia = [...listPrice]
    const prices = copyMedia.map(item => parseFloat(item.price)).filter(price => !isNaN(price));

    if (prices.length != 0) {
      const sum = prices.reduce((total, price) => total + price, 0);
      const average = sum / prices.length;

      this.precioMedio = average
    }

    //NUMERO DE REGISTROS
    this.nRegistros = listPrice.length
  }

}
