import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dateDay', standalone: true })
export class DateDayPipe implements PipeTransform {
  transform(value: string): string {
    return new Date(`${value}T12:00:00`).toLocaleDateString('es-MX', { day: '2-digit' });
  }
}

@Pipe({ name: 'dateMonth', standalone: true })
export class DateMonthPipe implements PipeTransform {
  transform(value: string): string {
    return new Date(`${value}T12:00:00`).toLocaleDateString('es-MX', { month: 'short' }).replace('.', '').toUpperCase();
  }
}
