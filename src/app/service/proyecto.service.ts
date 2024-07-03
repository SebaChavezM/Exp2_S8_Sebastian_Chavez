import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface Proyecto {
  tipo: string;
  numero: string;
  nombre: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProyectosService {
  private proyectosSubject = new BehaviorSubject<Proyecto[]>([]);
  proyectos$ = this.proyectosSubject.asObservable();

  constructor() {
    this.loadProyectos();
  }

  loadProyectos(): void {
    const proyectos = localStorage.getItem('proyectos');
    if (proyectos) {
      this.proyectosSubject.next(JSON.parse(proyectos));
    } else {
      this.proyectosSubject.next([]);
    }
  }

  saveProyectos(proyectos: Proyecto[]): void {
    localStorage.setItem('proyectos', JSON.stringify(proyectos));
    this.proyectosSubject.next(proyectos);
  }

  addProyecto(proyecto: Proyecto): void {
    const proyectos = this.proyectosSubject.getValue();
    proyectos.push(proyecto);
    this.saveProyectos(proyectos);
  }

  deleteProyecto(proyecto: Proyecto): void {
    const proyectos = this.proyectosSubject.getValue().filter(p => p !== proyecto);
    this.saveProyectos(proyectos);
  }

  updateProyecto(proyecto: Proyecto): void {
    const proyectos = this.proyectosSubject.getValue().map(p => p.numero === proyecto.numero ? proyecto : p);
    this.saveProyectos(proyectos);
  }
}
