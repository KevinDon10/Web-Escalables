import { Component, inject, OnInit } from '@angular/core';
import { UserCard } from '../../components/user-card/user-card';
import { Controls } from '../../components/controls/controls';
import { UserService } from '../../service/user-service';

@Component({
  selector: 'app-home-page',
  imports: [UserCard, Controls],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  private userService = inject(UserService);
  public users = this.userService.filteredUsers;

  ngOnInit(): void {
    this.userService.fetchUsers();
  }

  public orderByName(): void {
    this.userService.orderByName();
  }

  public orderById(): void {
    this.userService.orderById();
  }

  public reverse(): void {
    this.userService.reverse();
  }

  public search(value: string): void {
    this.userService.search(value);
  }

  public deleteUser(id: string): void {
    this.userService.deleteUser(id).subscribe({
      error: (error) => console.error('Error al eliminar el usuario', error),
    });
  }
}