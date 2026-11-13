import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { TurmaResumo, NotaAluno, FrequenciaAluno } from '../models/user.model';

import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ProfessorService {
  private apiUrl = `${API_BASE_URL}/api/professor`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getTurmas(): Observable<TurmaResumo[]> {
    return this.http.get<TurmaResumo[]>(`${this.apiUrl}/turmas`, { headers: this.getHeaders() });
  }

  getNotas(turmaId: number, disciplinaId: number, bimestre: number): Observable<NotaAluno[]> {
    return this.http.get<NotaAluno[]>(
      `${this.apiUrl}/turmas/${turmaId}/disciplinas/${disciplinaId}/bimestres/${bimestre}/notas`,
      { headers: this.getHeaders() }
    );
  }

  salvarNota(nota: any): Observable<NotaAluno> {
    return this.http.post<NotaAluno>(`${this.apiUrl}/notas`, nota, { headers: this.getHeaders() });
  }

  getResumoFrequencia(turmaId: number, disciplinaId: number): Observable<FrequenciaAluno[]> {
    return this.http.get<FrequenciaAluno[]>(
      `${this.apiUrl}/turmas/${turmaId}/disciplinas/${disciplinaId}/frequencia-resumo`,
      { headers: this.getHeaders() }
    );
  }

  getFrequenciaDia(turmaId: number, disciplinaId: number, data: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/turmas/${turmaId}/disciplinas/${disciplinaId}/frequencia-dia?data=${data}`,
      { headers: this.getHeaders() }
    );
  }

  salvarFrequencias(dados: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/frequencias`, dados, { headers: this.getHeaders() });
  }

  getRelatorio(turmaId: number, disciplinaId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/turmas/${turmaId}/disciplinas/${disciplinaId}/relatorio`,
      { headers: this.getHeaders() }
    );
  }
}
