#!/usr/bin/env python3
"""
Fixed SQLAlchemy Models - Removed the non-existent pessoa_relacionada field
"""

from datetime import datetime
from database import db

class Veiculo(db.Model):
    """Main vehicle table with all vehicle information"""
    
    __tablename__ = 'veiculos'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # ✅ Fields that exist in your database
    spj = db.Column('spj', db.String(50), index=True)
    natureza = db.Column('natureza', db.String(200))
    procedimento = db.Column('procedimento', db.String(200))
    equipe = db.Column('equipe', db.String(200))
    status = db.Column('status', db.String(50), index=True)
    chave = db.Column('chave', db.String(200))
    tipo = db.Column('tipo', db.String(50), index=True)
    modelo = db.Column('modelo', db.String(200), index=True)
    cor = db.Column('cor', db.String(50))
    chassi = db.Column('chassi', db.String(50), index=True)
    afis = db.Column('afis', db.String(100))
    obs1 = db.Column('obs1', db.Text)
    obs2 = db.Column('obs2', db.Text)
    
    # Portuguese named fields (using exact database column names)
    ano = db.Column('anospj', db.String(50))  # Your database has this as TEXT
    num_procedimento = db.Column('procedimentonumero', db.String(100))
    circunscricao = db.Column('circunscrição', db.String(50), index=True)
    patio = db.Column('pátio', db.String(200), index=True)
    data_apreensao = db.Column('dataapreensão', db.String(50))  # TEXT in database
    ultima_movimentacao = db.Column('datamovimentação', db.String(50))  # TEXT in database
    ano_fabricacao = db.Column('anofabricação', db.String(50))  # TEXT in database
    ano_modelo = db.Column('anomodelo', db.String(50))  # TEXT in database
    placa_original = db.Column('placaverdadeira', db.String(20), index=True)
    placa_ostentada = db.Column('placaostentada', db.String(20), index=True)
    proprietario = db.Column('proprietário', db.String(200))
    pericia = db.Column('perícia', db.String(100))
    protocolo = db.Column('períciaprotocolo', db.String(100))
    status_pericia = db.Column('statusperícia', db.String(100))
    numero_laudo = db.Column('laudo', db.String(100))
    resultado_laudo = db.Column('statuslaudo', db.String(200))
    
    # ❌ REMOVED: pessoa_relacionada - this field doesn't exist in your database!
    # pessoa_relacionada = db.Column('pessoa_relacionada', db.String(200))  # This was causing the issue
    
    def __repr__(self):
        return f'<Veiculo {self.spj} - {self.placa_original}>'
    
    def to_dict(self, include_relations=False):
        """Convert vehicle object to dictionary for JSON serialization"""
        
        return {
            'id': self.id,
            'spj': self.spj or '',
            'ano': self.ano or '',
            'natureza': self.natureza or '',
            'procedimento': self.procedimento or '',
            'equipe': self.equipe or '',
            'num_procedimento': self.num_procedimento or '',
            'status': self.status or '',
            'status_class': self.status.lower().replace(' ', '_') if self.status else '',
            'chave': self.chave or '',
            'circunscricao': self.circunscricao or '',
            'patio': self.patio or '',
            'data_apreensao': self.data_apreensao or '',
            'ultima_movimentacao': self.ultima_movimentacao or '',
            'tipo': self.tipo or '',
            'modelo': self.modelo or '',
            'cor': self.cor or '',
            'ano_fabricacao': self.ano_fabricacao or '',
            'ano_modelo': self.ano_modelo or '',
            'placa_original': self.placa_original or '',
            'placa_ostentada': self.placa_ostentada or '',
            'chassi': self.chassi or '',
            'proprietario': self.proprietario or '',
            'pessoa_relacionada': '',  # Return empty string since field doesn't exist
            'pericia': self.pericia or '',
            'protocolo': self.protocolo or '',
            'status_pericia': self.status_pericia or '',
            'numero_laudo': self.numero_laudo or '',
            'resultado_laudo': self.resultado_laudo or '',
            'afis': self.afis or '',
            'obs1': self.obs1 or '',
            'obs2': self.obs2 or ''
        }

class Ocorrencia(db.Model):
    __tablename__ = 'ocorrencia'
    
    id = db.Column(db.Integer, primary_key=True)
    veiculo_id = db.Column(db.Integer, db.ForeignKey('veiculos.id'))
    data_ocorrencia = db.Column(db.DateTime, default=datetime.utcnow)
    tipo_ocorrencia = db.Column(db.String(100))
    descricao = db.Column(db.Text)

class HistoricoMovimentacao(db.Model):
    __tablename__ = 'historico_movimentacao'
    
    id = db.Column(db.Integer, primary_key=True)
    veiculo_id = db.Column(db.Integer, db.ForeignKey('veiculos.id'))
    data_movimentacao = db.Column(db.DateTime, default=datetime.utcnow)
    tipo_movimentacao = db.Column(db.String(100))
    origem = db.Column(db.String(200))
    destino = db.Column(db.String(200))

def create_sample_data():
    """Skip sample data - using real data"""
    pass

if __name__ == "__main__":
    print("Fixed SQLAlchemy models - removed non-existent pessoa_relacionada field")