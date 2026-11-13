import { Component, input } from '@angular/core';
import type { Nota } from '../../interfaces/nota.interface';

@Component({
  selector: 'app-nota-card',
  templateUrl: './nota-card.html',
  styleUrl: './nota-card.css',
})
export class NotaCard {
  nota = input.required<Nota>();
}
