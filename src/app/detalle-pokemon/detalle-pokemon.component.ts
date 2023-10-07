import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-detalle-pokemon',
  templateUrl: './detalle-pokemon.component.html',
  styleUrls: ['./detalle-pokemon.component.css']
})
export class DetallePokemonComponent {
  @Input() selectedPokemon: any;

  constructor() { }
}
