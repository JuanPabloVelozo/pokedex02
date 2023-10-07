import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // Importa el módulo HttpClientModule, que es necesario para HttpClient

import { AppComponent } from './app.component';
import { ListaPokemonComponent } from './lista-pokemon/lista-pokemon.component';
import { DetallePokemonComponent } from './detalle-pokemon/detalle-pokemon.component';

@NgModule({
  declarations: [
    AppComponent,
    ListaPokemonComponent,
    DetallePokemonComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule, // Agrega HttpClientModule como un import en tu módulo
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
