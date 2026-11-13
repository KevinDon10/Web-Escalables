import { Component, computed, signal, WritableSignal } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkWithHref, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  

}
