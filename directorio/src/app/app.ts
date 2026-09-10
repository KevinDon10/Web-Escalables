import { Component, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { User } from './interfaces/user.interface';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('directorio');

  // user: User = {  
  //   id: 1,
  //   name: 'Leanne Graham', 
  //   username: 'LeGra',
  //   email: 'legra@gmail.com',
  //   image: " https://img.magnific.com/foto-gratis/joven-hombre-barbudo-camisa-rayas_273609-5677.jpg?semt=ais_hybrid&w=740&q=80%22"
  // }

  users: WritableSignal<User> = signal([
    {
      id: 1,
      name: 'Leanne Graham', 
      username: 'LeGra',
      email: 'legra@gmail.com',
      image: "https://img.magnific.com/foto-gratis/joven-hombre-barbudo-camisa-rayas_273609-5677.jpg?semt=ais_hybrid&w=740&q=80%22"

    },

    {
      id: 1,
      name: 'Leanne Graham', 
      username: 'LeGra',
      email: 'legra@gmail.com',
      image: "https://img.magnific.com/foto-gratis/joven-hombre-barbudo-camisa-rayas_273609-5677.jpg?semt=ais_hybrid&w=740&q=80%22"

    },

    {
      id: 1,
      name: 'Leanne Graham', 
      username: 'LeGra',
      email: 'legra@gmail.com',
      image: "https://img.magnific.com/foto-gratis/joven-hombre-barbudo-camisa-rayas_273609-5677.jpg?semt=ais_hybrid&w=740&q=80%22"

    },

    {
      id: 1,
      name: 'Leanne Graham', 
      username: 'LeGra',
      email: 'legra@gmail.com',
      image: "https://img.magnific.com/foto-gratis/joven-hombre-barbudo-camisa-rayas_273609-5677.jpg?semt=ais_hybrid&w=740&q=80%22"

    },

    {
      id: 1,
      name: 'Leanne Graham', 
      username: 'LeGra',
      email: 'legra@gmail.com',
      image: "https://img.magnific.com/foto-gratis/joven-hombre-barbudo-camisa-rayas_273609-5677.jpg?semt=ais_hybrid&w=740&q=80%22"

    }
  ])
}
