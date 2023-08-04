import { Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { DetallesZapatosComponent } from '../components/detalles-zapatos/detalles-zapatos.component';

export const DashboardRoutes: Routes = [
  {
  path: '',
  component: DashboardComponent
},
{
  path: 'detalles/:id',
  component: DetallesZapatosComponent
}
];
