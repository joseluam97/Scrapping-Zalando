// app.module.ts
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutes } from './app-routing.module'; // Importa el AppRoutingModule

// Importa tus componentes y otros módulos necesarios
import { AppComponent } from './app.component';
import { ListadoPreciosComponent } from './components/listado-precios/listado-precios.component';
import { ListadoZapatosComponent } from './dashboard/listado-zapatos.component';
import { GraficoPreciosComponent } from './components/grafico-precios/grafico-precios.component';
import { DetallesZapatosComponent } from './components/detalles-zapatos/detalles-zapatos.component';

@NgModule({
  declarations: [
    ListadoPreciosComponent,
    ListadoZapatosComponent,
    GraficoPreciosComponent,
    DetallesZapatosComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutes,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppRouting {}
