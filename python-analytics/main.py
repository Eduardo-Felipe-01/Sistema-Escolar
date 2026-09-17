from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from services.analytics import analisar_dados_turma

app = FastAPI(
    title="Sistema Escolar - Módulo Python de Análise de Dados",
    version="1.0.0",
    description="Microserviço em Python para processamento de estatísticas pedagógicas, médias e predição de risco"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AlunoData(BaseModel):
    matriculaId: Optional[int] = None
    alunoId: Optional[int] = None
    nome: str
    numeroChamada: Optional[int] = None
    media: float
    frequencia: float
    statusMatricula: Optional[str] = None

class TurmaEstatisticasRequest(BaseModel):
    turmaId: Optional[int] = None
    turmaNome: Optional[str] = "Turma"
    disciplinaNome: Optional[str] = "Disciplina"
    alunos: List[AlunoData]

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "Python Analytics Service",
        "version": "1.0.0"
    }

@app.post("/api/analytics/turma-estatisticas")
def calcular_estatisticas_turma(req: TurmaEstatisticasRequest):
    alunos_dict = [a.model_dump() for a in req.alunos]
    analise = analisar_dados_turma(alunos_dict)
    return {
        "turmaNome": req.turmaNome,
        "disciplinaNome": req.disciplinaNome,
        "analise": analise
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
