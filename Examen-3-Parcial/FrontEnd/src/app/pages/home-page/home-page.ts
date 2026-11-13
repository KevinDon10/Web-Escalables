import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotaService } from '../../service/nota-service';
import { NotaCard } from '../../components/nota-card/nota-card';

@Component({
  selector: 'app-home-page',
  imports: [ReactiveFormsModule, NotaCard],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  private notaService = inject(NotaService);
  public notas = this.notaService.notas;
  public cargando = this.notaService.cargando;
  public errorCarga = this.notaService.error;
  public guardando = signal(false);
  public errorGuardar = signal('');

  notaForm = new FormGroup({
    titulo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    contenido: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
  });

  ngOnInit(): void {
    this.notaService.cargarNotas();
  }

  guardar(): void {
    if (this.notaForm.invalid || this.guardando() || this.cargando() || this.errorCarga()) {
      this.notaForm.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.errorGuardar.set('');
    const { titulo, contenido } = this.notaForm.getRawValue();
    this.notaService.agregarNota({ titulo: titulo.trim(), contenido: contenido.trim() }).subscribe({
      next: () => {
        this.notaForm.reset();
        this.guardando.set(false);
      },
      error: () => {
        this.errorGuardar.set('No se pudo guardar la nota. Inténtalo de nuevo.');
        this.guardando.set(false);
      },
    });
  }

  reintentar(): void {
    this.notaService.cargarNotas();
  }
}
