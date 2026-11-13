import { Component, input, output } from '@angular/core';
import type { User } from "../../interfaces/user.interface";

@Component({
  selector: 'app-user-card',
  imports: [],
  templateUrl: './user-card.html',
  styleUrl: './user-card.css',
})
export class UserCard {
  // user: WritableSignal<User> = signal({
  //   id: 1,
  //   name: "Juan Lopez", 
  //   username: "LeGra",
  //   email: 'legra@gmail.com',
  //   image: "https://img.magnific.com/foto-gratis/joven-hombre-barbudo-camisa-rayas_273609-5677.jpg?semt=ais_hybrid&w=740&q=80%22"
  // })

  public user = input.required<User>();
  public deleteClick = output<string>();

  delete(): void {
    this.deleteClick.emit(this.user().id);
  }
}
