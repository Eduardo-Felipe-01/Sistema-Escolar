import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login.component';
import { ProfessorLayoutComponent } from './modules/professor/professor-layout.component';
import { DashboardComponent } from './modules/professor/dashboard/dashboard.component';
import { NotasComponent } from './modules/professor/notas/notas.component';
import { FrequenciaComponent } from './modules/professor/frequencia/frequencia.component';
import { RelatoriosComponent } from './modules/professor/relatorios/relatorios.component';
import { AlunoViewComponent } from './modules/aluno/aluno-view.component';
import { CoordenadorViewComponent } from './modules/coordenador/coordenador-view.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'professor',
    component: ProfessorLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'notas', component: NotasComponent },
      { path: 'frequencia', component: FrequenciaComponent },
      { path: 'relatorios', component: RelatoriosComponent }
    ]
  },
  {
    path: 'aluno',
    component: AlunoViewComponent,
    canActivate: [authGuard]
  },
  {
    path: 'coordenador',
    component: CoordenadorViewComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' }
];
