export interface Viagem {
  id: string; // Conhecimento / Viagem ID
  tipoVeiculo: string;
  rota: string;
  placa: string;
  motorista: string;
  kmRodado: number;
  valorCarga: number;
  qtdDias: number;
  mediaDias: number;
  metaViagem: number;
  supervisao: string;
  qtd: number;
  
  // Spreadsheet integration fields
  filial?: string;
  ano?: string | number;
  mes?: string;
  conhecimento?: string;
  modeloVeiculo?: string;
  metaKm?: number;
  ganhoPerdaKm?: number;
  valorAbastecido?: number;
  litros?: number;
  valorLitro?: number;
  metaKmL?: number;
  kmLRealizado?: number;
  ganhoPerdaLitro?: number;
  ganhoPerdaRS?: number;
  statusMeta?: string;
  despesaOficina?: number;
}

export interface ExecutiveMetrics {
  faturamentoTotal: number;
  totalViagens: number;
  metaGlobal: number;
  percentMetaAtingida: number;
  totalPlacas: number;
  dentroMetaCount: number;
  foraMetaCount: number;
  kmRodadoTotal: number;
  despesaOficinaTotal: number;
}

export interface PlacaMetrics {
  placa: string;
  viagensCount: number;
  faturamentoTotal: number;
  percentMeta: number;
  supervisor?: string;
  motorista?: string;
  kmRodadoTotal?: number;
  conhecimentosCount?: number;
  statusMeta?: string;
  despesaOficinaTotal?: number;
  targetMeta?: number;
  mes?: string;
  ano?: string | number;
}

export interface MotoristaMetrics {
  id: string; // Fake ID or dynamic sequence
  nome: string;
  categoria: string;
  faturamento: number;
  viagensRealizadas: number;
  metaViagens: number;
  percentProgresso: number;
  statusMeta: 'METAS_ATINGIDAS' | 'FORA_DA_META';
}

export interface RouteMetrics {
  rota: string;
  avgDays: number;
  totalTrips: number;
  avgKm: number;
  totalValue: number;
}
