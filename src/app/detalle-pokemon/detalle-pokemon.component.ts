import { Component, Input, SimpleChanges } from '@angular/core';
@Component({
  selector: 'app-detalle-pokemon',
  templateUrl: './detalle-pokemon.component.html',
  styleUrls: ['./detalle-pokemon.component.css']
})
export class DetallePokemonComponent {
  @Input() selectedPokemon: any;
  botonTexto: string = 'Guardar Pokemon';

  currentIndex: number = 0;
  genderSymbol: string = '♂';
  previousGenderSymbol: string = '♂';


  constructor() { }



  ngOnInit(): void {
    this.resetCurrentIndex();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detectar cambios en selectedPokemon y restablecer currentIndex a 0
    if (changes['selectedPokemon'] && !changes['selectedPokemon'].firstChange) {
      this.resetCurrentIndex();

    }
  }

  resetCurrentIndex() {
    this.currentIndex = 0;
    this.checkGender();
  }


  getSpriteKeys(): string[] {
    return this.selectedPokemon ? Object.keys(this.selectedPokemon.sprites) : [];
  }

  isImageUrl(url: string): boolean {
    // verificar si la cadena termina con .png, .jpg, .jpeg, etc.
    if (typeof url === 'string') {
      return url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg');
    }
    return false;
  }

  getValidSpriteKeys(): string[] {
    return this.getSpriteKeys().filter((spriteKey) => {
      return !spriteKey.includes('back') && this.isImageUrl(this.selectedPokemon.sprites[spriteKey]);
    });
  }


  checkGender() {
    const spriteKeys = Object.keys(this.selectedPokemon.sprites);

    // Verifica si el nombre del Pokémon es Nidoran♀ 
    if (this.selectedPokemon.name === 'nidoran-f'
      || this.selectedPokemon.name === 'nidorina'
      || this.selectedPokemon.name === 'nidoqueen'
      || this.selectedPokemon.name === 'happiny'
      || this.selectedPokemon.name === 'chansey'
      || this.selectedPokemon.name === 'blissey'
      || this.selectedPokemon.name === 'kangaskhan'
      || this.selectedPokemon.name === 'smoochum'
      || this.selectedPokemon.name === 'jynx'
      || this.selectedPokemon.name === 'miltank'
      || this.selectedPokemon.name === 'illumise'
      || this.selectedPokemon.name === 'latias') {

      this.genderSymbol = '♀';
      this.previousGenderSymbol = '♀';
      return;
    }

    const hasFemale = spriteKeys.some((key) => key.includes('female') && this.isImageUrl(this.selectedPokemon.sprites[key]));


    if (!hasFemale) {
      this.genderSymbol = '♂♀';
      this.previousGenderSymbol = '♂♀';
    } else {
      this.genderSymbol = '♂';
      this.previousGenderSymbol = '♂';
    }
  }



  // En prevImage y nextImage, llamar a checkGender() después de cambiar la imagen
  prevImage() {
    if (this.currentIndex > 0) {
      const previousSpriteKey = this.getValidSpriteKeys()[this.currentIndex - 1];
      const currentSpriteKey = this.getValidSpriteKeys()[this.currentIndex];

      // Verifica si la imagen actual contiene "female" y asigna el símbolo correspondiente
      this.genderSymbol = previousSpriteKey.includes('female') ? '♀' : this.previousGenderSymbol;

      this.currentIndex--;
    }
  }



  nextImage() {
    const validSpriteKeys = this.getValidSpriteKeys();
    if (this.currentIndex < validSpriteKeys.length - 1) {
      const currentSpriteKey = validSpriteKeys[this.currentIndex + 1];

      // Verifica si la imagen actual contiene "female" y asigna el símbolo correspondiente
      this.genderSymbol = currentSpriteKey.includes('female') ? '♀' : this.previousGenderSymbol;

      this.currentIndex++;
    }
  }
}
