import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-lista-pokemon',
  templateUrl: './lista-pokemon.component.html',
  styleUrls: ['./lista-pokemon.component.css']
})
export class ListaPokemonComponent implements OnInit {
  @Output() pokemonSelected: EventEmitter<any> = new EventEmitter<any>();
  pokemonList: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getPokemonList();
  }

  getPokemonList(): void {
    const apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=151';
    this.http.get(apiUrl).subscribe((data: any) => {
      const pokemonDetailsPromises = data.results.map((pokemon: any) =>
        this.http.get(pokemon.url).toPromise()
      );

      Promise.all(pokemonDetailsPromises).then((detailedPokemonData: any[]) => {
        // Aquí detailedPokemonData contendrá la información completa de cada Pokémon
        this.pokemonList = detailedPokemonData;
      });
    });
  }

  selectPokemon(pokemon: any) {
    // Emitir el Pokémon seleccionado para que otros componentes lo reciban
    this.pokemonSelected.emit(pokemon);
  }
}
