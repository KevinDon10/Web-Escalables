import {computed, inject, Injectable, signal, WritableSignal} from "@angular/core";
import type {NewUser, User} from '../interfaces/user.interface';
import {HttpClient} from "@angular/common/http";
import {map, tap, type Observable} from "rxjs";

@Injectable({providedIn: 'root'})

export class UserService {

    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/persons';
    private _users: WritableSignal<User[]> = signal([]);
    public users = this._users.asReadonly();

    private toUser(person: ApiPerson): User {
        const {_id, ...user} = person;
        return {...user, id: _id};
    }

    fetchUsers(): void 
    {
        this.http.get<ApiPerson[]>(this.apiUrl).subscribe(
        {
            next: (response: ApiPerson[]) => 
            {
                this._users.set(response.map(person => this.toUser(person)));
            },
            error: (error) => 
            {
                console.error(error);
            },

        })
    }

    private searchValue = signal('');

    filteredUsers = computed(() =>
    this.users().filter(user =>
      user.name.toLowerCase().includes(this.searchValue())
    )
  );

    orderById(): void
    {
        this._users.update(users => [...users].sort((a, b) => a.id.localeCompare(b.id)));
    }

    orderByName(): void
    {
        this._users.update(users => [...users].sort((a, b) => a.name.localeCompare(b.name)));
    }

    reverse(): void
    {
        this._users.update(users => [...users].reverse());
    }

    deleteUser(id: string): Observable<void>
    {
        return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(id)}`).pipe(
            tap(() => this._users.update(users => users.filter(user => user.id !== id)))
        );
    }


    search(value: string): void
    {
         this.searchValue.set(value.trim().toLowerCase());
    }

    addUser(newUser: NewUser): Observable<User>
    {
        return this.http.post<CreatePersonResponse>(this.apiUrl, newUser).pipe(
            map(response => this.toUser(response.data)),
            tap(user => this._users.update(users => [...users, user]))
        );
    }

}

interface ApiPerson {
    _id: string;
    name: string;
    username: string;
    email: string;
    image: string;
}

interface CreatePersonResponse {
    ok: boolean;
    msg: string;
    data: ApiPerson;
}
