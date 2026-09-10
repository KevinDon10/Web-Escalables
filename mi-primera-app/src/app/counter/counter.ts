import { Component, computed, Signal, signal, WritableSignal} from '@angular/core';

@Component({
  imports: [],
  selector: 'app-counter',
  templateUrl: './counter.html',
  styleUrl: './counter.css',
})
export class Counter {

  count: number = 45;
  countSignal: WritableSignal<number> = signal(45);
  doubleCountSignal: Signal<number> = computed(() => this.countSignal() * 2);

  public nombres: WritableSignal<string[]> = signal(['Maria', 'Juan', 'Pedro', 'Pablo', 'Ana', 'Lucia']);

  public increaseBy(value: number = 1): void {
    this.count += value;

    this.countSignal.update(count => count + value);
  }
}
