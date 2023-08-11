import { Injectable } from '@angular/core';

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
}

const MENUITEMS = [
  { state: 'dashboard', name: 'Listado de Zapatos', type: 'link', icon: 'view_module' },
  {
    state: 'mis-favoritos',
    type: 'link',
    name: 'Mis favoritos',
    icon: 'favorite'
  }
];

@Injectable()
export class MenuItems {
  getMenuitem(): Menu[] {
    return MENUITEMS;
  }
}
