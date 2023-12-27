import { Component, OnInit, Input, ViewChild, SimpleChanges, OnChanges } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexStroke,
  ApexXAxis,
  ApexFill,
  ApexTooltip,
  ApexGrid,
  NgApexchartsModule
} from "ng-apexcharts";
import { DemoMaterialModule } from "src/app/demo-material-module";
import { DataSharingService } from "src/app/services/data-sharing.service";
import { PreciosService } from "src/app/services/precios.service";
import { DetallesZapatosComponent } from "../detalles-zapatos/detalles-zapatos.component";

export interface ChartOptions {
  series: ApexAxisChartSeries | any;
  chart: ApexChart | any;
  dataLabels: ApexDataLabels | any;
  plotOptions: ApexPlotOptions | any;
  yaxis: ApexYAxis | any;
  xaxis: ApexXAxis | any;
  fill: ApexFill | any;
  tooltip: ApexTooltip | any;
  stroke: ApexStroke | any;
  legend: ApexLegend | any;
  grid: ApexGrid | any;
}



@Component({
  selector: "app-grafico-precios",
  standalone: true,
  imports: [NgApexchartsModule, DemoMaterialModule],
  templateUrl: "./grafico-precios.component.html"
})
export class GraficoPreciosComponent implements OnInit, OnChanges {

  @Input() data: any;

  @ViewChild("chart") chart: ChartComponent = Object.create(null);
  public chartOptions: Partial<ChartOptions>;

  zapatoSelected: any = "";

  constructor(private detallesZapatosComponent: DetallesZapatosComponent, private preciosService: PreciosService, private dataSharingService: DataSharingService, private route: ActivatedRoute) {
    this.chartOptions = {};
  }

  optionsDate: any = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };

  completarOpcionesGrafico(vectorPrecios: any[], vectorFechas: any[]){
    this.chartOptions = {
      series: [
        {
          name: "Precio",
          data: vectorPrecios,
        }
      ],
      chart: {
        type: "bar",
        fontFamily: "Poppins,sans-serif",
        height: 320,
      },
      grid: {
        borderColor: "rgba(0,0,0,.2)",
        strokeDashArray: 3,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "30%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: vectorFechas,
      },
      legend: {
        show: false,
      },
      fill: {
        colors: ["#1e88e5"],
        opacity: 1,
      },
      tooltip: {
        theme: "dark",
      },
    };
  }

  setDataToChart(){

    let preciosData = this.detallesZapatosComponent.zapatoSelect.estadisticasPrecios.vectorPrecios;

    let newData = [...preciosData]

    let vectorPrecios: any = []
    let vectorFechas: any = []

    //Ordena el vector por fechas
    newData.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    //Obtiene los valores buscados en el grafico
    newData.map(elemento => {
      //PRECIO
      vectorPrecios.push(elemento['precio'])

      //FECHA
      const dateObject = new Date(elemento['fecha']);
      const formattedDate = dateObject.toLocaleDateString('es-ES', this.optionsDate);

      vectorFechas.push(formattedDate)
    })

    this.completarOpcionesGrafico(vectorPrecios, vectorFechas)

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setDataToChart();
  }

  ngOnInit(){
    //this.setDataToChart();
  }

}
