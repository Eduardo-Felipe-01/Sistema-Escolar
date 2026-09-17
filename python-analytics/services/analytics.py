import pandas as pd
import numpy as np
from typing import List, Dict, Any

def analisar_dados_turma(alunos: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not alunos:
        return {
            "total_alunos": 0,
            "media_geral": 0.0,
            "mediana": 0.0,
            "desvio_padrao": 0.0,
            "nota_maxima": 0.0,
            "nota_minima": 0.0,
            "taxa_aprovacao": 0.0,
            "distribuicao": {"aprovados": 0, "recuperacao": 0, "reprovados": 0},
            "alunos_em_risco": [],
            "recomendacoes": ["Nenhum aluno cadastrado para análise."]
        }

    df = pd.DataFrame(alunos)
    
    # Tratamento de valores nulos
    df["media"] = pd.to_numeric(df.get("media", 0), errors="coerce").fillna(0.0)
    df["frequencia"] = pd.to_numeric(df.get("frequencia", 100.0), errors="coerce").fillna(100.0)

    total_alunos = int(len(df))
    media_geral = float(round(df["media"].mean(), 2))
    mediana = float(round(df["media"].median(), 2))
    desvio_padrao = float(round(df["media"].std(ddof=0), 2)) if total_alunos > 1 else 0.0
    nota_maxima = float(round(df["media"].max(), 2))
    nota_minima = float(round(df["media"].min(), 2))

    # Classificações
    aprovados = int((df["media"] >= 6.0).sum())
    recuperacao = int(((df["media"] >= 4.0) & (df["media"] < 6.0)).sum())
    reprovados = int((df["media"] < 4.0).sum())
    taxa_aprovacao = float(round((aprovados / total_alunos) * 100.0, 1))

    # Identificação de alunos em risco (Média < 6.0 OU Frequência < 75.0%)
    mask_risco = (df["media"] < 6.0) | (df["frequencia"] < 75.0)
    df_risco = df[mask_risco]

    alunos_em_risco = []
    for _, row in df_risco.iterrows():
        motivos = []
        if row["media"] < 6.0:
            motivos.append(f"Média baixa ({row['media']:.1f})")
        if row["frequencia"] < 75.0:
            motivos.append(f"Infrequência crítica ({row['frequencia']:.1f}%)")

        alunos_em_risco.append({
            "nome": str(row.get("nome", "Aluno")),
            "media": float(row["media"]),
            "frequencia": float(row["frequencia"]),
            "motivo_risco": ", ".join(motivos),
            "nivel_alerta": "CRITICO" if row["frequencia"] < 75.0 or row["media"] < 4.0 else "ATENCAO"
        })

    # Recomendações pedagógicas automatizadas
    recomendacoes = []
    if taxa_aprovacao >= 80.0:
        recomendacoes.append("Excelente rendimento geral da turma. Recomenda-se avançar com conteúdos de aprofundamento.")
    elif taxa_aprovacao >= 60.0:
        recomendacoes.append("Rendimento intermediário. Recomenda-se reforço prévio às avaliações bimestrais.")
    else:
        recomendacoes.append("Atenção urgente: mais de 40% da turma abaixo da média de aprovação.")

    if desvio_padrao > 2.0:
        recomendacoes.append("Alto desvio padrão detectado: grande disparidade entre alunos avançados e com dificuldades. Aplicar metodologias de tutoria entre pares.")

    if any(row["frequencia"] < 75.0 for _, row in df.iterrows()):
        recomendacoes.append("Existem alunos com frequência abaixo de 75%. Acionar a coordenação para contato imediato com os responsáveis.")

    return {
        "total_alunos": total_alunos,
        "media_geral": media_geral,
        "mediana": mediana,
        "desvio_padrao": desvio_padrao,
        "nota_maxima": nota_maxima,
        "nota_minima": nota_minima,
        "taxa_aprovacao": taxa_aprovacao,
        "distribuicao": {
            "aprovados": aprovados,
            "recuperacao": recuperacao,
            "reprovados": reprovados
        },
        "alunos_em_risco": alunos_em_risco,
        "recomendacoes": recomendacoes
    }
