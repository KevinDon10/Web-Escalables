import { Component, output } from '@angular/core';
import {FormControl, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-controls',
  imports: [ReactiveFormsModule],
  templateUrl: './controls.html',
  styleUrl: './controls.css',
})
export class Controls {

  orderById= output<void>();
  orderByName = output<void>();
  reverse = output<void>();
  search = output<string>();

  searchControl = new FormControl('');
  
  onSearch(): void {
    this.search.emit(this.searchControl.value ?? '');
  }

  onOrderByIdClick(): void {
    this.orderById.emit();
  }

  onOrderByNameClick(): void {
    this.orderByName.emit();
  }

  onReverseClick(): void {
    this.reverse.emit();
  } 

}
