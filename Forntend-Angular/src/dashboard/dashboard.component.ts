import { Component, AfterViewInit } from '@angular/core';
import { SalesOverviewComponent } from './dashboard-components/sales-overview/sales-overview.component';
import { OurVisiterComponent } from './dashboard-components/our-visiter/our-visiter.component';
import { ProfileComponent } from './dashboard-components/profile/profile.component';
import { ContactsComponent } from './dashboard-components/contacts/contacts.component';
import { ActivityTimelineComponent } from './dashboard-components/activity-timeline/activity-timeline.component';
import { ListadoZapatosComponent } from './dashboard-components/listado-zapatos/listado-zapatos.component';
import { ListadoPreciosComponent } from '../components/listado-precios/listado-precios.component';
import { GraficoPreciosComponent } from '../components/grafico-precios/grafico-precios.component'

@Component({
	selector: 'app-dashboard',
	standalone: true,
	imports: [GraficoPreciosComponent, SalesOverviewComponent, OurVisiterComponent, ProfileComponent, ContactsComponent, ActivityTimelineComponent, ListadoZapatosComponent, ListadoPreciosComponent],
	templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements AfterViewInit {

	ngAfterViewInit() { }

}
