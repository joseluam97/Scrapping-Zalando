import { Routes } from '@angular/router';
import { DetallesZapatosComponent } from './components/detalles-zapatos/detalles-zapatos.component';
import { ListadoZapatosComponent } from './dashboard/listado-zapatos.component';
import { FullComponent } from './layouts/full/full.component';

const AppRoutes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: 'listado',
        component: ListadoZapatosComponent
      },
      {
        path: 'detalles/:id',
        component: DetallesZapatosComponent
      }
    ]
  }
];

export { AppRoutes };
