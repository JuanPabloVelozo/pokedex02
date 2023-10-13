import { Component, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  selectedPokemon: any;
  loading: boolean = false;

  onPokemonSelected(pokemon: any) {
    this.selectedPokemon = pokemon;
  }
  title = 'pokedex02';
}
