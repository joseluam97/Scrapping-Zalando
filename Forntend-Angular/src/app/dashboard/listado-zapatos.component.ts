import { Component, OnInit } from '@angular/core';
import { DemoMaterialModule } from 'src/app/demo-material-module';
import { ZapatosService } from '../services/zapatos.service';
import { DataSharingService } from '../services/data-sharing.service';
import { ListadoPreciosComponent } from '../components/listado-precios/listado-precios.component';
import { PageEvent } from '@angular/material/paginator';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { NgFor, NgIf } from '@angular/common';
import { PreciosService } from 'src/app/services/precios.service';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-listado-zapatos',
  standalone: true,
  imports: [DemoMaterialModule, NgIf, NgFor, AsyncPipe, MatAutocompleteModule, MatInputModule, MatFormFieldModule, RouterModule],
  templateUrl: './listado-zapatos.component.html',
  styleUrls: ['listado-zapatos.css']
})
export class ListadoZapatosComponent implements OnInit {

	//VAriables para la ampliacion de las imagenes
	showThumbnail: boolean = true;
	urlImage: any = ""
  
	listadoPrecios: any[] = [];
  
	//VAriable de carga inicial
	cargaCompletada = false;
	tallaSelected = '';
	infoPreciosTalla = false
  
	selected = '';
  
	//Variables del select de marca
	marcaControl = new FormControl('');
	filteredOptions!: Observable<string[]>;
	filteredOptionsSize!: Observable<string[]>;
  
	//Variables para la paginacion de los elementos 
	filteredItems: any[] = [];
	displayedItems: any[] = [];
	pageIndex = 0;
	pageSize = 48;
  
	zapatosData: any[] = [];
	allBrandData: any[] = [];
	allSizeData: any[] = [];
  
	constructor(private zapatosService: ZapatosService, private dataSharingService: DataSharingService) {}
  
	ngOnInit() {
	  this.getAllZapatos();
	  this.getAllBrand();
	  this.getAllSizes();
	}
  
	setDataShare(elemento: any) {
	  this.dataSharingService.setZapatoSelected(elemento)
	}
  
	getAllZapatos() {
	  //GET ALL ZAPATOS
	  this.zapatosService.getZapatos().subscribe(
		(data: any) => {
		  this.cargaCompletada = true
  
		  this.zapatosData = data;
		  
		  // Por ejemplo, cargar datos iniciales o hacer llamada a API aquí
		  this.filteredItems = data; // Supongamos que tienes una constante `items` con tus datos
		  this.updateDisplayedItems();
  
		},
		(error) => {
		  console.error('Error:', error);
		}
	  );
	}
  
	getAllZapatosWithTalla() {
	  //GET ALL ZAPATOS
	  this.zapatosService.getZapatosWithTalla(this.tallaSelected).subscribe(
		(data: any) => {
		  this.cargaCompletada = true
  
		  this.zapatosData = data;
		  
		  // Por ejemplo, cargar datos iniciales o hacer llamada a API aquí
		  this.filteredItems = data; // Supongamos que tienes una constante `items` con tus datos
		  this.updateDisplayedItems();
  
		},
		(error) => {
		  console.error('Error:', error);
		}
	  );
	}
  
	getAllBrand(){
	  //GET ALL BRAND
	  this.zapatosService.getAllBrand().subscribe(
		(data: any) => {
		  this.allBrandData = data;
  
		  this.setFormData()
		},
		(error) => {
		  console.error('Error:', error);
		}
	  );
	}
  
	getAllSizes(){
	  //GET ALL BRAND
	  this.zapatosService.getAllSizes().subscribe(
		(data: any) => {
		  this.allSizeData = data;
		},
		(error) => {
		  console.error('Error:', error);
		}
	  );
	}
  
	setFormData(){
	  this.filteredOptions = this.marcaControl.valueChanges.pipe(
		startWith(''),
		map(value => this._filter(value || '')),
	  );
	}
  
	//Funciones de filtrado y paginacion
	applyFilter(filterValue: string): void {
	  // Filtrar por título
	  this.filteredItems = this.zapatosData.filter(item => item.title.toLowerCase().includes(filterValue.toLowerCase()));
	  this.updateDisplayedItems();
	}
  
	onPageChange(event: PageEvent): void {
	  this.pageIndex = event.pageIndex;
	  this.updateDisplayedItems();
	}
  
	updateDisplayedItems(): void {
	  const startIndex = this.pageIndex * this.pageSize;
	  this.displayedItems = this.filteredItems.slice(startIndex, startIndex + this.pageSize);
	}
  
	//Funciones del select de marca
	private _filter(value: string): string[] {
	  const filterValue = value.toLowerCase();
  
	  return this.allBrandData.filter(option => option.toLowerCase().includes(filterValue));
	}
  
	//Funcion de select de talla
	onOptionTallaSelected(){
	  if(this.tallaSelected == "" || this.tallaSelected == undefined || this.tallaSelected == null){
		this.getAllZapatos()
		this.infoPreciosTalla = false;
	  }
	  else{
		this.getAllZapatosWithTalla();
		this.infoPreciosTalla = true;
	  }
	}
  
	//Funciones de filtro superior
	//OTROS FILTROS
	onOptionOtrosSelected() {
	  if(this.selected != ""){
		//this.filteredItems = this.zapatosData.filter(item => item.brand.toLowerCase().includes(event.option.value.toLowerCase()));
		this.filteredItems.sort((a, b) => a.porcentaje_cambio - b.porcentaje_cambio)
		//newData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		this.updateDisplayedItems();
	  }
	  else{
		this.filteredItems = this.zapatosData
		this.updateDisplayedItems();
	  }
	  
	}
	//MARCA
	onOptionSelected(event: any) {
	  if(event.option.value != undefined){
		this.filteredItems = this.zapatosData.filter(item => item.brand.toLowerCase().includes(event.option.value.toLowerCase()));
		this.updateDisplayedItems();
	  }
	  else{
		this.filteredItems = this.zapatosData
		this.updateDisplayedItems();
	  }
	  
	}
	//TEXTO LIBRE
	onInputChanged(event: any) {
	  this.filteredItems = this.zapatosData.filter(item => item.name.toLowerCase().includes(event.target.value.toLowerCase()));
	  this.updateDisplayedItems();
	}
  
	//Funcion para ver las imagenes en grande
	showFullImage(urlImagen: string) {
	  this.urlImage = urlImagen
	  if(this.showThumbnail == true){
		this.showThumbnail = false;
	  }
	  else{
		this.showThumbnail = true;
	  }
	  
	}
  
  }
  
