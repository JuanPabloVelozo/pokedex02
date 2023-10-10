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

  letterCounts: { [key: string]: number } = {}; // Objeto para almacenar los recuentos por letra


  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getPokemonList();
  }

  //genera la lista 
  getPokemonList() {
    let regionUrl = this.getRegionUrl(this.selectedRegion);
    this.http.get<any>(`https://pokeapi.co/api/v2/pokemon/${regionUrl}`)
      .subscribe((data) => {
        this.pokemonList = data.results;
        
        this.pokemonList.forEach((pokemon: any) => {
          const firstLetter = pokemon.name.charAt(0).toUpperCase();
          this.http.get<any>(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
            .subscribe((pokemonData) => {
              pokemon.sprites = pokemonData.sprites;
            });
        });
        // Calcular los recuentos por letra sin alterar la lista original
        this.calculateLetterCounts();
      });
  }

  calculateLetterCounts() {
    this.pokemonList.forEach((pokemon) => {
      const firstLetter = pokemon.name.charAt(0).toUpperCase();

      if (!this.letterCounts[firstLetter]) {
        this.letterCounts[firstLetter] = 1;
      } else {
        this.letterCounts[firstLetter]++;
      }
    });
  }
  selectPokemon(pokemon: any) {
    this.http.get<any>(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
      .subscribe((data) => {
        if (data.sprites) {
          const filteredSprites = Object.keys(data.sprites)
            .filter((key) => !key.includes('back'))
            .reduce((obj: any, key) => {
              obj[key] = data.sprites[key];
              return obj;
            }, {});
          data.sprites = filteredSprites;
        }

        this.http.get<any>(data.species.url)
          .subscribe((speciesData) => {
            const esDescriptions = speciesData.flavor_text_entries.filter((entry: any) => entry.language.name === 'es');
            const lastEsDescription = esDescriptions.slice(-1)[0];

            if (lastEsDescription) {
              data.description = lastEsDescription.flavor_text;
            }

            this.http.get<any>(`https://pokeapi.co/api/v2/type/${data.types[0].type.name}`)
              .subscribe((typeData) => {
                const weaknesses = typeData.damage_relations.double_damage_from.map((type: any) => type.name);
                data.weaknesses = weaknesses;

                this.http.get<any>(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
                  .subscribe((movesData) => {
                    const moveUrls = movesData.moves.map((move: any) => move.move.url);

                    const moveDetailsPromises = moveUrls.map((moveUrl: string) => {
                      return this.http.get<any>(moveUrl).toPromise();
                    });

                    Promise.all(moveDetailsPromises)
                      .then((moveDetails) => {
                        const formattedMoves = moveDetails.map((moveDetail: any) => {
                          return {
                            name: moveDetail.name,
                            power: moveDetail.power,
                            type: moveDetail.type.name,
                          };
                        });

                        const moveCategoryPromises = formattedMoves.map((move: any) => {
                          return this.http.get<any>(`https://pokeapi.co/api/v2/move/${move.name}`).toPromise();
                        });

                        Promise.all(moveCategoryPromises)
                          .then((categoryData) => {
                            formattedMoves.forEach((move: any, index: number) => {
                              move.category = categoryData[index].damage_class.name;
                            });

                            data.moves = formattedMoves;
                            this.selectedPokemon = data;
                            this.pokemonSelected.emit(this.selectedPokemon);
                          })
                          .catch((error) => {
                            console.error('Error al obtener la categoría de los movimientos:', error);
                          });
                      })
                      .catch((error) => {
                        console.error('Error al obtener detalles de los movimientos:', error);
                      });
                  });
              });
          });
      });
  }


  getRegionUrl(region: string): string {
    let url = '';

    switch (region.toLowerCase()) {
      case 'kanto':
        url = '?offset=0&limit=151';
        break;
      case 'johto':
        url = '?offset=151&limit=100';
        break;
      case 'hoenn':
        url = '?offset=251&limit=135';
        break;
      case 'sinnoh':
        url = '?offset=386&limit=107';
        break;
      case 'teselia':
        url = '?offset=493&limit=156';
        break;
      case 'kalos':
        url = '?offset=649&limit=72';
        break;
      case 'alola':
        url = '?offset=721&limit=88';
        break;
      case 'galar':
        url = '?offset=809&limit=89';
        break;
      case 'hisui':
        url = '?offset=898&limit=7';
        break;
      case 'paldea':
        url = '?offset=905&limit=105';
        break;
      case 'nacional':
        url = '?offset=0&limit=1010';
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
