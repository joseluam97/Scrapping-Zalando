import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesZapatosComponent } from './detalles-zapatos.component';

describe('DetallesZapatosComponent', () => {
  let component: DetallesZapatosComponent;
  let fixture: ComponentFixture<DetallesZapatosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetallesZapatosComponent]
    });
    fixture = TestBed.createComponent(DetallesZapatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
