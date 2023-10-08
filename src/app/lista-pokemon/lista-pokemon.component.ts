import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-lista-pokemon',
  templateUrl: './lista-pokemon.component.html',
  styleUrls: ['./lista-pokemon.component.css']
})
export class ListaPokemonComponent implements OnInit {
  @Output() pokemonSelected: EventEmitter<any> = new EventEmitter<any>();
  selectedRegion: string = 'kanto'; 
  regions: string[] = ['kanto', 'johto', 'hoenn', 'sinnoh', 'teselia', 'kalos', 'alola', 'galar', 'hisui', 'paldea', 'nacional']; // Lista de regiones disponibles

  selectedPokemon: any = null;
  pokemonList: any[] = [];
searchTerm: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getPokemonList();
  }

  //genera la lista 
  getPokemonList() {
    let regionUrl = this.getRegionUrl(this.selectedRegion);
    this.http.get<any>(regionUrl)
      .subscribe((data) => {
        this.pokemonList = data.results;
        this.pokemonList.forEach((pokemon: any) => {
          const firstLetter = pokemon.name.charAt(0).toUpperCase();
          this.http.get<any>(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
            .subscribe((pokemonData) => {
              pokemon.sprites = pokemonData.sprites;
            });
        });

      });
  }




  selectPokemon(pokemon: any) {
    // Obtener detalles adicionales del Pokémon
    this.http.get<any>(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
      .subscribe((data) => {
        if (data.sprites) {
          const filteredSprites: any = Object.keys(data.sprites)
            .filter((key) => !key.includes('back'))
            .reduce((obj: any, key) => {
              obj[key] = data.sprites[key];
              return obj;
            }, {});
          data.sprites = filteredSprites;
        }

        // Obtener la descripción del Pokémon 
        this.http.get<any>(data.species.url)
          .subscribe((speciesData) => {
            // Filtrar las descripciones en español (idioma 'es')
            const englishDescriptions = speciesData.flavor_text_entries.filter((entry: any) => entry.language.name === 'es');

            const lastEnglishDescription = englishDescriptions.slice(-1)[0];

            if (lastEnglishDescription) {
              data.description = lastEnglishDescription.flavor_text;
            }

            // Obtener las debilidades del Pokémon
            this.http.get<any>(`https://pokeapi.co/api/v2/type/${data.types[0].type.name}`)
              .subscribe((typeData) => {
                const weaknesses = typeData.damage_relations.double_damage_from.map((type: any) => type.name);
                data.weaknesses = weaknesses;

                this.selectedPokemon = data;

                this.pokemonSelected.emit(this.selectedPokemon);
              });
          });
      });
  }


  getRegionUrl(region: string): string {
    let url = '';

    switch (region.toLowerCase()) {
      case 'kanto':
        url = 'https://pokeapi.co/api/v2/pokemon/?offset=0&limit=151';
        break;
      case 'johto':
        url = 'https://pokeapi.co/api/v2/pokemon/?offset=151&limit=100';
        break;
      case 'hoenn':
        url = 'https://pokeapi.co/api/v2/pokemon/?offset=251&limit=135';
        break;
      case 'sinnoh':
        url = 'https://pokeapi.co/api/v2/pokemon/?offset=386&limit=107';
        break;
      case 'teselia':
        url = 'https://pokeapi.co/api/v2/pokemon/?offset=493&limit=156';
        break;
      case 'kalos':
        url = 'https://pokeapi.co/api/v2/pokemon/?offset=649&limit=72';
        break;
      case 'alola':
        url = 'https://pokeapi.co/api/v2/pokemon/?offset=721&limit=88';
        break;
      case 'galar':
        url = 'https://pokeapi.co/api/v2/pokemon/?offset=809&limit=89';
        break;
      case 'hisui':
        url = 'https://pokeapi.co/api/v2/pokemon/?offset=898&limit=7';
        break;
      case 'paldea':
        url = 'https://pokeapi.co/api/v2/pokemon/?offset=905&limit=105';
        break;
      case 'nacional':
        url = 'https://pokeapi.co/api/v2/pokemon/?offset=0&limit=1010';
        break;


      default:
        break;
    }

    return url;
  }

  changeRegion(region: string) {
    this.selectedRegion = region;
    this.getPokemonList();
  }


  // metodo para realizar la busqueda
  searchPokemon() {
    // filtrar la lista de Pokémon basado en el termino de busqueda
    if (this.searchTerm) {
      this.pokemonList = this.pokemonList.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      // Si el término de búsqueda está vacío, restaurar la lista original
      this.getPokemonList();
    }
  }
}
