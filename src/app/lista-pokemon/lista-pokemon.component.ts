import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

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
              pokemon.number = pokemonData.id;
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
    //select pokemon
  async selectPokemon(pokemon: any) {
    try {
      // Obtiene datos básicos del Pokémon desde la API
      const pokemonData = await this.http.get<any>(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`).toPromise();

      // Filtra las habilidades ocultas y las habilidades normales
      const hiddenAbilities = pokemonData.abilities.filter((ability: any) => ability.is_hidden);
      const normalAbilities = pokemonData.abilities.filter((ability: any) => !ability.is_hidden);

      // Asigna las habilidades al objeto `pokemonData`
      pokemonData.hiddenAbilities = hiddenAbilities;
      pokemonData.normalAbilities = normalAbilities;


      // Obtiene información sobre las evoluciones del Pokémon
      const speciesData = await this.http.get<any>(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.name}`).toPromise();

      if (speciesData.evolution_chain) {
          // Obtiene la URL de la cadena de evolución
          const evolutionChainUrl = speciesData.evolution_chain.url;
          const evolutionChainData = await this.http.get<any>(evolutionChainUrl).toPromise();

          // Función recursiva para obtener todas las evoluciones
          const evolutions: any[] = [];

          function getEvolutions(chain: any) {
            const evolutionInfo = {
              name: chain.species.name,
              evolutionDetails: chain.evolution_details
            };
            evolutions.push(evolutionInfo);

            if (chain.evolves_to.length > 0) {
              // Handle branched evolutions
              chain.evolves_to.forEach((branch: any) => {
                getEvolutions(branch);
              });
            }
          }

          getEvolutions(evolutionChainData.chain);

          // Obtén el primer sprite frontal de cada evolución y agrégalo a un arreglo de sprites de evoluciones
          const evolutionSpritesPromises = evolutions.map(async (evolutionInfo: any) => {
            const evolutionData = await this.http.get<any>(`https://pokeapi.co/api/v2/pokemon/${evolutionInfo.name}`).toPromise();
            return evolutionData.sprites.front_default;
          });

          // Agrega la lista de evoluciones al objeto `pokemonData`
          const evolutionSprites = await Promise.all(evolutionSpritesPromises);
          pokemonData.evolutionSprites = evolutionSprites;
          pokemonData.evolutions = evolutions;
      }


      // Filtra las imágenes del Pokémon para eliminar las versiones "back"
      if (pokemonData.sprites) {
        const filteredSprites = Object.keys(pokemonData.sprites)
          .filter((key) => !key.includes('back'))
          .reduce((obj: any, key) => {
            obj[key] = pokemonData.sprites[key];
            return obj;
          }, {});
        pokemonData.sprites = filteredSprites;
      }

      // Obtiene debilidades del Pokémon a partir de su tipo
      const typeData = await this.http.get<any>(`https://pokeapi.co/api/v2/type/${pokemonData.types[0].type.name}`).toPromise();
      const weaknesses = typeData.damage_relations.double_damage_from.map((type: any) => type.name);
      pokemonData.weaknesses = weaknesses;

      // Obtiene la descripción en español del Pokémon
      const esDescriptions = speciesData.flavor_text_entries.filter((entry: any) => entry.language.name === 'es');
      const lastEsDescription = esDescriptions.slice(-1)[0];

      // Asigna la descripción en español al objeto `pokemonData`
      if (lastEsDescription) {
        pokemonData.description = lastEsDescription.flavor_text;
      }

      // Obtiene información detallada sobre los movimientos del Pokémon
      const movesData = await this.http.get<any>(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`).toPromise();
      const moveUrls = movesData.moves.map((move: any) => move.move.url);

      // Realiza llamadas para obtener detalles de los movimientos
      const moveDetailsPromises = moveUrls.map((moveUrl: string) => this.http.get<any>(moveUrl).toPromise());
      const moveDetails = await Promise.all(moveDetailsPromises);

      // Formatea la información de los movimientos
      const formattedMoves = moveDetails.map((moveDetail: any) => {
        return {
          name: moveDetail.name,
          power: moveDetail.power,
          type: moveDetail.type.name,
        };
      });

      // Obtiene la categoría de daño de los movimientos
      const moveCategoryPromises = formattedMoves.map((move: any) => this.http.get<any>(`https://pokeapi.co/api/v2/move/${move.name}`).toPromise());
      const categoryData = await Promise.all(moveCategoryPromises);

      // Asigna la categoría de daño a los movimientos
      formattedMoves.forEach((move: any, index: number) => {
        move.category = categoryData[index].damage_class.name;
      });

      // Asigna los movimientos formateados al objeto `pokemonData`
      pokemonData.moves = formattedMoves;

      // Asigna `pokemonData` a `pokemonSelected` y emite un evento `pokemonSelected`
      this.selectedPokemon = pokemonData;
      this.pokemonSelected.emit(this.selectedPokemon);

    } catch (error) {
      console.error('Error en la solicitud HTTP:', error);
    }
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
