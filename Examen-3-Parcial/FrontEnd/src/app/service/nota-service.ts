import { inject, Injectable, signal, type WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, type Observable } from 'rxjs';
import type { Nota, NuevaNota } from '../interfaces/nota.interface';

@Injectable({ providedIn: 'root' })
export class NotaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/notas';
  private _notas: WritableSignal<Nota[]> = signal([]);
  public notas = this._notas.asReadonly();
  public cargando = signal(false);
  public error = signal('');

  cargarNotas(): void {
    this.cargando.set(true);
    this.error.set('');

    this.http.get<Nota[]>(this.apiUrl).subscribe({
      next: (notas) => {
        this._notas.set(notas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las notas. Verifica que el servidor esté encendido.');
        this.cargando.set(false);
      },
    });
  }

  agregarNota(nuevaNota: NuevaNota): Observable<Nota> {
    return this.http.post<CreateNotaResponse>(this.apiUrl, nuevaNota).pipe(
      map((response) => response.data),
      tap((nota) => this._notas.update((notas) => [...notas, nota])),
    );
  }
}

interface CreateNotaResponse {
  ok: boolean;
  msg: string;
  data: Nota;
}
