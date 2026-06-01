'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  FileSpreadsheet,
  Headphones,
  Settings,
  LogOut,
  Search,
  Upload,
  Bell,
  TrendingUp,
  Award,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  ChevronRight,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  MapPin,
  Download,
  Percent,
  TrendingDown,
  Menu,
  X,
  Trash2,
  User,
  UserCheck,
  Wrench
} from 'lucide-react';

import { Viagem, PlacaMetrics } from '@/lib/types';
import {
  INITIAL_VIAGENS,
  computeExecutiveMetrics,
  computePlacaMetrics,
  computeMotoristaMetrics,
  computeRouteMetrics,
  getDriverAvatar
} from '@/lib/data';
import ImportModal from '@/components/ImportModal';
import MultiSelectDropdown from '@/components/MultiSelectDropdown';
import { saveViagensToDB, getViagensFromDB, clearViagensFromDB } from '@/lib/db';
import {
  fetchViagensFromFirestore,
  saveViagensToFirestore,
  fetchLastUpdateMetadata,
  resetViagensInFirestore,
  MetadataLastUpdate
} from '@/lib/firebaseService';
import { auth } from '@/lib/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { Shield, Info, Lock } from 'lucide-react';

const PlateTooltip = ({ plateData, children }: { plateData: PlacaMetrics; children: React.ReactNode }) => {
  if (!plateData) return <>{children}</>;
  const faturamentoBruto = plateData.faturamentoTotal;
  const despesaOficina = plateData.despesaOficinaTotal || 0;
  const faturamentoLiquido = faturamentoBruto - despesaOficina;

  return (
    <div className="relative group inline-block cursor-help">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 w-[315px] bg-[#0b1c30]/95 backdrop-blur-md text-white rounded-xl p-4 shadow-2xl border border-white/10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 scale-95 group-hover:scale-100 z-50 text-left font-sans normal-case select-none">
        <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
          <span className="text-xs font-black tracking-wider bg-[#004ac6] px-2 py-0.5 rounded text-white font-mono">{plateData.placa}</span>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
            plateData.viagensCount >= 4 ? 'bg-[#6cf8bb]/15 text-[#6cf8bb]' : 'bg-red-500/15 text-red-300'
          }`}>
            {plateData.viagensCount >= 4 ? '🟢 DENTRO DA META' : '🔴 FORA DA META'}
          </span>
        </div>
        <div className="space-y-1.5 text-[11px] font-bold">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Supervisor:</span>
            <span className="text-white truncate max-w-[150px] uppercase text-right">{plateData.supervisor || 'Sem Supervisor'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Motorista Principal:</span>
            <span className="text-white truncate max-w-[150px] uppercase text-right">{plateData.motorista || 'Sem Motorista'}</span>
          </div>
          <div className="flex justify-between border-t border-white/5 pt-1.5">
            <span className="text-slate-400">Quantidade de Viagens:</span>
            <span className="text-white">{plateData.viagensCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Percentual da Meta:</span>
            <span className="text-white">{plateData.percentMeta}%</span>
          </div>
          <div className="flex justify-between border-t border-white/5 pt-1.5">
            <span className="text-slate-400 font-semibold">Faturamento Bruto:</span>
            <span className="text-blue-400 font-black">R$ {faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-semibold">Despesa Oficina:</span>
            <span className="text-red-400 font-black">R$ {despesaOficina.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300 font-black">Faturamento Líquido:</span>
            <span className="text-[#6cf8bb] font-black">R$ {faturamentoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between border-t border-white/5 pt-1.5">
            <span className="text-slate-400">Km Rodado Total:</span>
            <span className="text-white">{plateData.kmRodadoTotal?.toLocaleString('pt-BR') || '0'} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Quantidade de Conhecimentos:</span>
            <span className="text-white">{plateData.conhecimentosCount || 0}</span>
          </div>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#0b1c30]/95" />
      </div>
    </div>
  );
};

const SupervisorTooltip = ({ supData, children }: { supData: any; children: React.ReactNode }) => {
  if (!supData) return <>{children}</>;
  return (
    <div className="relative group inline-block cursor-help">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 w-[320px] bg-[#0b1c30]/95 backdrop-blur-md text-white rounded-xl p-4 shadow-2xl border border-white/10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 scale-95 group-hover:scale-100 z-50 text-left font-sans normal-case select-none">
        <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
          <span className="text-xs font-black tracking-wider bg-[#004ac6] px-2 py-0.5 rounded text-white font-mono uppercase truncate max-w-[170px]">{supData.supervisor}</span>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
            supData.metaAtingidaPercent >= 100 ? 'bg-[#6cf8bb]/15 text-[#6cf8bb]' : 'bg-red-500/15 text-red-300'
          }`}>
            {supData.metaAtingidaPercent >= 100 ? '🟢 META GLOBAL OK' : '🔴 FORA DA META GLOBAL'}
          </span>
        </div>
        <div className="space-y-1.5 text-[11px] font-bold">
          <div className="flex justify-between">
            <span className="text-slate-400">Supervisor:</span>
            <span className="text-white uppercase truncate max-w-[150px] text-right font-black">{supData.supervisor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Veículos:</span>
            <span className="text-white">{supData.qtdVeiculos}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Viagens:</span>
            <span className="text-white">{supData.qtdViagens}</span>
          </div>
          <div className="flex justify-between border-t border-white/5 pt-1.5">
            <span className="text-slate-400">Placas Dentro da Meta:</span>
            <span className="text-[#6cf8bb]">{supData.placasDentroMeta}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Placas Fora da Meta:</span>
            <span className="text-rose-300">{supData.placasForaMeta}</span>
          </div>
          <div className="flex justify-between border-t border-white/5 pt-1.5">
            <span className="text-slate-400 font-semibold">Meta:</span>
            <span className="text-white font-black">{supData.metaAtingidaPercent}%</span>
          </div>
          <div className="flex justify-between border-t border-white/5 pt-1.5">
            <span className="text-slate-400 font-semibold">Faturamento Bruto:</span>
            <span className="text-blue-400 font-black">R$ {supData.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-semibold">Despesa Oficina:</span>
            <span className="text-red-400 font-black">R$ {supData.despesaOficina.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between border-t border-white/5 pt-1.5">
            <span className="text-slate-300 font-black">Faturamento Líquido:</span>
            <span className="text-[#6cf8bb] font-black">R$ {supData.faturamentoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#0b1c30]/95" />
      </div>
    </div>
  );
};

const DespesaCardTooltip = ({ stats, children }: { stats: any; children: React.ReactNode }) => {
  if (!stats) return <>{children}</>;
  return (
    <div className="relative group cursor-help w-full">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 w-[280px] bg-[#0b1c30]/95 backdrop-blur-md text-white rounded-xl p-4 shadow-2xl border border-white/10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 scale-95 group-hover:scale-100 z-50 text-left font-sans normal-case select-none">
        <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
          <span className="text-xs font-black tracking-wider bg-[#004ac6] px-2 py-0.5 rounded text-white font-mono">DESPESAS OFICINA</span>
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
            ESTATÍSTICAS
          </span>
        </div>
        <div className="space-y-1.5 text-[11px] font-bold">
          <div className="flex justify-between">
            <span className="text-slate-400">Total de Despesas:</span>
            <span className="text-[#6cf8bb] font-black">R$ {stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Quantidade de Registros:</span>
            <span className="text-white">{stats.count}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Valor Médio:</span>
            <span className="text-white">R$ {stats.avg.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Maior Despesa:</span>
            <span className="text-[#6cf8bb]">R$ {stats.max.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Menor Despesa:</span>
            <span className="text-[#ab0b1c] bg-[#ffdad6]/20 px-1 rounded">R$ {stats.min.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#0b1c30]/95" />
      </div>
    </div>
  );
};

const mapMes = (mes?: string): string => {
  const m = String(mes || 'Maio').toLowerCase();
  if (m.includes('jan')) return '01';
  if (m.includes('fev')) return '02';
  if (m.includes('mar')) return '03';
  if (m.includes('abr')) return '04';
  if (m.includes('mai')) return '05';
  if (m.includes('jun')) return '06';
  if (m.includes('jul')) return '07';
  if (m.includes('ago')) return '08';
  if (m.includes('set')) return '09';
  if (m.includes('out')) return '10';
  if (m.includes('nov')) return '11';
  if (m.includes('dez')) return '12';
  return '05';
};

interface DriverDetailModalProps {
  driverName: string | null;
  activeViagens: Viagem[];
  onClose: () => void;
  triggerToast: (msg: string) => void;
}

const DriverDetailModal = ({ driverName, activeViagens, onClose, triggerToast }: DriverDetailModalProps) => {
  const [modalTab, setModalTab] = React.useState<'viagens' | 'rotas'>('viagens');
  
  const driverViagens = React.useMemo(() => {
    if (!driverName) return [];
    return activeViagens.filter(v => v.motorista.trim().toLowerCase() === driverName.trim().toLowerCase());
  }, [driverName, activeViagens]);

  const stats = React.useMemo(() => {
    if (driverViagens.length === 0) {
      return {
        tripsCount: 0,
        uniqueRoutes: 0,
        totalKm: 0,
        faturamentoBruto: 0,
        despesaOficina: 0,
        faturamentoLiquido: 0,
        percentMeta: 0,
        metaText: "0 / 4 viagens",
        isMetaAtingida: false,
      };
    }

    const tripsCount = driverViagens.length;
    const uniqueRoutes = new Set(driverViagens.map(v => v.rota)).size;
    const totalKm = driverViagens.reduce((sum, v) => sum + (v.kmRodado || 0), 0);
    const faturamentoBruto = driverViagens.reduce((sum, v) => sum + (v.valorCarga || 0), 0);
    const despesaOficina = driverViagens.reduce((sum, v) => sum + (v.despesaOficina || 0), 0);
    const faturamentoLiquido = faturamentoBruto - despesaOficina;
    const target = 4;
    const percentMeta = Math.round((tripsCount / target) * 100);
    const metaText = `${tripsCount} / ${target} viagens`;
    const isMetaAtingida = tripsCount >= target;

    return {
      tripsCount,
      uniqueRoutes,
      totalKm,
      faturamentoBruto,
      despesaOficina,
      faturamentoLiquido,
      percentMeta,
      metaText,
      isMetaAtingida
    };
  }, [driverViagens]);

  const topRotas = React.useMemo(() => {
    const groups: Record<string, { rota: string; viagens: number; faturamento: number; km: number }> = {};
    driverViagens.forEach(v => {
      if (!groups[v.rota]) {
        groups[v.rota] = { rota: v.rota, viagens: 0, faturamento: 0, km: 0 };
      }
      groups[v.rota].viagens += 1;
      groups[v.rota].faturamento += v.valorCarga || 0;
      groups[v.rota].km += v.kmRodado || 0;
    });
    return Object.values(groups).sort((a, b) => b.viagens - a.viagens || b.faturamento - a.faturamento);
  }, [driverViagens]);

  const routesConsolidadas = React.useMemo(() => {
    const groups: Record<string, { rota: string; trips: number; faturamento: number; km: number; viagens: Viagem[] }> = {};
    driverViagens.forEach(v => {
      if (!groups[v.rota]) {
        groups[v.rota] = { rota: v.rota, trips: 0, faturamento: 0, km: 0, viagens: [] };
      }
      groups[v.rota].trips += 1;
      groups[v.rota].faturamento += v.valorCarga || 0;
      groups[v.rota].km += v.kmRodado || 0;
      groups[v.rota].viagens.push(v);
    });
    return Object.values(groups).sort((a, b) => b.trips - a.trips || b.faturamento - a.faturamento);
  }, [driverViagens]);

  if (!driverName) return null;

  const handleExportExcel = () => {
    const headers = "Conhecimento;Data;Rota;Placa;Km Rodado;Faturamento;Despesa Oficina\n";
    const rows = driverViagens.map(v => {
      const dataStr = `01/${mapMes(v.mes)}/${v.ano || 2026}`;
      const faturamentoStr = (v.valorCarga || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, useGrouping: false });
      const despesaStr = (v.despesaOficina || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, useGrouping: false });
      return `${v.id};${dataStr};${v.rota};${v.placa};${v.kmRodado || 0};${faturamentoStr};${despesaStr}`;
    }).join("\n");

    const blob = new Blob(["\uFEFF" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Historico_${driverName.replace(/\s+/g, '_')}_Excel_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`✅ Histórico em Excel exportado para o motorista ${driverName}!`);
  };

  const handleExportPDF = () => {
    const dataHtml = driverViagens.map(v => {
      const dataStrStr = `01/${mapMes(v.mes)}/${v.ano || 2026}`;
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${v.id}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${dataStrStr}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${v.rota}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${v.placa}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${v.kmRodado || 0} km</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #004ac6; font-weight: bold;">R$ ${(v.valorCarga || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #dc2626;">R$ ${(v.despesaOficina || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Relatório - ${driverName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 40px; }
          .header { border-bottom: 3px solid #004ac6; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; }
          .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
          .grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
          .card-label { font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; }
          .card-value { font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { text-align: left; padding: 10px; background-color: #f1f5f9; color: #475569; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
          @media print {
            body { margin: 20px; }
            .card { background: #fff !important; }
          }
        </style>
      </head>
      <body onload="window.print()">
        <div class="header">
          <div class="title">RELATÓRIO DE DESEMPENHO INDIVIDUAL</div>
          <div class="subtitle">Grupo Mateus - Transp. Externo Dashboard • Dados gerados em ${new Date().toLocaleDateString('pt-BR')}</div>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h2 style="margin: 0; color: #004ac6;">Motorista: ${driverName}</h2>
          <p style="margin: 5px 0 0 0; color: #475569;">Categoria: ${driverViagens[0]?.tipoVeiculo || 'Profissional'}</p>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-label">Quantidade de Viagens</div>
            <div class="card-value">${stats.tripsCount}</div>
          </div>
          <div class="card">
            <div class="card-label">KM Rodado Total</div>
            <div class="card-value">${stats.totalKm.toLocaleString('pt-BR')} km</div>
          </div>
          <div class="card">
            <div class="card-label">Faturamento Bruto</div>
            <div class="card-value" style="color: #004ac6;">R$ ${stats.faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="card">
            <div class="card-label">Faturamento Líquido</div>
            <div class="card-value" style="color: #10b981;">R$ ${stats.faturamentoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Conhecimento</th>
              <th>Data</th>
              <th>Rota</th>
              <th>Placa</th>
              <th>Km Rodado</th>
              <th style="padding: 10px; background-color: #f1f5f9; color: #475569; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; text-align: right;">Faturamento</th>
              <th style="padding: 10px; background-color: #f1f5f9; color: #475569; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; text-align: right;">Oficina</th>
            </tr>
          </thead>
          <tbody>
            ${dataHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Historico_${driverName.replace(/\s+/g, '_')}_PDF_${Date.now()}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`✅ Histórico formatado para impressão (PDF) gerado para ${driverName}!`);
  };

  return (
    <div 
      className="fixed inset-0 bg-[#0b1c30]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-[#c3c6d7]/30 flex flex-col h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Area */}
        <div className="bg-[#0b1c30] px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-4">
            <img 
              src={getDriverAvatar(driverName)} 
              alt={driverName}
              className="w-12 h-12 rounded-full border-2 border-[#004ac6] object-cover"
            />
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none block">Detalhamento do Motorista</p>
              <h2 className="text-lg font-black text-white mt-1 uppercase leading-tight">{driverName}</h2>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                <span className="text-[9px] font-bold text-gray-400 font-sans uppercase">
                  {driverViagens[0]?.tipoVeiculo || 'Profissional'}
                </span>
                <span className="text-white/20 font-sans">•</span>
                <span className={`text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded font-sans ${
                  stats.isMetaAtingida ? 'bg-[#6cf8bb]/15 text-[#6cf8bb]' : 'bg-[#ffdad6]/15 text-rose-300'
                }`}>
                  {stats.isMetaAtingida ? '🟢 Meta Atingida' : '🔴 Fora da Meta'}
                </span>
                <span className="text-white/20 font-sans">•</span>
                <span className="text-[9px] text-[#eff4ff]/70 font-mono">
                  Placas: {Array.from(new Set(driverViagens.map(v => v.placa))).filter(Boolean).join(', ') || 'Nenhuma'}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Executive Summary Row */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-5 shrink-0 select-none">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {/* KPI 1 */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider block font-sans">Viagens</span>
              <p className="text-base font-black text-[#0b1c30] mt-1.5 font-sans">{stats.tripsCount}</p>
            </div>
            {/* KPI 2 */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider block font-sans">Rotas Distintas</span>
              <p className="text-base font-black text-[#0b1c30] mt-1.5 font-sans">{stats.uniqueRoutes}</p>
            </div>
            {/* KPI 3 */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider block font-sans">KM Rodado Total</span>
              <p className="text-base font-black text-[#0b1c30] mt-1.5 font-sans">{stats.totalKm.toLocaleString('pt-BR')} km</p>
            </div>
            {/* KPI 4 */}
            <div className="bg-white p-3.5 rounded-xl border border-[#004ac6]/15 shadow-xs flex flex-col justify-between hover:border-[#004ac6] transition-colors">
              <span className="text-[9px] text-blue-600 font-bold uppercase tracking-wider block font-sans">Faturamento Bruto</span>
              <p className="text-base font-black text-blue-600 mt-1.5 font-sans">R$ {stats.faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            {/* KPI 5 */}
            <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-xs flex flex-col justify-between hover:border-rose-300 transition-colors">
              <span className="text-[9px] text-rose-600 font-bold uppercase tracking-wider block font-sans">Despesa Oficina</span>
              <p className="text-base font-black text-rose-600 mt-1.5 font-sans font-sans">R$ {stats.despesaOficina.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            {/* KPI 6 */}
            <div className="bg-[#effbf6] p-3.5 rounded-xl border border-emerald-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
              <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider block font-sans">Faturamento Líquido</span>
              <p className="text-lg font-black text-emerald-600 mt-1 font-sans">R$ {stats.faturamentoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            {/* KPI 7 */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider block font-sans">% da Meta</span>
              <p className="text-base font-black text-[#0b1c30] mt-1.5 font-sans">{stats.percentMeta}%</p>
            </div>
            {/* KPI 8 */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider block font-sans">Meta</span>
              <p className="text-base font-black text-[#0b1c30] mt-1.5 font-sans">{stats.metaText}</p>
            </div>
          </div>
        </div>

        {/* Modal Toolbar with Tab Selector & Export Buttons */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setModalTab('viagens')}
              className={`px-4 py-2 text-xs font-black rounded-lg transition-colors uppercase tracking-wider cursor-pointer ${
                modalTab === 'viagens' 
                  ? 'bg-[#0b1c30] text-white' 
                  : 'bg-slate-100 text-[#434655] hover:bg-slate-200'
              }`}
            >
              Histórico de Viagens
            </button>
            <button
              onClick={() => setModalTab('rotas')}
              className={`px-4 py-2 text-xs font-black rounded-lg transition-colors uppercase tracking-wider cursor-pointer ${
                modalTab === 'rotas' 
                  ? 'bg-[#0b1c30] text-white' 
                  : 'bg-slate-100 text-[#434655] hover:bg-slate-200'
              }`}
            >
              Rotas Consolidadas
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-2 shadow-sm transition-colors grow sm:grow-0 justify-center cursor-pointer font-sans"
            >
              <FileSpreadsheet className="w-4 h-4" /> Exportar Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-[#004ac6] hover:bg-opacity-90 text-white px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-2 shadow-sm transition-colors grow sm:grow-0 justify-center cursor-pointer font-sans"
            >
              <Download className="w-4 h-4" /> Exportar PDF
            </button>
          </div>
        </div>

        {/* Split Grid Content Panel */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-4 min-h-0 bg-slate-50/50">
          {/* Main content area (Left span-3) */}
          <div className="lg:col-span-3 overflow-y-auto p-6 border-r border-slate-200 h-full">
            {modalTab === 'viagens' ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-100 text-[10px] uppercase font-black tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Conhecimento</th>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Rota</th>
                      <th className="px-4 py-3">Placa</th>
                      <th className="px-4 py-3 text-right">Km Rodado</th>
                      <th className="px-4 py-3 text-right">Faturamento</th>
                      <th className="px-4 py-3 text-right">Despesa Oficina</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                    {driverViagens.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-slate-500">{v.id}</td>
                        <td className="px-4 py-3 font-sans">{`01/${mapMes(v.mes)}/${v.ano || 2026}`}</td>
                        <td className="px-4 py-3 font-extrabold text-[#0b1c30] font-sans">{v.rota}</td>
                        <td className="px-4 py-3">
                          <span className="bg-[#eff4ff] border border-slate-200 px-2 py-0.5 rounded font-bold text-slate-800 font-sans">
                            {v.placa}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-sans">{v?.kmRodado || 0} km</td>
                        <td className="px-4 py-3 text-right text-blue-600 font-black font-sans">
                          R$ {v.valorCarga.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right text-rose-600 font-black font-sans">
                          R$ {(v.despesaOficina || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-4 font-sans">
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-100 text-[10px] uppercase font-black tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Rota</th>
                        <th className="px-4 py-3 text-center">Quantidade de Viagens</th>
                        <th className="px-4 py-3 text-right">Faturamento</th>
                        <th className="px-4 py-3 text-right">Km Rodado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                      {routesConsolidadas.map((rc, idx) => (
                        <tr 
                          key={idx} 
                          className="hover:bg-slate-50/80 transition-colors relative group cursor-help"
                        >
                          <td className="px-4 py-3.5 font-extrabold text-[#0b1c30] text-sm flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#004ac6]" /> {rc.rota}
                          </td>
                          <td className="px-4 py-3.5 text-center text-sm">{rc.trips}</td>
                          <td className="px-4 py-3.5 text-right font-black text-blue-600 text-sm">
                            R$ {rc.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3.5 text-right text-sm">{rc.km.toLocaleString('pt-BR')} km</td>
                          
                          {/* Tooltip on Route Hover (Hovering detail) */}
                          <td className="absolute inset-0 opacity-0 pointer-events-none" style={{ position: 'absolute' }}>
                            {/* Dummy container */}
                          </td>
                          
                          {/* Tooltip Panel */}
                          <div className="absolute left-1/4 bottom-full mb-2 bg-[#0b1c30]/95 backdrop-blur-md text-white rounded-xl p-4 shadow-2xl border border-white/10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 scale-95 group-hover:scale-100 z-50 text-left font-sans normal-case select-none w-[345px]">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                              <span className="text-xs font-black tracking-wider bg-[#004ac6] px-2 py-0.5 rounded text-white font-mono">DADOS INTEGRADOS ROTA</span>
                              <span className="text-[9px] font-black px-2 py-0.5 rounded bg-[#00714d]/30 text-[#6cf8bb]">
                                {rc.viagens.length} REGISTROS
                              </span>
                            </div>
                            <div className="max-h-[180px] overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                              {rc.viagens.map((v, vIdx) => {
                                const liq = (v.valorCarga || 0) - (v.despesaOficina || 0);
                                return (
                                  <div key={v.id} className={`text-[11px] ${vIdx > 0 ? 'border-t border-white/5 pt-2' : ''}`}>
                                    <div className="flex justify-between font-bold text-gray-400">
                                      <span>Conhecimento:</span>
                                      <span className="text-white font-mono">{v.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400 font-bold">Motorista:</span>
                                      <span className="text-white truncate max-w-[120px] uppercase font-bold">{v.motorista}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Placa:</span>
                                      <span className="text-white font-mono">{v.placa}</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                      <span className="text-gray-400 font-sans">Faturamento:</span>
                                      <span className="text-blue-400 font-sans">R$ {v.valorCarga.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between font-sans">
                                      <span className="text-gray-400">Km Rodado:</span>
                                      <span className="text-white">{v.kmRodado} km</span>
                                    </div>
                                    <div className="flex justify-between text-red-300 font-bold font-sans">
                                      <span>Despesa Oficina:</span>
                                      <span>R$ {(v.despesaOficina || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-[#6cf8bb] font-black font-sans">
                                      <span>Faturamento Líquido:</span>
                                      <span>R$ {liq.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="absolute top-full left-1/3 border-[6px] border-transparent border-t-[#0b1c30]/95" />
                          </div>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Ranking Panel (Right span-1) */}
          <div className="bg-slate-50/50 p-6 overflow-y-auto">
            <h3 className="text-[10px] font-black tracking-widest uppercase text-[#737686] font-sans">Produtividade de Rota</h3>
            <h4 className="text-sm font-black text-[#0b1c30] mt-1 mb-4 font-sans">Top Rotas do Motorista</h4>
            
            <div className="space-y-4">
              {topRotas.map((tr, idx) => (
                <div 
                  key={idx}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#004ac6] transition-all font-sans"
                >
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                    <span className="text-[10px] font-black text-[#004ac6] bg-[#eff4ff] w-5 h-5 rounded-md flex items-center justify-center font-sans">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-black text-[#0b1c30] truncate uppercase font-sans">
                      {tr.rota}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-bold text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-[#737686]">Viagens:</span>
                      <span className="text-[#0b1c30] font-black">{tr.viagens}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#737686]">Km Rodado:</span>
                      <span className="text-[#0b1c30] font-black">{tr.km.toLocaleString('pt-BR')} km</span>
                    </div>
                    <div className="flex justify-between font-sans">
                      <span className="text-[#737686]">Faturamento:</span>
                      <span className="text-[#004ac6] font-black font-sans">R$ {tr.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [viagens, setViagens] = React.useState<Viagem[]>(INITIAL_VIAGENS);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'vehiculos' | 'motoristas' | 'rotas' | 'relatorios' | 'comparativo'>('dashboard');
  const [selectedComparisonKey, setSelectedComparisonKey] = React.useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [logoUrl, setLogoUrl] = React.useState<string>('');
  const [isLogoSettingsOpen, setIsLogoSettingsOpen] = React.useState(false);
  
  // Real-time Cloud Auth and Profile Roles
  const [userProfile, setUserProfile] = React.useState<'Administrador' | 'Leitor'>('Leitor');
  const [currentUser, setCurrentUser] = React.useState<FirebaseUser | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<MetadataLastUpdate | null>(null);
  const [dbLoading, setDbLoading] = React.useState<boolean>(true);
  
  // Custom Filters Required by User (Filial, Ano, Mestre Mês) - using multi-select lists
  const [selectedFiliais, setSelectedFiliais] = React.useState<string[]>([]);
  const [selectedAnos, setSelectedAnos] = React.useState<string[]>([]);
  const [selectedMeses, setSelectedMeses] = React.useState<string[]>([]);
  const [selectedSupervisores, setSelectedSupervisores] = React.useState<string[]>([]);
  const [statusMetaFilter, setStatusMetaFilter] = React.useState<'ALL' | 'DENTRO' | 'FORA'>('ALL');
  
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [selectedDriverName, setSelectedDriverName] = React.useState<string | null>(null);
  const [selectedRouteName, setSelectedRouteName] = React.useState<string | null>(null);

  // Pagination for Trips / Relatórios Table
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 8;

  // Filter values for Relatórios
  const [filterPlaca, setFilterPlaca] = React.useState('');
  const [filterMotorista, setFilterMotorista] = React.useState('ALL');
  const [filterSupervisao, setFilterSupervisao] = React.useState('ALL');



  // Trigger temporary toast announcements
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Setup client mount loading
  React.useEffect(() => {
    // A. Listen to Firebase Authentication state transitions
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        if (user.email === 'andreandersoncarvalhorocha1@gmail.com' && user.emailVerified) {
          setUserProfile('Administrador');
          triggerToast(`🔑 Administrador Autenticado por Google: ${user.email}`);
        } else {
          setUserProfile('Leitor');
          triggerToast(`👤 Conectado por Google (Apenas Leitura): ${user.email}`);
        }
      } else {
        setCurrentUser(null);
        // Do not force resetting local overrides if user manually toggles it for demonstration/playtesting
      }
    });

    // B. Fetch voyages directly from Cloud Firestore!
    fetchViagensFromFirestore()
      .then((fetched) => {
        if (fetched && fetched.length > 0) {
          setViagens(fetched);
          saveViagensToDB(fetched); // Sync to local IndexedDB backup
        }
        setDbLoading(false);
      })
      .catch((err) => {
        console.warn("Could not fetch elements from cloud, falling back to local copies:", err);
        getViagensFromDB().then((saved) => {
          if (saved && saved.length > 0) {
            setViagens(saved);
          }
        });
        setDbLoading(false);
      });

    // C. Fetch latest upload metadata from Cloud Firestore
    fetchLastUpdateMetadata()
      .then((meta) => {
        if (meta) {
          setLastUpdate(meta);
        }
      })
      .catch((error) => {
        console.warn("Metadata retrieval skipped:", error);
      });

    // D. Hydrate previous user filters & active pagination/navigation states from localStorage
    setTimeout(() => {
      try {
        const savedFiliais = localStorage.getItem('filters_filiais');
        if (savedFiliais) setSelectedFiliais(JSON.parse(savedFiliais));

        const savedAnos = localStorage.getItem('filters_anos');
        if (savedAnos) setSelectedAnos(JSON.parse(savedAnos));

        const savedMeses = localStorage.getItem('filters_meses');
        if (savedMeses) setSelectedMeses(JSON.parse(savedMeses));

        const savedSupervisores = localStorage.getItem('filters_supervisores');
        if (savedSupervisores) setSelectedSupervisores(JSON.parse(savedSupervisores));

        const savedStatusMeta = localStorage.getItem('filters_status_meta');
        if (savedStatusMeta) setStatusMetaFilter(savedStatusMeta as any);

        const savedTab = localStorage.getItem('active_tab');
        if (savedTab) {
          setActiveTab(savedTab as any);
        }

        const savedPage = localStorage.getItem('current_page');
        if (savedPage) {
          setCurrentPage(Number(savedPage));
        }

        const savedSearch = localStorage.getItem('search_query');
        if (savedSearch) {
          setSearchQuery(savedSearch);
        }

        const savedPlaca = localStorage.getItem('filter_placa');
        if (savedPlaca) setFilterPlaca(savedPlaca);

        const savedMotorista = localStorage.getItem('filter_motorista');
        if (savedMotorista) setFilterMotorista(savedMotorista);

        const savedSupervisao = localStorage.getItem('filter_supervisao');
        if (savedSupervisao) setFilterSupervisao(savedSupervisao);

        const savedLogo = localStorage.getItem('app_logo_url');
        if (savedLogo) setLogoUrl(savedLogo);

        // Retrieve user profile choice if saved
        const savedProfile = localStorage.getItem('user_profile_role');
        if (savedProfile) {
          setUserProfile(savedProfile as any);
        }
      } catch (e) {
        console.warn('Could not read state from storage', e);
      }
    }, 0);

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const updateFiliais = (values: string[]) => {
    setSelectedFiliais(values);
    localStorage.setItem('filters_filiais', JSON.stringify(values));
  };

  const updateAnos = (values: string[]) => {
    setSelectedAnos(values);
    localStorage.setItem('filters_anos', JSON.stringify(values));
  };

  const updateMeses = (values: string[]) => {
    setSelectedMeses(values);
    localStorage.setItem('filters_meses', JSON.stringify(values));
  };

  const updateSupervisores = (values: string[]) => {
    setSelectedSupervisores(values);
    localStorage.setItem('filters_supervisores', JSON.stringify(values));
  };

  const updateStatusMetaFilter = (value: 'ALL' | 'DENTRO' | 'FORA') => {
    setStatusMetaFilter(value);
    localStorage.setItem('filters_status_meta', value);
  };

  const updateActiveTab = (tab: any) => {
    setActiveTab(tab);
    localStorage.setItem('active_tab', tab);
  };

  const updateCurrentPage = (page: number) => {
    setCurrentPage(page);
    localStorage.setItem('current_page', String(page));
  };

  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
    localStorage.setItem('search_query', query);
  };

  // Performance: Remover dados anteriores da memória, processar novamente e atualizar instantaneamente!
  const handleImportSuccess = async (novasViagens: Viagem[], mode: 'substituir' | 'somar') => {
    if (userProfile !== 'Administrador') {
      triggerToast("❌ Operação negada: Apenas o Administrador pode importar ou modificar dados.");
      return;
    }

    let dataset: Viagem[] = [];
    if (mode === 'somar') {
      const existingIds = new Set(viagens.map(v => v.id));
      const filteredNew = novasViagens.filter(v => !existingIds.has(v.id));
      dataset = [...viagens, ...filteredNew];
    } else {
      dataset = novasViagens;
    }
    
    setViagens(dataset);
    setCurrentPage(1);
    localStorage.setItem('current_page', '1');
    
    // Save to local IndexedDB fallback
    await saveViagensToDB(dataset);
    
    // Save to Cloud Firestore
    try {
      const fileName = localStorage.getItem('last_uploaded_filename') || 'Planilha_Importada.xlsx';
      const uploader = currentUser?.email || 'Administrador';
      
      triggerToast("🔄 Sincronizando dados com o Banco de Dados Nuvem (Firestore)...");
      
      await saveViagensToFirestore(dataset, mode, {
        uploaderName: uploader,
        fileName: fileName
      });
      
      const meta = await fetchLastUpdateMetadata();
      if (meta) {
        setLastUpdate(meta);
      }
      
      triggerToast(`🚚 Planilha processada e sincronizada na Nuvem (${mode === 'somar' ? 'Somada' : 'Substituída'})! total de ${dataset.length} viagens registradas na frota.`);
    } catch (e: any) {
      console.warn("Firestore error during import sync:", e);
      triggerToast(`⚠️ Salvou localmente para testes, mas foi recusado na Nuvem (sem login Admin Google no console).`);
    }
  };

  const handleClearAllData = async () => {
    if (userProfile !== 'Administrador') {
      triggerToast("❌ Operação negada: Apenas o Administrador pode limpar ou redefinir os dados.");
      return;
    }

    if (confirm("Deseja realmente limpar todos os dados importados? O sistema será redefinido para a base inicial.")) {
      setViagens(INITIAL_VIAGENS);
      await clearViagensFromDB();
      await saveViagensToDB(INITIAL_VIAGENS);
      
      try {
        triggerToast("🔄 Redefinindo banco de dados na Nuvem (Firestore)...");
        const uploader = currentUser?.email || 'Administrador';
        await resetViagensInFirestore(uploader);
        
        const meta = await fetchLastUpdateMetadata();
        if (meta) {
          setLastUpdate(meta);
        }
        
        // Clear filters
        setSelectedFiliais([]);
        setSelectedAnos([]);
        setSelectedMeses([]);
        setSelectedSupervisores([]);
        setStatusMetaFilter('ALL');
        localStorage.removeItem('filters_filiais');
        localStorage.removeItem('filters_anos');
        localStorage.removeItem('filters_meses');
        localStorage.removeItem('filters_supervisores');
        localStorage.removeItem('filters_status_meta');
        
        triggerToast("🧹 Todos os dados importados foram redefinidos para a base padrão na Nuvem com sucesso!");
      } catch (e) {
        console.warn("Firestore error during reset sync:", e);
        triggerToast("⚠️ Redefinido localmente para testes, mas recusado na Nuvem (sem login Admin Google).");
      }
    }
  };

  // Google Sign-In and Profile managers for Real-time Cloud updates
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      triggerToast(`👋 Olá, ${result.user.displayName || result.user.email}! Login efetuado.`);
    } catch (error: any) {
      console.error(error);
      triggerToast(`❌ Erro no login: ${error.message || 'Falha de rede'}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUserProfile('Leitor');
      localStorage.setItem('user_profile_role', 'Leitor');
      triggerToast("👋 Logout efetuado. Retornado ao Perfil de Leitor.");
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleProfileToggle = (newRole: 'Administrador' | 'Leitor') => {
    setUserProfile(newRole);
    localStorage.setItem('user_profile_role', newRole);
    if (newRole === 'Administrador' && !currentUser) {
      triggerToast("⚠️ Modo Administrador Simulado ativo. Importação permitida localmente, mas rejeitada na Nuvem até fazer login com o Google Admin.");
    } else {
      triggerToast(`👤 Perfil alterado para ${newRole}.`);
    }
  };

  // Simulate downloading a structured PDF or CSV of current list
  const handleDownloadPDF = (title: string) => {
    triggerToast(`⚙️ Gerando relatório "${title}" em formato binário...`);
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(viagens, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast(`✅ Relatório exportado com sucesso!`);
    }, 1500);
  };

  // Extract unique filter dropdown options dynamically from the current dataset list
  const filiaisDrop = React.useMemo(() => {
    const set = new Set(viagens.map(v => v.filial || 'Filial São Luís'));
    return Array.from(set).sort();
  }, [viagens]);

  const anosDrop = React.useMemo(() => {
    const set = new Set(viagens.map(v => String(v.ano || 2026)));
    return Array.from(set).sort();
  }, [viagens]);

  const mesesDrop = React.useMemo(() => {
    const set = new Set(viagens.map(v => v.mes || 'Maio'));
    const mesesOrdem = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return Array.from(set).sort((a, b) => mesesOrdem.indexOf(a) - mesesOrdem.indexOf(b));
  }, [viagens]);

  const supervisoresDrop = React.useMemo(() => {
    const set = new Set(viagens.map(v => v.supervisao || 'Sem Supervisor'));
    return Array.from(set).sort();
  }, [viagens]);

  // Re-compute standard metrics based on currently parsed list responding to Filial, Ano, Mês, Supervisor, Meta Status and Search text
  const activeViagens = React.useMemo(() => {
    let list = viagens;

    // Filter by Filial (Multi-select)
    if (selectedFiliais && selectedFiliais.length > 0) {
      list = list.filter(v => selectedFiliais.includes(v.filial || 'Filial São Luís'));
    }

    // Filter by Ano (Multi-select)
    if (selectedAnos && selectedAnos.length > 0) {
      list = list.filter(v => selectedAnos.includes(String(v.ano || 2026)));
    }

    // Filter by Mês (Multi-select)
    if (selectedMeses && selectedMeses.length > 0) {
      list = list.filter(v => selectedMeses.includes(v.mes || 'Maio'));
    }

    // Filter by Supervisor (Multi-select)
    if (selectedSupervisores && selectedSupervisores.length > 0) {
      list = list.filter(v => selectedSupervisores.includes(v.supervisao || 'Sem Supervisor'));
    }

    // Direct header-level search query on vehicles, drivers and routes
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      list = list.filter(v =>
        v.placa.toLowerCase().includes(q) ||
        v.motorista.toLowerCase().includes(q) ||
        v.rota.toLowerCase().includes(q)
      );
    }

    // Filter by Meta Status ('ALL' | 'DENTRO' | 'FORA')
    if (statusMetaFilter && statusMetaFilter !== 'ALL') {
      const counts: Record<string, number> = {};
      list.forEach(v => {
        counts[v.placa] = (counts[v.placa] || 0) + 1;
      });
      if (statusMetaFilter === 'DENTRO') {
        list = list.filter(v => (counts[v.placa] || 0) >= 4);
      } else if (statusMetaFilter === 'FORA') {
        list = list.filter(v => (counts[v.placa] || 0) < 4);
      }
    }

    return list;
  }, [viagens, selectedFiliais, selectedAnos, selectedMeses, selectedSupervisores, statusMetaFilter, searchQuery]);

  // Compute metrics dynamically
  const metrics = React.useMemo(() => computeExecutiveMetrics(activeViagens), [activeViagens]);
  const rankings = React.useMemo(() => computePlacaMetrics(activeViagens), [activeViagens]);
  const motoristas = React.useMemo(() => computeMotoristaMetrics(activeViagens), [activeViagens]);
  const rotas = React.useMemo(() => computeRouteMetrics(activeViagens), [activeViagens]);

  const selectedRouteDetails = React.useMemo(() => {
    if (!selectedRouteName) return null;
    const filtered = activeViagens.filter(v => v.rota === selectedRouteName);
    const totalTrips = filtered.length;
    if (totalTrips === 0) return null;

    const totalDays = filtered.reduce((sum, v) => sum + (v.qtdDias || 0), 0);
    const avgDays = parseFloat((totalDays / totalTrips).toFixed(1));

    const uniqueDrivers = Array.from(new Set(filtered.map(v => v.motorista.trim()))).filter(Boolean);
    const uniquePlacas = Array.from(new Set(filtered.map(v => v.placa.trim()))).filter(Boolean);

    const totalValue = filtered.reduce((sum, v) => sum + (v.valorCarga || 0), 0);
    const despesaOficina = filtered.reduce((sum, v) => sum + (v.despesaOficina || 0), 0);
    const faturamentoLiquido = totalValue - despesaOficina;

    // Group drivers for this route
    const driverGroups: Record<string, { nome: string; viagens: number; faturamento: number; despesaOficina: number; faturamentoLiquido: number }> = {};
    filtered.forEach(v => {
      const dName = v.motorista.trim();
      if (!driverGroups[dName]) {
        driverGroups[dName] = { nome: dName, viagens: 0, faturamento: 0, despesaOficina: 0, faturamentoLiquido: 0 };
      }
      driverGroups[dName].viagens += 1;
      driverGroups[dName].faturamento += v.valorCarga || 0;
      const itemDespesa = v.despesaOficina || 0;
      driverGroups[dName].despesaOficina += itemDespesa;
      driverGroups[dName].faturamentoLiquido += (v.valorCarga || 0) - itemDespesa;
    });
    const driversList = Object.values(driverGroups).sort((a, b) => b.viagens - a.viagens || b.faturamento - a.faturamento);

    // Vehicles list for this route
    const plateGroups: Record<string, number> = {};
    filtered.forEach(v => {
      const p = v.placa.trim();
      plateGroups[p] = (plateGroups[p] || 0) + 1;
    });
    const vehiclesList = Object.entries(plateGroups).map(([placa, viagensCount]) => ({
      placa,
      viagensCount
    })).sort((a, b) => b.viagensCount - a.viagensCount);

    return {
      rota: selectedRouteName,
      viagensCount: totalTrips,
      avgDays,
      driversCount: uniqueDrivers.length,
      vehiclesCount: uniquePlacas.length,
      faturamentoTotal: totalValue,
      despesaOficina,
      faturamentoLiquido,
      drivers: driversList,
      vehicles: vehiclesList,
      rawViagens: filtered
    };
  }, [selectedRouteName, activeViagens]);

  // Stats and details for Despesas Oficina indicator
  const despesaOficinaStats = React.useMemo(() => {
    const isImportFallbackOrAbsent = typeof window !== 'undefined' && localStorage.getItem('despesa_oficina_col_not_found') === 'true';

    const validRaw = activeViagens.map(v => v.despesaOficina);
    const validDespesas = validRaw.filter((d): d is number => d !== undefined && d !== null);

    const count = validDespesas.length;
    const total = validDespesas.reduce((sum, d) => sum + d, 0);
    const avg = count > 0 ? total / count : 0;
    const max = count > 0 ? Math.max(...validDespesas) : 0;
    const min = count > 0 ? Math.min(...validDespesas) : 0;

    return {
      count,
      total,
      avg,
      max,
      min,
      columnNotFound: isImportFallbackOrAbsent
    };
  }, [activeViagens]);

  // Group despesaOficina by placa (for future or current plots)
  const despesasPorPlaca = React.useMemo(() => {
    const groups: Record<string, number> = {};
    activeViagens.forEach(v => {
      if (typeof v.despesaOficina === 'number') {
        groups[v.placa] = (groups[v.placa] || 0) + v.despesaOficina;
      }
    });
    return Object.keys(groups).map(placa => ({
      placa,
      totalOficina: groups[placa]
    })).sort((a, b) => b.totalOficina - a.totalOficina);
  }, [activeViagens]);

  // Compute supervisor rankings dynamically
  const supervisorRankings = React.useMemo(() => {
    const groups: Record<string, {
      plates: Set<string>;
      viagensCount: number;
      faturamento: number;
      despesaOficina: number;
      plateViagens: Record<string, number>;
    }> = {};

    activeViagens.forEach(v => {
      const sup = v.supervisao || 'Sem Supervisor';
      if (!groups[sup]) {
        groups[sup] = {
          plates: new Set(),
          viagensCount: 0,
          faturamento: 0,
          despesaOficina: 0,
          plateViagens: {}
        };
      }
      groups[sup].plates.add(v.placa);
      groups[sup].viagensCount += 1;
      groups[sup].faturamento += v.valorCarga;
      groups[sup].despesaOficina += v.despesaOficina || 0;
      groups[sup].plateViagens[v.placa] = (groups[sup].plateViagens[v.placa] || 0) + 1;
    });

    return Object.keys(groups).map(sup => {
      const g = groups[sup];
      
      let dentro = 0;
      let fora = 0;
      Object.keys(g.plateViagens).forEach(p => {
        if (g.plateViagens[p] >= 4) {
          dentro += 1;
        } else {
          fora += 1;
        }
      });

      const metaGlobal = 90;
      const metaAtingidaPercent = Math.round((g.viagensCount / metaGlobal) * 100);
      const faturamentoTotal = g.faturamento;
      const despesaOficinaTotal = g.despesaOficina;
      const faturamentoLiquido = faturamentoTotal - despesaOficinaTotal;

      return {
        supervisor: sup,
        qtdVeiculos: g.plates.size,
        qtdViagens: g.viagensCount,
        metaAtingidaPercent,
        placasDentroMeta: dentro,
        placasForaMeta: fora,
        faturamentoTotal: faturamentoTotal,
        despesaOficina: despesaOficinaTotal,
        faturamentoLiquido: faturamentoLiquido
      };
    }).sort((a, b) => {
      if (b.metaAtingidaPercent !== a.metaAtingidaPercent) {
        return b.metaAtingidaPercent - a.metaAtingidaPercent;
      }
      if (b.qtdViagens !== a.qtdViagens) {
        return b.qtdViagens - a.qtdViagens;
      }
      return b.faturamentoLiquido - a.faturamentoLiquido;
    });
  }, [activeViagens]);

  // List of unique supervisor names inside system
  const uniqueSupervisores = React.useMemo(() => {
    const set = new Set(viagens.map(v => v.supervisao));
    return Array.from(set);
  }, [viagens]);

  // List of unique driver names inside system for filter selectors
  const uniqueMotoristas = React.useMemo(() => {
    const set = new Set(viagens.map(v => v.motorista));
    return Array.from(set);
  }, [viagens]);

  // Memo with monthly aggregates and MoM variation percentages, respecting active non-temporal filters
  const comparativoMensal = React.useMemo(() => {
    let list = viagens;
    if (selectedFiliais && selectedFiliais.length > 0) {
      list = list.filter(v => selectedFiliais.includes(v.filial || 'Filial São Luís'));
    }
    if (selectedSupervisores && selectedSupervisores.length > 0) {
      list = list.filter(v => selectedSupervisores.includes(v.supervisao || 'Sem Supervisor'));
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      list = list.filter(v =>
        v.placa.toLowerCase().includes(q) ||
        v.motorista.toLowerCase().includes(q) ||
        v.rota.toLowerCase().includes(q)
      );
    }

    const groups: Record<string, {
      key: string;
      ano: number;
      mesNome: string;
      mesNum: string;
      faturamentoBruto: number;
      despesaOficina: number;
      qtdViagens: number;
      veiculosUnicos: Set<string>;
      kmRodado: number;
    }> = {};

    list.forEach(v => {
      const ano = Number(v.ano || 2026);
      const mesNome = v.mes || 'Meticuloso';
      const mesNum = mapMes(mesNome);
      const key = `${ano}-${mesNum}`;

      if (!groups[key]) {
        groups[key] = {
          key,
          ano,
          mesNome: v.mes || 'Maio',
          mesNum,
          faturamentoBruto: 0,
          despesaOficina: 0,
          qtdViagens: 0,
          veiculosUnicos: new Set(),
          kmRodado: 0
        };
      }

      groups[key].faturamentoBruto += v.valorCarga || 0;
      groups[key].despesaOficina += v.despesaOficina || 0;
      groups[key].qtdViagens += 1;
      groups[key].veiculosUnicos.add(v.placa);
      groups[key].kmRodado += v.kmRodado || 0;
    });

    const sortedMonths = Object.values(groups)
      .map(g => ({
        ...g,
        faturamentoLiquido: g.faturamentoBruto - g.despesaOficina,
        qtdVeiculos: g.veiculosUnicos.size
      }))
      .sort((a, b) => a.key.localeCompare(b.key));

    const computedList = sortedMonths.map((curr, idx) => {
      const prev = sortedMonths[idx - 1];
      
      let varFaturamentoLiquido = 0;
      if (prev) {
        if (prev.faturamentoLiquido !== 0) {
          varFaturamentoLiquido = ((curr.faturamentoLiquido - prev.faturamentoLiquido) / prev.faturamentoLiquido) * 100;
        } else if (curr.faturamentoLiquido > 0) {
          varFaturamentoLiquido = 100;
        }
      }

      let varFaturamentoBruto = 0;
      if (prev) {
        if (prev.faturamentoBruto !== 0) {
          varFaturamentoBruto = ((curr.faturamentoBruto - prev.faturamentoBruto) / prev.faturamentoBruto) * 100;
        } else if (curr.faturamentoBruto > 0) {
          varFaturamentoBruto = 100;
        }
      }

      let varDespesaOficina = 0;
      if (prev) {
        if (prev.despesaOficina !== 0) {
          varDespesaOficina = ((curr.despesaOficina - prev.despesaOficina) / prev.despesaOficina) * 100;
        } else if (curr.despesaOficina > 0) {
          varDespesaOficina = 100;
        }
      }

      let varQtdViagens = 0;
      if (prev) {
        if (prev.qtdViagens !== 0) {
          varQtdViagens = ((curr.qtdViagens - prev.qtdViagens) / prev.qtdViagens) * 100;
        } else if (curr.qtdViagens > 0) {
          varQtdViagens = 100;
        }
      }

      let varQtdVeiculos = 0;
      if (prev) {
        if (prev.qtdVeiculos !== 0) {
          varQtdVeiculos = ((curr.qtdVeiculos - prev.qtdVeiculos) / prev.qtdVeiculos) * 100;
        } else if (curr.qtdVeiculos > 0) {
          varQtdVeiculos = 100;
        }
      }

      let varKmRodado = 0;
      if (prev) {
        if (prev.kmRodado !== 0) {
          varKmRodado = ((curr.kmRodado - prev.kmRodado) / prev.kmRodado) * 100;
        } else if (curr.kmRodado > 0) {
          varKmRodado = 100;
        }
      }

      return {
        ...curr,
        varFaturamentoLiquido,
        varFaturamentoBruto,
        varDespesaOficina,
        varQtdViagens,
        varQtdVeiculos,
        varKmRodado,
        prevMonthName: prev ? `${prev.mesNome}/${prev.ano}` : null
      };
    });

    return computedList;
  }, [viagens, selectedFiliais, selectedSupervisores, searchQuery]);

  // Effect to select default comparison key when the list loads or updates
  React.useEffect(() => {
    if (comparativoMensal.length > 0) {
      if (!selectedComparisonKey || !comparativoMensal.some(c => c.key === selectedComparisonKey)) {
        const lastKey = comparativoMensal[comparativoMensal.length - 1].key;
        setTimeout(() => {
          setSelectedComparisonKey(lastKey);
        }, 0);
      }
    }
  }, [comparativoMensal, selectedComparisonKey]);

  // Handle advanced logical filter queries
  const filteredAdvancedViagens = React.useMemo(() => {
    let result = activeViagens;

    if (filterPlaca.trim()) {
      const plateQuery = filterPlaca.toUpperCase().trim();
      result = result.filter(v => v.placa.includes(plateQuery));
    }

    if (filterMotorista !== 'ALL') {
      result = result.filter(v => v.motorista === filterMotorista);
    }

    if (filterSupervisao !== 'ALL') {
      result = result.filter(v => v.supervisao === filterSupervisao);
    }

    return result;
  }, [activeViagens, filterPlaca, filterMotorista, filterSupervisao]);

  const totalPages = Math.ceil(filteredAdvancedViagens.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);

  // Row paginator computation
  const paginatedViagens = React.useMemo(() => {
    const startIdx = (activePage - 1) * itemsPerPage;
    return filteredAdvancedViagens.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredAdvancedViagens, activePage, itemsPerPage]);

  return (
    <div className="min-h-screen flex">
      {/* Toast popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#0b1c30] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-[#c3c6d7]/30 min-w-[320px] max-w-md"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#6cf8bb] animate-pulse" />
            <p className="text-xs font-bold font-sans tracking-wide leading-relaxed text-slate-100">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar overlay backdrop on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-45 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar navigation panel */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-[#c3c6d7]/40 shadow-xl lg:shadow-sm flex flex-col py-6 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } z-50`}>
        <div className="px-6 mb-10 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 max-w-[200px]">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-8 max-w-[50px] object-contain rounded" referrerPolicy="no-referrer" />
              ) : (
                <div className="p-1.5 bg-[#004ac6] text-white rounded-lg shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-black text-[#0b1c30] leading-tight tracking-wider uppercase truncate">
                  GRUPO MATEUS
                </span>
                <span className="text-[8px] font-bold text-[#004ac6] bg-[#004ac6]/10 px-1 py-0.2 rounded-sm tracking-wider uppercase mt-0.5 whitespace-nowrap block">
                  TRANSP. EXTERNO
                </span>
              </div>
            </div>
            
            {/* Close sidebar button on mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#0b1c30] transition-colors focus:outline-none"
              aria-label="Fecar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] font-bold text-[#737686] uppercase tracking-widest leading-none mt-1">
            Painel de Produtividade
          </p>
        </div>

        {/* Menu selections */}
        <nav className="flex-1 px-3 space-y-1">
          <button
            onClick={() => { updateActiveTab('dashboard'); updateSearchQuery(''); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              activeTab === 'dashboard'
                ? 'bg-[#6cf8bb] text-[#00714d] shadow-sm font-extrabold'
                : 'text-[#434655] hover:bg-gray-100 hover:text-[#0b1c30]'
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => { updateActiveTab('vehiculos'); updateSearchQuery(''); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              activeTab === 'vehiculos'
                ? 'bg-[#6cf8bb] text-[#00714d] shadow-sm font-extrabold'
                : 'text-[#434655] hover:bg-gray-100 hover:text-[#0b1c30]'
            }`}
          >
            <Truck className="w-4.5 h-4.5" />
            <span>Veículos</span>
          </button>

          <button
            onClick={() => { updateActiveTab('motoristas'); updateSearchQuery(''); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              activeTab === 'motoristas'
                ? 'bg-[#6cf8bb] text-[#00714d] shadow-sm font-extrabold'
                : 'text-[#434655] hover:bg-gray-100 hover:text-[#0b1c30]'
            }`}
          >
            <Users className="w-4.5 h-4.5" />
            <span>Motoristas</span>
          </button>

          <button
            onClick={() => { updateActiveTab('rotas'); updateSearchQuery(''); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              activeTab === 'rotas'
                ? 'bg-[#6cf8bb] text-[#00714d] shadow-sm font-extrabold'
                : 'text-[#434655] hover:bg-gray-100 hover:text-[#0b1c30]'
            }`}
          >
            <Route className="w-4.5 h-4.5" />
            <span>Rotas</span>
          </button>

          <button
            onClick={() => { updateActiveTab('relatorios'); updateSearchQuery(''); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              activeTab === 'relatorios'
                ? 'bg-[#6cf8bb] text-[#00714d] shadow-sm font-extrabold'
                : 'text-[#434655] hover:bg-gray-100 hover:text-[#0b1c30]'
            }`}
          >
            <FileSpreadsheet className="w-4.5 h-4.5" />
            <span>Relatórios</span>
          </button>

          <button
            onClick={() => { updateActiveTab('comparativo'); updateSearchQuery(''); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              activeTab === 'comparativo'
                ? 'bg-[#6cf8bb] text-[#00714d] shadow-sm font-extrabold'
                : 'text-[#434655] hover:bg-gray-100 hover:text-[#0b1c30]'
            }`}
          >
            <TrendingUp className="w-4.5 h-4.5" />
            <span>Comparativo Mensal</span>
          </button>
        </nav>

        {/* Technical Support and Settings group */}
        <div className="mt-auto px-4 space-y-4">
          
          {/* Profile & Auth Management Panel */}
          <div className="border border-[#c3c6d7]/35 rounded-xl p-3.5 bg-[#f8f9fc] space-y-3 shadow-3xs">
            <div className="flex items-center gap-1.5 justify-between border-b border-[#c3c6d7]/20 pb-2">
              <span className="text-[9px] font-black text-[#737686] uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#004ac6]" /> Perfil de Acesso
              </span>
              <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded ${
                userProfile === 'Administrador' ? 'bg-[#6cf8bb]/30 text-[#00714d]' : 'bg-gray-200 text-gray-600'
              }`}>
                {userProfile.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[8.5px] font-bold text-[#737686] uppercase">Trocar Perfil:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleProfileToggle('Leitor')}
                  className={`px-1 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                    userProfile === 'Leitor'
                      ? 'bg-[#0b1c30] text-white border-[#0b1c30]'
                      : 'bg-white text-gray-600 border-[#c3c6d7]/40 hover:bg-gray-50'
                  }`}
                >
                  Leitor
                </button>
                <button
                  onClick={() => handleProfileToggle('Administrador')}
                  className={`px-1 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                    userProfile === 'Administrador' && !currentUser
                      ? 'bg-[#004ac6] text-white border-[#004ac6]'
                      : userProfile === 'Administrador' && currentUser
                        ? 'bg-[#00714d] text-white border-[#00714d]'
                        : 'bg-white text-gray-600 border-[#c3c6d7]/40 hover:bg-gray-50'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Google Authentication Section for Admins */}
            <div className="pt-1.5">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 max-w-full">
                    <img
                      src={currentUser.photoURL || undefined}
                      alt="User"
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] font-black text-[#0b1c30] truncate" title={currentUser.displayName || currentUser.email || undefined}>
                        {currentUser.displayName || currentUser.email}
                      </span>
                      <span className="text-[7.5px] font-semibold text-gray-500 leading-none">
                        Google Conectado
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-[9px] font-black uppercase text-red-600 hover:text-red-700 hover:bg-red-50 py-1 rounded border border-red-200/40 text-center transition-colors"
                  >
                    Logout Google
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[8.5px] leading-relaxed font-semibold text-[#737686]">
                    Faça login com o Google para autorizar em tempo real no banco persistente da Nuvem.
                  </p>
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full text-[9px] font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 py-1 px-2 rounded flex items-center justify-center gap-1 transition-colors"
                  >
                    <span className="text-red-500">G</span> Login Admin Google
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => { triggerToast("💬 Canal de suporte técnico ativo das 08:00 às 18:00."); setIsSidebarOpen(false); }}
            className="w-full bg-[#004ac6] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-opacity-95 shadow-md active:scale-95 transition-all"
          >
            <Headphones className="w-4.5 h-4.5" />
            Suporte Técnico
          </button>

          <div className="border-t border-[#c3c6d7]/40 pt-4 flex flex-col gap-1">
            <button
              onClick={() => { triggerToast("⚙️ Redirecionando para as Configurações do Sistema..."); setIsSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 text-[#434655] hover:bg-gray-100 text-xs font-bold rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Configurações
            </button>
            <button
              onClick={async () => {
                await clearViagensFromDB();
                setViagens(INITIAL_VIAGENS);
                await saveViagensToDB(INITIAL_VIAGENS);
                
                // Reset states
                setSelectedFiliais([]);
                setSelectedAnos([]);
                setSelectedMeses([]);
                setSelectedSupervisores([]);
                setStatusMetaFilter('ALL');
                setSearchQuery('');
                setCurrentPage(1);

                // Clear storage keys
                localStorage.removeItem('filters_filiais');
                localStorage.removeItem('filters_anos');
                localStorage.removeItem('filters_meses');
                localStorage.removeItem('filters_supervisores');
                localStorage.removeItem('filters_status_meta');
                localStorage.removeItem('active_tab');
                localStorage.removeItem('current_page');
                localStorage.removeItem('search_query');
                localStorage.removeItem('filter_placa');
                localStorage.removeItem('filter_motorista');
                localStorage.removeItem('filter_supervisao');

                triggerToast("🔒 Sessão encerrada e dados do cache limpos com segurança.");
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-error hover:bg-[#ffdad6]/40 text-xs font-bold rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Canvas layout */}
      <div className="ml-0 lg:ml-64 flex-1 min-h-screen flex flex-col w-full transition-all duration-300">
        {/* Top App Bar inside standard layouts */}
        <header className="flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 h-16 bg-white border-b border-[#c3c6d7]/40 sticky top-0 z-30">
          <div className="flex items-center gap-2.5 sm:gap-4 md:gap-6 min-w-0 flex-1 lg:flex-initial">
            {/* Sidebar toggle menu button on mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-[#eff4ff] rounded-lg text-[#004ac6] shrink-0 transition-colors focus:outline-none"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="text-sm font-extrabold text-[#004ac6] tracking-wide shrink-0 hidden xs:inline">
              Gestão de Frota
            </span>

            {/* Real Search bar filter query */}
            <div className="relative flex-1 max-w-[130px] sm:max-w-xs md:w-64 transition-all">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="pl-9 pr-6 py-1.5 bg-[#eff4ff] rounded-full border-none focus:outline-none focus:ring-1.5 focus:ring-[#004ac6] w-full text-xs font-medium text-[#0b1c30]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#737686] hover:text-[#0b1c30]"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
            {/* Dynamic React Filial filter */}
            <div className="flex items-center">
              <MultiSelectDropdown
                title="Filial"
                placeholder="filial"
                options={filiaisDrop}
                selectedValues={selectedFiliais}
                onChange={updateFiliais}
                icon={<MapPin className="w-3.5 h-3.5" />}
              />
            </div>

            {/* Dynamic React Ano filter */}
            <div className="flex items-center">
              <MultiSelectDropdown
                title="Ano"
                placeholder="ano"
                options={anosDrop}
                selectedValues={selectedAnos}
                onChange={updateAnos}
                icon={<Calendar className="w-3.5 h-3.5" />}
              />
            </div>

            {/* Dynamic React Mês filter */}
            <div className="flex items-center">
              <MultiSelectDropdown
                title="Mês"
                placeholder="mês"
                options={mesesDrop}
                selectedValues={selectedMeses}
                onChange={updateMeses}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              />
            </div>

            {/* Dynamic React Supervisor filter */}
            <div className="flex items-center">
              <MultiSelectDropdown
                title="Supervisor"
                placeholder="supervisor"
                options={supervisoresDrop}
                selectedValues={selectedSupervisores}
                onChange={updateSupervisores}
                icon={<UserCheck className="w-3.5 h-3.5" />}
              />
            </div>

            {/* Status da Meta selector query */}
            <div className="flex bg-[#eff4ff] p-1 rounded-lg border border-[#c3c6d7]/30 items-center">
              <button
                onClick={() => updateStatusMetaFilter('ALL')}
                className={`px-2 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                  statusMetaFilter === 'ALL'
                    ? 'bg-[#004ac6] text-white shadow-xs font-black'
                    : 'text-[#434655] hover:text-[#0b1c30]'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => updateStatusMetaFilter('DENTRO')}
                className={`px-2 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                  statusMetaFilter === 'DENTRO'
                    ? 'bg-[#00714d] text-white shadow-xs font-black'
                    : 'text-[#434655] hover:text-[#00714d]'
                }`}
              >
                Dentro Meta
              </button>
              <button
                onClick={() => updateStatusMetaFilter('FORA')}
                className={`px-2 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                  statusMetaFilter === 'FORA'
                    ? 'bg-[#ab0b1c] text-white shadow-xs font-black'
                    : 'text-[#434655] hover:text-[#ab0b1c]'
                }`}
              >
                Fora Meta
              </button>
            </div>

            {/* Clear persistent data */}
            <button
              onClick={() => {
                if (userProfile !== 'Administrador') {
                  triggerToast("❌ Acesso Reservado: Apenas o Administrador pode limpar ou redefinir dados.");
                } else {
                  handleClearAllData();
                }
              }}
              className={`border border-[#c3c6d7]/50 p-2 sm:px-3 sm:py-2 rounded-lg text-xs font-bold active:scale-95 flex items-center gap-1.5 transition-all cursor-pointer ${
                userProfile !== 'Administrador' ? 'opacity-50 text-gray-400 border-dashed hover:bg-transparent' : 'text-[#434655] hover:bg-red-50 hover:text-red-500'
              }`}
              title="Limpar todos os dados importados"
            >
              {userProfile !== 'Administrador' ? <Lock className="w-4 h-4 text-gray-400" /> : <Trash2 className="w-4 h-4" />}
              <span className="hidden xl:inline">Limpar Dados</span>
            </button>

            {/* Import Planilha Trigger */}
            <button
              onClick={() => {
                if (userProfile !== 'Administrador') {
                  triggerToast("❌ Acesso Reservado: Ative o perfil Administrador no menu para importar novas planilhas.");
                } else {
                  setIsImportOpen(true);
                }
              }}
              className={`p-2 sm:px-4 sm:py-2 rounded-lg text-xs font-extrabold shadow-sm active:scale-95 flex items-center gap-2 transition-all cursor-pointer ${
                userProfile !== 'Administrador'
                  ? 'bg-gray-200 text-gray-500 border border-gray-300 pointer-events-auto opacity-75'
                  : 'bg-[#004ac6] text-white hover:bg-opacity-95'
              }`}
              title="Importar Planilha"
            >
              {userProfile !== 'Administrador' ? <Lock className="w-4 h-4 text-gray-500" /> : <Upload className="w-4 h-4" />}
              <span className="hidden md:inline">Importar Planilha</span>
            </button>

            {/* Notifications simulated */}
            <button
              onClick={() => triggerToast("🔔 Nenhuma nova notificação crítica do painel de monitoramento.")}
              className="p-2 hover:bg-[#eff4ff] rounded-full transition-colors relative"
            >
              <Bell className="w-4.5 h-4.5 text-[#0b1c30]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border border-white"></span>
            </button>

            <div className="h-6 w-[1px] bg-[#c3c6d7] mx-0.5 sm:mx-1"></div>

            {/* Profile badge of current corporate agent */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <p className="text-xs font-extrabold text-[#0b1c30] leading-none">Admin</p>
                <p className="text-[10px] text-[#737686] mt-0.5 leading-none">Gestor de Frota</p>
              </div>
              <img
                alt="Gestor de Frota"
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=40&h=40&q=80"
                className="w-8 h-8 rounded-full border border-[#004ac6] object-cover shadow-xs shrink-0"
              />
            </div>
          </div>
        </header>

        {/* Dynamic content changes based on tab */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full w-full transition-all duration-300">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Section Title */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-[10px] font-extrabold text-[#737686] uppercase tracking-widest leading-none">
                      Indicadores Executivos
                    </h2>
                    <h3 className="text-xl font-bold mt-1 text-[#0b1c30]">Produtividade Geral da Frota</h3>
                  </div>
                  <div className="text-xs font-bold text-[#434655] flex items-center gap-1.5 bg-[#eff4ff] px-3 py-1.5 rounded-lg border border-[#c3c6d7]/30 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-[#004ac6]" />
                    Total de {activeViagens.length} Conhecimentos no dashboard
                  </div>
                </header>

                {/* Card de Controle: Última Atualização */}
                <div id="control-card-last-update" className="bg-[#eff4ff]/60 border border-[#004ac6]/20 p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 transition-all hover:bg-[#eff4ff]/80">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#004ac6] text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
                      <FileSpreadsheet className="w-5.5 h-5.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold tracking-widest text-[#004ac6] uppercase bg-white px-2 py-0.5 rounded-md border border-[#004ac6]/10 shadow-3xs">
                          Controle de Dados Ativo
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#00714d] bg-[#6cf8bb]/30 px-2 py-0.5 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" /> Sincronizado
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-[#0b1c30] flex items-center gap-2">
                        Base de Dados Persistente (Firestore Cloud)
                      </h4>
                      <p className="text-[11px] text-[#434655] font-semibold leading-relaxed max-w-2xl">
                        Os dados operacionais de faturamento da frota são lidos diretamente do banco e persistem de forma idêntica para todos os usuários autorizados. Não dependem de caches locais.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-[#c3c6d7]/25 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 min-w-full lg:min-w-[480px]">
                    <div className="text-left sm:px-3.5">
                      <span className="text-[9px] font-bold text-[#737686] uppercase tracking-wider block">Última Atualização</span>
                      <span className="text-xs font-black text-[#0b1c30] block mt-1">
                        {lastUpdate ? lastUpdate.lastUploadedAt : '01/06/2026 às 16:10'}
                      </span>
                    </div>
                    <div className="text-left sm:px-3.5 pt-2 sm:pt-0">
                      <span className="text-[9px] font-bold text-[#737686] uppercase tracking-wider block">Usuário Responsável</span>
                      <span className="text-xs font-black text-[#0b1c30] block mt-1 truncate max-w-[140px]" title={lastUpdate ? lastUpdate.uploaderName : 'anderson_admin@mateus.com'}>
                        {lastUpdate ? (lastUpdate.uploaderName.includes('@') ? lastUpdate.uploaderName.split('@')[0] : lastUpdate.uploaderName) : 'Administrador'}
                      </span>
                    </div>
                    <div className="text-left sm:px-3.5 pt-2 sm:pt-0">
                      <span className="text-[9px] font-bold text-[#737686] uppercase tracking-wider block">Planilha Fonte</span>
                      <span className="text-[11px] font-black text-[#004ac6] block mt-1 truncate max-w-[140px]" title={lastUpdate ? lastUpdate.fileName : 'Produtividade_Maio_2026.xlsx'}>
                        {lastUpdate ? lastUpdate.fileName : 'Produtividade_Maio_2026.xlsx'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* KPI metrics row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-4">
                  {/* KPI 1: Faturamento */}
                  <div className="bg-white border border-[#c3c6d7]/30 p-4 rounded-xl shadow-xs group hover:border-[#004ac6] transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#737686] uppercase">Faturamento</span>
                        <span className="text-[10px] font-bold text-[#00714d] bg-[#6cf8bb]/35 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" /> +12%
                        </span>
                      </div>
                      <p className="text-xl font-black text-[#004ac6] tracking-tight mt-2.5">
                        R$ {metrics.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <p className="text-[9px] text-[#737686] mt-3 font-semibold uppercase tracking-wider">
                      Soma Valor Carga R$
                    </p>
                  </div>

                  {/* KPI 2: Despesas Oficina */}
                  <DespesaCardTooltip stats={despesaOficinaStats}>
                    <div className="bg-white border border-[#c3c6d7]/30 p-4 rounded-xl shadow-xs group hover:border-[#004ac6] transition-colors flex flex-col justify-between h-full select-none">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#737686] uppercase">Despesas Oficina</span>
                          <span className="text-[10px] font-bold text-[#434655] bg-gray-100 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                            <Wrench className="w-2.5 h-2.5 text-[#004ac6]" /> Oficina
                          </span>
                        </div>
                        <p className="text-xl font-black text-[#0b1c30] tracking-tight mt-2.5">
                          R$ {metrics.despesaOficinaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        
                        {despesaOficinaStats.columnNotFound && (
                          <div className="mt-2.5 text-[8.5px] text-[#ab0b1c] bg-[#ffdad6] px-1.5 py-1 rounded border border-[#ffdad6]/50 flex items-center gap-1 leading-normal">
                            <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                            <span>Coluna ausente na planilha importada.</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[9px] text-[#737686] mt-3 font-semibold uppercase tracking-wider">
                        Total Geral Oficina (R$)
                      </p>
                    </div>
                  </DespesaCardTooltip>

                  {/* KPI 2: Total de Viagens */}
                  <div className="bg-white border border-[#c3c6d7]/30 p-4 rounded-xl shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#737686] uppercase">Total Viagens</span>
                      <p className="text-2xl font-black text-[#0b1c30] tracking-tight mt-2.5">
                        {metrics.totalViagens}
                      </p>
                    </div>
                    <p className="text-[9px] text-[#737686] mt-3 font-semibold uppercase tracking-wider">
                      Realizadas no período
                    </p>
                  </div>

                  {/* KPI 3: Meta Global */}
                  <div className="bg-white border border-[#c3c6d7]/30 p-4 rounded-xl shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#737686] uppercase">Meta Global</span>
                      <p className="text-2xl font-black text-[#0b1c30] tracking-tight mt-2.5">
                        {metrics.metaGlobal}
                      </p>
                    </div>
                    <p className="text-[9px] text-[#737686] mt-3 font-semibold uppercase tracking-wider">
                      Viagens desejadas
                    </p>
                  </div>

                  {/* KPI 4: % Meta Atingida */}
                  <div className="bg-white border border-[#c3c6d7]/30 p-4 rounded-xl shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#737686] uppercase">% Atingido</span>
                      <p className="text-2xl font-black text-[#004ac6] tracking-tight mt-2.5">
                        {metrics.percentMetaAtingida}%
                      </p>
                      <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-[#004ac6]" style={{ width: `${Math.min(100, metrics.percentMetaAtingida)}%` }} />
                      </div>
                    </div>
                    <p className="text-[9px] text-[#737686] mt-3 font-semibold uppercase tracking-wider">
                      Capacidade total
                    </p>
                  </div>

                  {/* KPI 5: Total Placas */}
                  <div className="bg-white border border-[#c3c6d7]/30 p-4 rounded-xl shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#737686] uppercase">Total Placas</span>
                      <p className="text-2xl font-black text-[#0b1c30] tracking-tight mt-2.5">
                        {metrics.totalPlacas}
                      </p>
                    </div>
                    <p className="text-[9px] text-[#737686] mt-3 font-semibold uppercase tracking-wider">
                      Veículos únicos em rota
                    </p>
                  </div>

                  {/* KPI 6: Dentro da Meta */}
                  <div className="bg-white border border-[#c3c6d7]/30 p-4 rounded-xl shadow-xs flex flex-col justify-between border-l-4 border-l-secondary">
                    <div>
                      <span className="text-[11px] font-bold text-[#00714d] uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Dentro Meta
                      </span>
                      <p className="text-2xl font-black text-secondary tracking-tight mt-2.5">
                        {metrics.dentroMetaCount}
                      </p>
                    </div>
                    <p className="text-[9px] text-[#737686] mt-3 font-semibold uppercase tracking-wider">
                      ≥ 4 viagens por veículo
                    </p>
                  </div>

                  {/* KPI 7: Fora da Meta */}
                  <div className="bg-white border border-[#c3c6d7]/30 p-4 rounded-xl shadow-xs flex flex-col justify-between border-l-4 border-l-error">
                    <div>
                      <span className="text-[11px] font-bold text-error uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-error" /> Fora Meta
                      </span>
                      <p className="text-2xl font-black text-error tracking-tight mt-2.5">
                        {metrics.foraMetaCount}
                      </p>
                    </div>
                    <p className="text-[9px] text-[#737686] mt-3 font-semibold uppercase tracking-wider">
                      &lt; 4 viagens por veículo
                    </p>
                  </div>
                </div>

                {/* Analytical charts section layout */}
                <h3 className="text-[10px] font-extrabold text-[#737686] uppercase tracking-widest leading-none mt-10">
                  Análise Gráfica
                </h3>

                <div className="grid grid-cols-12 gap-6">
                  {/* Card Gauge Meta Global */}
                  <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white border border-[#c3c6d7]/30 rounded-xl p-6 shadow-xs flex flex-col justify-between min-h-[352px]">
                    <div>
                      <h4 className="text-xs font-bold text-[#0b1c30]">Meta Global da Frota</h4>
                      <p className="text-[11px] text-[#737686] mt-1">Progresso total • 90 viagens/mês</p>
                    </div>

                    <div className="relative flex flex-col items-center justify-center my-5 h-36">
                      {/* Semi-Circle SVG Gauge */}
                      <svg className="w-56 h-28" viewBox="0 0 100 50">
                        {/* Track */}
                        <path
                          d="M 12,50 A 38,38 0 0,1 88,50"
                          fill="none"
                          stroke="#eff4ff"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                        {/* Value filler */}
                        <path
                          d="M 12,50 A 38,38 0 0,1 88,50"
                          fill="none"
                          stroke="#004ac6"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray="119.38"
                          strokeDashoffset={Math.max(0, 119.38 - (119.38 * Math.min(100, metrics.percentMetaAtingida)) / 100)}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute bottom-2 text-center">
                        <p className="text-3xl sm:text-4xl font-extrabold text-[#004ac6] leading-none mb-1">
                          {metrics.percentMetaAtingida}%
                        </p>
                        <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider">Atingido</span>
                      </div>
                    </div>

                    {/* Meta breakdowns info details */}
                    <div className="flex justify-between border-t border-gray-100 pt-4 text-center mt-2">
                      <div>
                        <p className="text-xs font-black text-[#004ac6]">{metrics.totalViagens}</p>
                        <p className="text-[9px] text-[#737686] font-bold uppercase tracking-wider mt-0.5">Realizadas</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-error">
                          {Math.max(0, metrics.metaGlobal - metrics.totalViagens)}
                        </p>
                        <p className="text-[9px] text-[#737686] font-bold uppercase tracking-wider mt-0.5">Restantes</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#0b1c30]">{metrics.metaGlobal}</p>
                        <p className="text-[9px] text-[#737686] font-bold uppercase tracking-wider mt-0.5">Meta global</p>
                      </div>
                    </div>
                  </div>

                  {/* Dentro vs Fora Pie with central label */}
                  <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white border border-[#c3c6d7]/30 rounded-xl p-6 shadow-xs flex flex-col justify-between min-h-[352px]">
                    <div>
                      <h4 className="text-xs font-bold text-[#0b1c30]">Dentro vs Fora da Meta</h4>
                      <p className="text-[11px] text-[#737686] mt-1">Distribuição de placas (meta ≥ 4 viagens)</p>
                    </div>

                    <div className="relative flex justify-center items-center my-4 h-36">
                      {/* Fully reactive clean SVG donut chart */}
                      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 42 42">
                        {/* Background track */}
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#eff4ff" strokeWidth="5" />
                        {/* Fora (Red fraction) */}
                        <circle
                          cx="21"
                          cy="21"
                          r="15.915"
                          fill="transparent"
                          stroke="var(--color-error)"
                          strokeWidth="5"
                          strokeDasharray={`${(metrics.foraMetaCount / (metrics.totalPlacas || 1)) * 100} ${100 - (metrics.foraMetaCount / (metrics.totalPlacas || 1)) * 100}`}
                          strokeDashoffset="0"
                          className="transition-all duration-1000"
                        />
                        {/* Dentro (Green fraction) */}
                        <circle
                          cx="21"
                          cy="21"
                          r="15.915"
                          fill="transparent"
                          stroke="var(--color-secondary)"
                          strokeWidth="5"
                          strokeDasharray={`${(metrics.dentroMetaCount / (metrics.totalPlacas || 1)) * 100} ${100 - (metrics.dentroMetaCount / (metrics.totalPlacas || 1)) * 100}`}
                          strokeDashoffset={`${100 - (metrics.foraMetaCount / (metrics.totalPlacas || 1)) * 100}`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      {/* Labeled overlay */}
                      <div className="absolute text-center flex flex-col justify-center items-center">
                        <p className="text-2xl sm:text-3xl font-black text-[#0b1c30] leading-none">{metrics.totalPlacas}</p>
                        <p className="text-[9px] text-[#737686] font-bold uppercase tracking-wider mt-1">Placas</p>
                      </div>
                    </div>

                    <div className="flex justify-center gap-6 border-t border-gray-100 pt-4 text-xs font-bold text-[#434655]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                        <span>Dentro ({metrics.dentroMetaCount})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-error" />
                        <span>Fora ({metrics.foraMetaCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Placas por Viagens card ranking */}
                  <div className="col-span-12 lg:col-span-6 bg-white border border-[#c3c6d7]/30 rounded-xl p-6 shadow-xs flex flex-col justify-between min-h-[352px]">
                    <div>
                      <h4 className="text-xs font-bold text-[#0b1c30]">Top Placas por Viagens</h4>
                      <p className="text-[11px] text-[#737686] mt-1">Ranking de produtividade da frota</p>
                    </div>

                    <div className="my-4 space-y-4 flex-1 justify-center flex flex-col">
                      {rankings.slice(0, 4).map((r, index) => {
                        const trophyColors = ["text-[#cca43b]", "text-[#737686]", "text-[#ab0b1c]"];
                        return (
                          <div key={r.placa} className="flex items-center gap-4">
                            <div className="w-8 h-8 flex items-center justify-center bg-[#eff4ff] rounded-lg">
                              {index < 3 ? (
                                <Award className={`w-4.5 h-4.5 ${trophyColors[index] || 'text-[#737686]'}`} />
                              ) : (
                                <span className="text-[11px] font-black text-[#737686]">{index + 1}</span>
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex justify-between items-center text-xs font-bold leading-none mb-1.5">
                                <span className="text-[#0b1c30]">{r.placa}</span>
                                <span className="text-[#004ac6] text-[10px]">{r.percentMeta}% meta</span>
                              </div>
                              <div className="w-full bg-[#eff4ff] h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#004ac6]"
                                  style={{ width: `${Math.min(100, (r.viagensCount / 4) * 100)}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-lg font-black text-[#004ac6] w-6 text-right leading-none">
                              {r.viagensCount}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => { updateActiveTab('vehiculos'); triggerToast("🚚 Ranking ampliado carregado com sucesso!"); }}
                      className="w-full py-2 bg-[#eff4ff] text-[#004ac6] text-xs font-bold rounded-lg hover:bg-[#004ac6]/10 transition-colors cursor-pointer mt-2"
                    >
                      Ver Ranking Completo
                    </button>
                  </div>
                </div>

                {/* Lower Charts row */}
                <div className="grid grid-cols-12 gap-6 mt-8">
                  {/* Faturamento por Placa Bar Chart horizontal with rounded ends */}
                  <div className="col-span-12 lg:col-span-8 bg-white border border-[#c3c6d7]/30 rounded-xl p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#0b1c30]">Faturamento por Placa</h4>
                      <p className="text-[11px] text-[#737686] mt-1 mb-6">Valor total faturado (R$)</p>
                    </div>

                    <div className="space-y-4">
                      {(() => {
                        const topRankings = rankings.slice(0, 6);
                        const maxFaturamentoPlaca = Math.max(...topRankings.map(r => r.faturamentoTotal), 1);
                        return topRankings.map((r) => {
                          const isHighPerf = r.viagensCount >= 4;
                          const formattedVal = r.faturamentoTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
                          const barWidthPercent = (r.faturamentoTotal / maxFaturamentoPlaca) * 100;
                          return (
                            <div key={r.placa} className="flex items-center gap-4 group">
                              <span className="w-20 text-[10px] font-extrabold text-[#434655] tracking-wider text-left leading-none uppercase">
                                {r.placa}
                              </span>
                              <div className="flex-1 bg-gray-50 h-7.5 rounded-md overflow-hidden flex items-center relative pr-4">
                                <motion.div
                                  initial={{ width: '0%' }}
                                  animate={{ width: `${Math.max(4, barWidthPercent)}%` }}
                                  transition={{ type: 'spring', stiffness: 45 }}
                                  className={`h-full ${isHighPerf ? 'bg-[#004ac6]' : 'bg-[#ab0b1c]'} rounded-r-md group-hover:opacity-90`}
                                />
                                <span className={`absolute right-4 text-[10.5px] font-black ${isHighPerf ? 'text-[#004ac6]' : 'text-[#ab0b1c]'}`}>
                                  R$ {formattedVal}
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* List of active top performance drivers styled inside clean bento card */}
                  <div className="col-span-12 lg:col-span-4 bg-white border border-[#c3c6d7]/30 rounded-xl p-6 shadow-xs flex flex-col justify-between min-h-[340px]">
                    <div>
                      <h4 className="text-xs font-bold text-[#0b1c30]">Top Motoristas</h4>
                      <p className="text-[11px] text-[#737686] mt-1 mb-6">Viagens concluídas e valores de frota</p>
                    </div>

                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                      {motoristas.slice(0, 4).map((m) => {
                        const isOverTarget = m.viagensRealizadas >= m.metaViagens;
                        return (
                          <div key={m.nome} className="flex items-center gap-3">
                            <img
                              alt={m.nome}
                              src={getDriverAvatar(m.nome)}
                              className="w-10 h-10 rounded-full object-cover border border-[#c3c6d7]/40 shadow-xs"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-center leading-none mb-1">
                                <span className="text-xs font-bold text-[#0b1c30] truncate max-w-[140px] uppercase">
                                  {m.nome.split(' ').slice(0, 2).join(' ')}
                                </span>
                                <span className="text-xs font-black text-[#004ac6]">{m.viagensRealizadas}</span>
                              </div>
                              <p className="text-[9px] text-[#737686] font-bold leading-none mb-1.5">
                                R$ {m.faturamento.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                              </p>
                              <div className="w-full bg-[#eff4ff] h-1 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${isOverTarget ? 'bg-[#004ac6]' : 'bg-secondary'}`}
                                  style={{ width: `${Math.min(100, (m.viagensRealizadas / m.metaViagens) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => { updateActiveTab('motoristas'); triggerToast("🧑‍✈️ Portal de motoristas carregado!"); }}
                      className="w-full py-2 bg-[#eff4ff] text-[#004ac6] text-xs font-bold rounded-lg hover:bg-[#004ac6]/10 transition-colors cursor-pointer mt-4"
                    >
                      Ver Todos os Motoristas
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* View tab: Veículos (Unique license plates with search highlighted) */}
            {activeTab === 'vehiculos' && (
              <motion.div
                key="vehiculos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-[10px] font-extrabold text-[#737686] uppercase tracking-widest leading-none">
                      Frotas de Distribuição
                    </h2>
                    <h3 className="text-xl font-bold mt-1 text-[#0b1c30]">Placas e Desempenho Operacional</h3>
                  </div>
                  <button
                    onClick={() => handleDownloadPDF('Relatorio_Frotas')}
                    className="border border-[#c3c6d7] text-[#0b1c30] hover:bg-gray-50 px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer active:scale-95 transition-all"
                  >
                    <Download className="w-4.5 h-4.5" /> Exportar Dados das Placas
                  </button>
                </header>

                {/* Painel de Ranking de Supervisores */}
                <div className="bg-white border border-[#c3c6d7]/30 rounded-2xl p-6 shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-sm font-black text-[#0b1c30] flex items-center gap-2">
                        🏆 Ranking de Produtividade dos Supervisores
                      </h4>
                      <p className="text-[11px] text-[#737686] mt-1 font-bold">
                        Calculado em tempo real com base na Meta Global do Supervisor de 90 viagens/mês. Passe o mouse sobre o supervisor para detalhamento completo.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#c3c6d7]/20">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#c3c6d7]/30 text-[#434655] text-[10px] font-extrabold uppercase tracking-wider bg-[#f8f9ff]">
                          <th className="px-4 py-3">Supervisor</th>
                          <th className="px-4 py-3 text-center">Veículos</th>
                          <th className="px-4 py-3 text-center">Viagens</th>
                          <th className="px-4 py-3 text-center">Dentro Meta</th>
                          <th className="px-4 py-3 text-center">Fora Meta</th>
                          <th className="px-4 py-3 text-right">Meta (%)</th>
                          <th className="px-4 py-3 text-right">Faturamento Bruto</th>
                          <th className="px-4 py-3 text-right">Despesa Oficina</th>
                          <th className="px-4 py-3 text-right">Faturamento Líquido</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs font-bold font-sans">
                        {supervisorRankings.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center py-8 text-xs text-[#737686]">
                              Nenhum supervisor correspondente aos filtros selecionados.
                            </td>
                          </tr>
                        ) : (
                          supervisorRankings.map((sup, pos) => {
                            const medal = pos === 0 ? "🥇" : pos === 1 ? "🥈" : pos === 2 ? "🥉" : `${pos + 1}º`;
                            return (
                              <tr key={sup.supervisor} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3.5 text-[#0b1c30]">
                                  <SupervisorTooltip supData={sup}>
                                    <div className="flex items-center gap-2 cursor-help select-none">
                                      <span className="text-sm font-black shrink-0">{medal}</span>
                                      <span className="uppercase font-extrabold truncate max-w-[125px] inline-block">{sup.supervisor}</span>
                                    </div>
                                  </SupervisorTooltip>
                                </td>
                                <td className="px-4 py-3.5 text-center text-[#434655]">
                                  {sup.qtdVeiculos}
                                </td>
                                <td className="px-4 py-3.5 text-center text-[#0b1c30]">
                                  {sup.qtdViagens}
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                  <span className="bg-[#6cf8bb]/15 px-2.5 py-1 rounded text-[10px] font-extrabold text-[#00714d] border border-[#6cf8bb]/30 whitespace-nowrap">
                                    {sup.placasDentroMeta} plac{sup.placasDentroMeta === 1 ? 'a' : 'as'}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                  <span className="bg-rose-500/10 px-2.5 py-1 rounded text-[10px] font-extrabold text-[#ab0b1c] border border-rose-500/20 whitespace-nowrap">
                                    {sup.placasForaMeta} plac{sup.placasForaMeta === 1 ? 'a' : 'as'}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-right font-black">
                                  <div className="flex items-center justify-end gap-2">
                                    <span className={`text-[11px] font-black ${
                                      sup.metaAtingidaPercent >= 100 ? 'text-[#00714d]' : 'text-error'
                                    }`}>
                                      {sup.metaAtingidaPercent}%
                                    </span>
                                  </div>
                                  <div className="w-20 bg-gray-100 h-1 rounded-full overflow-hidden ml-auto mt-1">
                                    <div
                                      className={`h-full ${sup.metaAtingidaPercent >= 100 ? 'bg-[#00714d]' : 'bg-error'}`}
                                      style={{ width: `${Math.min(100, sup.metaAtingidaPercent)}%` }}
                                    />
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 text-right font-extrabold text-[#434655] whitespace-nowrap">
                                  R$ {sup.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3.5 text-right font-extrabold text-rose-600 whitespace-nowrap">
                                  R$ {sup.despesaOficina.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3.5 text-right font-black text-[#004ac6] whitespace-nowrap">
                                  R$ {sup.faturamentoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Grid de Veículos */}
                <div>
                  <h4 className="text-xs font-extrabold text-[#737686] uppercase tracking-wider mb-4">
                    Desempenho por Placas Individuais ({rankings.length} veículo{rankings.length === 1 ? '' : 's'})
                  </h4>
                  
                  {rankings.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-[#c3c6d7]/30 text-[#737686] font-bold text-xs">
                      Nenhum veículo corresponde aos filtros ou busca ativa.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {rankings.map((r, idx) => {
                        const isMetaMet = r.viagensCount >= 4;
                        const associatedViagens = viagens.filter(v => v.placa === r.placa);
                        const lastRoute = associatedViagens[0]?.rota || 'Sem rota programada';

                        return (
                          <PlateTooltip key={r.placa} plateData={r}>
                            <div className="bg-white border border-[#c3c6d7]/30 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#004ac6] transition-all h-full select-none">
                              <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                  <span className="text-sm font-black text-[#0b1c30] tracking-wide bg-[#eff4ff] px-2.5 py-1 rounded-lg border border-[#c3c6d7]/30 font-mono">
                                    {r.placa}
                                  </span>
                                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                    isMetaMet ? 'bg-[#6cf8bb]/20 text-[#00714d]' : 'bg-[#ffdad6] text-[#ab0b1c]'
                                  }`}>
                                    {isMetaMet ? '✓ META DENTRO' : '⚠ FORA DA META'}
                                  </span>
                                </div>

                                <div>
                                  <p className="text-[9px] text-[#737686] font-bold uppercase tracking-wider">Última Rota Detectada</p>
                                  <p className="text-xs font-bold text-[#0b1c30] truncate mt-1">{lastRoute}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 bg-[#f8f9ff] p-3 rounded-xl border border-[#c3c6d7]/20">
                                  <div>
                                    <p className="text-[9px] text-[#737686] font-extrabold">FATURAMENTO</p>
                                    <p className="text-xs font-black text-[#004ac6] mt-0.5">
                                      R$ {(r.faturamentoTotal / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-[#737686] font-extrabold">VIAGENS</p>
                                    <p className="text-xs font-black text-[#0b1c30] mt-0.5">
                                      {r.viagensCount}/4 viagens
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-5 space-y-2">
                                <div className="flex justify-between text-[11px] font-bold text-[#434655]">
                                  <span>Meta Atingida</span>
                                  <span>{r.percentMeta}%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${isMetaMet ? 'bg-[#00714d]' : 'bg-error'}`}
                                    style={{ width: `${Math.min(100, r.percentMeta)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </PlateTooltip>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* View tab: Motoristas (Driver individual performance report view with photo headers, targets) */}
            {activeTab === 'motoristas' && (
              <motion.div
                key="motoristas"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-[10px] font-extrabold text-[#737686] uppercase tracking-widest leading-none">
                      Performance Individual
                    </h2>
                    <h3 className="text-xl font-bold mt-1 text-[#0b1c30]">Ranking de Produtividade dos Motoristas</h3>
                  </div>
                  <button
                    onClick={() => handleDownloadPDF('Relatorio_Faturamento_Motoristas')}
                    className="bg-[#004ac6] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 hover:bg-opacity-95 shadow-md w-full sm:w-auto justify-center"
                  >
                    <Download className="w-4 h-4" /> Exportar PDF da Escala
                  </button>
                </header>

                {/* Driver executive mini dashboard */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  <div className="bg-white p-4 border border-[#c3c6d7]/30 rounded-xl">
                    <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider">Faturamento Total</span>
                    <p className="text-lg font-black text-[#004ac6] mt-1.5">
                      R$ {metrics.faturamentoTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="bg-white p-4 border border-[#c3c6d7]/30 rounded-xl">
                    <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider">Total de Viagens</span>
                    <p className="text-lg font-black text-[#0b1c30] mt-1.5">{metrics.totalViagens}</p>
                  </div>
                  <div className="bg-white p-4 border border-[#c3c6d7]/30 rounded-xl">
                    <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider">Motoristas Ativos</span>
                    <p className="text-lg font-black text-[#0b1c30] mt-1.5">{motoristas.length}</p>
                  </div>
                  <div className="bg-white p-4 border border-[#c3c6d7]/30 rounded-xl border-l-4 border-l-secondary">
                    <span className="text-[9px] text-secondary font-bold uppercase tracking-wider">Metas Concluídas</span>
                    <p className="text-lg font-black text-secondary mt-1.5">
                      {motoristas.filter(m => m.viagensRealizadas >= m.metaViagens).length}
                    </p>
                  </div>
                  <div className="bg-white p-4 border border-[#c3c6d7]/30 rounded-xl border-l-4 border-l-error">
                    <span className="text-[9px] text-error font-bold uppercase tracking-wider">Fora da Meta</span>
                    <p className="text-lg font-black text-error mt-1.5">
                      {motoristas.filter(m => m.viagensRealizadas < m.metaViagens).length}
                    </p>
                  </div>
                </div>

                {/* Grid performance card list */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {motoristas.map((m) => {
                    const isMetaAtingida = m.viagensRealizadas >= m.metaViagens;
                    return (
                      <div
                        key={m.nome}
                        className="bg-white p-6 rounded-2xl border border-[#c3c6d7]/30 flex flex-col justify-between hover:shadow-md hover:border-[#004ac6] transition-all group cursor-pointer"
                        onClick={() => setSelectedDriverName(m.nome)}
                      >
                        <div className="space-y-5">
                          {/* Card driver header with premium tags */}
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              <img
                                alt={m.nome}
                                src={getDriverAvatar(m.nome)}
                                className="w-14 h-14 rounded-full object-cover border-2 border-secondary shadow-sm"
                              />
                              {isMetaAtingida && (
                                <div className="absolute -top-1 -right-1 bg-secondary-container text-on-secondary-container w-5.5 h-5.5 rounded-full flex items-center justify-center border border-white shadow-xs">
                                  <Award className="w-3 h-3 text-[#00714d]" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <h4 className="text-sm font-extrabold text-[#0b1c30] group-hover:text-[#004ac6] transition-colors leading-tight">
                                {m.nome}
                              </h4>
                              <p className="text-[10px] text-[#737686] mt-0.5 font-semibold">ID: {m.id} • {m.categoria}</p>
                              <div className="flex gap-2 mt-1.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                                  isMetaAtingida
                                    ? 'bg-[#6cf8bb]/20 text-[#00714d]'
                                    : 'bg-[#ffdad6] text-[#ab0b1c]'
                                }`}>
                                  {isMetaAtingida ? '✓ Meta Atingida' : '⚠ Fora da Meta'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Driver breakdown numbers */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-xl border border-[#c3c6d7]/20">
                              <p className="text-[9px] text-[#737686] font-bold uppercase tracking-wider">Faturamento</p>
                              <p className="text-xs font-black text-[#004ac6] mt-0.5">
                                R$ {m.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-[#c3c6d7]/20">
                              <p className="text-[9px] text-[#737686] font-bold uppercase tracking-wider">Viagens</p>
                              <p className="text-xs font-black text-[#0b1c30] mt-0.5">
                                {m.viagensRealizadas} / {m.metaViagens} meta
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Individual progress bar details */}
                        <div className="space-y-2 mt-5">
                          <div className="flex justify-between items-center text-xs font-bold text-[#434655]">
                            <span>Progresso Individual</span>
                            <span className={isMetaAtingida ? 'text-secondary' : 'text-error'}>{m.percentProgresso}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${isMetaAtingida ? 'bg-[#004ac6]' : 'bg-error'}`}
                              style={{ width: `${Math.min(100, m.percentProgresso)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* View tab: Rotas (Route performance and tracking layout) */}
            {activeTab === 'rotas' && (
              <motion.div
                key="rotas"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-[10px] font-extrabold text-[#737686] uppercase tracking-widest leading-none">
                      Gerenciamento de Rotas
                    </h2>
                    <h3 className="text-xl font-bold mt-1 text-[#0b1c30]">Produtividade e Mapeamento Logístico</h3>
                  </div>
                  <button
                    onClick={() => handleDownloadPDF('Relatorio_Produtividade_Rotas')}
                    className="border border-[#c3c6d7] text-[#0b1c30] hover:bg-gray-50 px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Download className="w-4.5 h-4.5" /> Planilha de Trajetos
                  </button>
                </header>

                <div className="grid grid-cols-12 gap-6">
                  {/* Productivity bar charts */}
                  <div className="col-span-12 lg:col-span-7 bg-white p-6 border border-[#c3c6d7]/30 rounded-2xl shadow-xs">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-xs font-bold text-[#0b1c30]">Produtividade por Rota</h4>
                      <span className="text-[10px] font-bold text-[#004ac6] bg-[#eff4ff] px-2 py-0.5 rounded">
                        Clique em uma rota para detalhar
                      </span>
                    </div>
                    <p className="text-[11px] text-[#737686] mb-6">Média de dias vs Meta de Viagem</p>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                      {rotas.map((route) => {
                        const isHighDays = route.avgDays > 4.5;
                        const isSelected = selectedRouteName === route.rota;
                        return (
                          <div 
                            key={route.rota} 
                            onClick={() => setSelectedRouteName(route.rota)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer select-none space-y-2 ${
                              isSelected 
                                ? 'bg-[#eff4ff]/60 border-[#004ac6] shadow-xs' 
                                : 'bg-transparent border-[#c3c6d7]/30 hover:bg-slate-50/80 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-[#0b1c30] truncate max-w-[360px] font-extrabold uppercase font-sans">
                                {route.rota}
                              </span>
                              <span className="text-[#004ac6] font-extrabold shrink-0">
                                {route.avgDays} dias em média ({route.totalTrips} viagens)
                              </span>
                            </div>
                            <div className="w-full bg-[#eff4ff] h-3.5 rounded-sm overflow-hidden flex items-center relative">
                              <div
                                className={`h-full ${isHighDays ? 'bg-error' : 'bg-[#004ac6]'} rounded-r-md`}
                                style={{ width: `${Math.min(100, (route.avgDays / 7) * 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic sidepanel route details replacing Monitoramento Ativo */}
                  {selectedRouteDetails ? (
                    <div className="col-span-12 lg:col-span-5 bg-[#0b1c30] text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[480px] border border-white/5 relative overflow-hidden font-sans">
                      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
                      
                      <div className="space-y-5 relative z-10 w-full">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b border-white/10 pb-4">
                          <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Painel Dinâmico</p>
                            <h4 className="text-sm font-black mt-1 uppercase text-white tracking-tight">Detalhamento da Rota</h4>
                          </div>
                          <button 
                            onClick={() => setSelectedRouteName(null)}
                            className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xs font-bold bg-white/5 px-2.5 py-1 rounded-md border border-white/10"
                          >
                            Limpar
                          </button>
                        </div>

                        {/* Route Selected Name */}
                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                          <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Rota Selecionada</p>
                          <p className="text-xs font-black text-white mt-1 leading-tight flex items-center gap-1.5 uppercase font-sans">
                            <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                            {selectedRouteDetails.rota}
                          </p>
                        </div>

                        {/* KPI block standard metrics */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Quantidade de Viagens</span>
                            <p className="text-sm font-black text-white mt-1 flex items-baseline gap-1 font-sans">
                              {selectedRouteDetails.viagensCount} <span className="text-[10px] font-normal text-gray-400">viagens</span>
                            </p>
                          </div>

                          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Média de Dias</span>
                            <p className="text-sm font-black text-white mt-1 flex items-baseline gap-1 font-sans">
                              {selectedRouteDetails.avgDays} <span className="text-[10px] font-normal text-gray-400">dias</span>
                            </p>
                          </div>

                          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Quantidade de Motoristas</span>
                            <p className="text-sm font-black text-white mt-1 flex items-baseline gap-1 font-sans">
                              {selectedRouteDetails.driversCount} <span className="text-[10px] font-normal text-gray-400">motoristas</span>
                            </p>
                          </div>

                          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Quantidade de Veículos</span>
                            <p className="text-sm font-black text-white mt-1 flex items-baseline gap-1 font-sans">
                              {selectedRouteDetails.vehiclesCount} <span className="text-[10px] font-normal text-gray-400">veículos</span>
                            </p>
                          </div>
                        </div>

                        {/* Financial indicators block */}
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2.5">
                          <div className="flex justify-between items-center text-xs">
                             <span className="text-gray-400 font-bold">Faturamento Total</span>
                             <span className="font-extrabold text-[#eff4ff]">
                               R$ {selectedRouteDetails.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                             </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                             <span className="text-gray-400 font-bold">Despesa Oficina</span>
                             <span className="font-extrabold text-rose-300">
                               R$ {selectedRouteDetails.despesaOficina.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                             </span>
                          </div>
                          <div className="border-t border-white/10 pt-2.5 flex justify-between items-center text-sm font-black">
                            <span className="text-[#6cf8bb] font-black tracking-wide uppercase text-[10px]">Faturamento Líquido</span>
                            <span className="text-[#6cf8bb]">
                              R$ {selectedRouteDetails.faturamentoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        {/* Seção: Motoristas que realizaram esta rota */}
                        <div className="space-y-2 border-t border-white/10 pt-4">
                          <h5 className="text-[10px] font-black tracking-wider uppercase text-blue-400 font-sans">
                            Motoristas que realizaram esta rota
                          </h5>
                          <div className="max-h-48 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
                            {selectedRouteDetails.drivers.map((drv) => (
                              <div 
                                key={drv.nome} 
                                onClick={() => setSelectedDriverName(drv.nome)}
                                className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-colors"
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <User className="w-4 h-4 text-blue-400 shrink-0" />
                                  <div className="truncate">
                                    <span className="text-xs font-extrabold text-white truncate block uppercase font-sans hover:text-[#004ac6] transition-colors">
                                      {drv.nome}
                                    </span>
                                    <span className="text-[10px] text-gray-400 block font-sans">
                                      {drv.viagens} {drv.viagens === 1 ? 'viagem' : 'viagens'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-xs font-extrabold text-[#6cf8bb] block font-sans">
                                    R$ {drv.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Seção: Veículos Utilizados */}
                        <div className="space-y-2 border-t border-white/10 pt-4 pb-1">
                          <h5 className="text-[10px] font-black tracking-wider uppercase text-blue-400 font-sans">
                            Veículos Utilizados
                          </h5>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                            {selectedRouteDetails.vehicles.map((v) => (
                              <div 
                                key={v.placa}
                                className="bg-white/10 border border-white/10 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 text-white shadow-xs font-sans"
                              >
                                <Truck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <span className="font-mono">{v.placa}</span>
                                <span className="text-[10px] text-gray-300 font-sans">( {v.viagensCount} )</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="col-span-12 lg:col-span-5 bg-[#0b1c30] text-white p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center min-h-[480px] border border-white/5 relative overflow-hidden select-none">
                      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
                      <div className="p-4 bg-white/5 rounded-full mb-4 border border-white/10 text-blue-400">
                        <Route className="w-8 h-8 animate-pulse" />
                       </div>
                      <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-sans">Detalhamento da Rota</h4>
                      <p className="text-xs text-gray-400 max-w-xs mt-2 leading-relaxed">
                        Selecione uma rota para visualizar os motoristas, veículos e indicadores.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* View tab: Relatórios (Advanced listings with full functional filters, searches, paginations) */}
            {activeTab === 'relatorios' && (
              <motion.div
                key="relatorios"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-[10px] font-extrabold text-[#737686] uppercase tracking-widest leading-none">
                      Exportações e Buscas
                    </h2>
                    <h3 className="text-xl font-bold mt-1 text-[#0b1c30]">Filtros e Detalhamento de Viagens</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setIsLogoSettingsOpen(true)}
                      className="bg-white text-[#004ac6] border border-[#004ac6] px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 hover:bg-slate-50 shadow-sm w-full justify-center whitespace-nowrap"
                    >
                      <Upload className="w-4 h-4 text-[#004ac6]" /> Inserir Logotipo
                    </button>
                    <button
                      onClick={() => handleDownloadPDF('Despacho_Frota_Completo')}
                      className="bg-[#004ac6] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 hover:bg-opacity-95 shadow-md w-full justify-center"
                    >
                      <Download className="w-4 h-4" /> Exportar Planilha Excel/CSV
                    </button>
                  </div>
                </header>

                {/* Simulated filters panel container */}
                <div className="bg-white p-6 border border-[#c3c6d7]/30 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#434655] uppercase tracking-wider">
                    <SlidersHorizontal className="w-4 h-4 text-[#004ac6]" />
                    Filtros Avançados
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Filter Placa */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#434655]">Placa</label>
                      <input
                        type="text"
                        placeholder="Ex: MVU-8632"
                        value={filterPlaca}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFilterPlaca(val);
                          localStorage.setItem('filter_placa', val);
                          updateCurrentPage(1);
                        }}
                        className="w-full p-2.5 bg-[#f8f9ff] text-xs font-bold text-[#0b1c30] border border-[#c3c6d7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                      />
                    </div>

                    {/* Filter Motoristas */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#434655]">Motorista</label>
                      <select
                        value={filterMotorista}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFilterMotorista(val);
                          localStorage.setItem('filter_motorista', val);
                          updateCurrentPage(1);
                        }}
                        className="w-full p-2.5 bg-[#f8f9ff] text-xs font-extrabold text-[#0b1c30] border border-[#c3c6d7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                      >
                        <option value="ALL">Todos os Motoristas</option>
                        {uniqueMotoristas.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filter Supervisão */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#434655]">Supervisão</label>
                      <select
                        value={filterSupervisao}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFilterSupervisao(val);
                          localStorage.setItem('filter_supervisao', val);
                          updateCurrentPage(1);
                        }}
                        className="w-full p-2.5 bg-[#f8f9ff] text-xs font-extrabold text-[#0b1c30] border border-[#c3c6d7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                      >
                        <option value="ALL">Todas as Supervisões</option>
                        {uniqueSupervisores.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Reset Filters button */}
                  {(filterPlaca || filterMotorista !== 'ALL' || filterSupervisao !== 'ALL') && (
                    <button
                      onClick={() => {
                        setFilterPlaca('');
                        setFilterMotorista('ALL');
                        setFilterSupervisao('ALL');
                        localStorage.removeItem('filter_placa');
                        localStorage.removeItem('filter_motorista');
                        localStorage.removeItem('filter_supervisao');
                        updateCurrentPage(1);
                        triggerToast("🧹 Filtros redefinidos!");
                      }}
                      className="text-[#004ac6] text-xs font-bold hover:underline"
                    >
                      Limpar Filtros Activos
                    </button>
                  )}
                </div>

                {/* Tabulated table listing of trips */}
                <div className="bg-white border border-[#c3c6d7]/30 rounded-2xl shadow-xs overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#f8f9ff]">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4.5 h-4.5 text-[#004ac6]" />
                      <span className="text-xs font-extrabold uppercase tracking-wide text-[#0b1c30]">
                        Viagens Importadas do Sistema
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#434655]">
                      Exibindo {Math.min(filteredAdvancedViagens.length, (currentPage - 1) * itemsPerPage + 1)}-
                      {Math.min(filteredAdvancedViagens.length, currentPage * itemsPerPage)} de {filteredAdvancedViagens.length} resultados
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#f8f9ff] text-[10px] font-bold uppercase tracking-wider text-[#434655] border-b border-[#c3c6d7]/20">
                        <tr>
                          <th className="px-5 py-3">Tipo Veículo</th>
                          <th className="px-5 py-3">Rota</th>
                          <th className="px-5 py-3">Conhecimento</th>
                          <th className="px-5 py-3">Placa</th>
                          <th className="px-5 py-3">Motorista</th>
                          <th className="px-5 py-3">Km Rodado</th>
                          <th className="px-5 py-3 text-right">Valor Carga</th>
                          <th className="px-5 py-3 text-center">Dias</th>
                          <th className="px-5 py-3 text-center">Meta</th>
                          <th className="px-5 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#c3c6d7]/10 text-xs font-medium">
                        {paginatedViagens.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="px-5 py-12 text-center text-[#737686] font-bold">
                              Nenhuma viagem encontrada com os parâmetros configurados.
                            </td>
                          </tr>
                        ) : (
                          paginatedViagens.map((v) => {
                            // Find out if the plate of this trip is overall above target isMet
                            const plateRankData = rankings.find(r => r.placa === v.placa);
                            const isMet = plateRankData ? plateRankData.viagensCount >= 4 : false;

                            return (
                              <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-5 py-3.5 text-gray-500 truncate max-w-[140px]">{v.tipoVeiculo}</td>
                                <td className="px-5 py-3.5 text-[#0b1c30] font-bold truncate max-w-[200px]">{v.rota}</td>
                                <td className="px-5 py-3.5 text-gray-500 font-mono">{v.id}</td>
                                <td className="px-5 py-3.5">
                                  <span className="bg-[#eff4ff] border border-[#c3c6d7]/30 px-2 py-0.5 rounded-md font-bold text-[#0b1c30]">
                                    {v.placa}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 text-[#0b1c30] uppercase font-bold">{v.motorista}</td>
                                <td className="px-5 py-3.5 text-right font-bold text-[#434655]">{v.kmRodado} Km</td>
                                <td className="px-5 py-3.5 text-right font-black text-[#004ac6]">
                                  R$ {v.valorCarga.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-5 py-3.5 text-center font-bold text-[#434655]">{v.qtdDias}</td>
                                <td className="px-5 py-3.5 text-center text-[#737686]">{v.metaViagem}</td>
                                <td className="px-5 py-3.5 text-center">
                                  <span className={`px-2 py-0.5 rounded-sm text-[9px] font-extrabold ${
                                    isMet ? 'bg-[#6cf8bb]/30 text-[#00714d]' : 'bg-[#ffdad6] text-[#ab0b1c]'
                                  }`}>
                                    {isMet ? 'NO PRAZO' : 'FORA DA META'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Standard pagination block navigation */}
                  {totalPages > 1 && (
                    <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-[#f8f9ff]">
                      <button
                        onClick={() => updateCurrentPage(Math.max(1, activePage - 1))}
                        disabled={activePage === 1}
                        className="px-3.5 py-1.5 border border-[#c3c6d7] text-xs font-bold rounded-lg text-[#0b1c30] hover:bg-white disabled:opacity-40"
                      >
                        Anterior
                      </button>

                      <div className="flex gap-2 text-xs font-bold">
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => updateCurrentPage(i + 1)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                              activePage === i + 1
                                ? 'bg-[#004ac6] border-[#004ac6] text-white'
                                : 'border-[#c3c6d7] hover:bg-white text-[#0b1c30]'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => updateCurrentPage(Math.min(totalPages, activePage + 1))}
                        disabled={activePage === totalPages}
                        className="px-3.5 py-1.5 border border-[#c3c6d7] text-xs font-bold rounded-lg text-[#0b1c30] hover:bg-white disabled:opacity-40"
                      >
                        Próximo
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* View tab: Comparativo Mensal (Percentage variation of Faturamento Líquido and other Key indicators vs previous month) */}
            {activeTab === 'comparativo' && (
              <motion.div
                key="comparativo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-[10px] font-extrabold text-[#737686] uppercase tracking-widest leading-none">
                      Desempenho e Variação Temporal
                    </h2>
                    <h3 className="text-xl font-bold mt-1 text-[#0b1c30]">Comparativo Mensal & Variações MoM</h3>
                  </div>
                  
                  {/* Select reference month directly on the page */}
                  {comparativoMensal.length > 0 && (
                    <div className="flex items-center gap-3 self-stretch sm:self-auto bg-white border border-[#c3c6d7]/30 px-3 py-1.5 rounded-xl shadow-xs">
                      <span className="text-xs font-bold text-[#434655]">Mês de Referência:</span>
                      <select
                        value={selectedComparisonKey || ''}
                        onChange={(e) => setSelectedComparisonKey(e.target.value)}
                        className="bg-[#f8f9ff] text-xs font-bold text-[#0b1c30] px-3 py-2 rounded-lg border border-[#c3c6d7] focus:outline-none focus:ring-1 focus:ring-[#004ac6] cursor-pointer"
                      >
                        {comparativoMensal.map((item) => (
                          <option key={item.key} value={item.key}>
                            {item.mesNome}/{item.ano}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </header>

                {comparativoMensal.length === 0 ? (
                  <div className="bg-white p-12 border border-[#c3c6d7]/30 rounded-2xl text-center space-y-2">
                    <p className="text-gray-400 font-bold">Nenhum dado mensal disponível.</p>
                    <p className="text-xs text-gray-400">Verifique os filtros selecionados ou faça uma nova importação de planilha.</p>
                  </div>
                ) : (() => {
                  const activeIndex = comparativoMensal.findIndex(c => c.key === selectedComparisonKey);
                  const currentComp = activeIndex !== -1 ? comparativoMensal[activeIndex] : comparativoMensal[comparativoMensal.length - 1];
                  const previousComp = activeIndex > 0 ? comparativoMensal[activeIndex - 1] : null;

                  const formatPercent = (val: number) => {
                    const sign = val >= 0 ? '+' : '';
                    return `${sign}${val.toFixed(1)}%`;
                  };

                  const formatMoney = (val: number) => {
                    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                  };

                  const formatDiffMoney = (curr: number, prev: number | null) => {
                    if (prev === null) return 'N/A';
                    const diff = curr - prev;
                    const sign = diff >= 0 ? '+' : '';
                    return `${sign}${diff.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
                  };

                  const formatDiffNum = (curr: number, prev: number | null) => {
                    if (prev === null) return 'N/A';
                    const diff = curr - prev;
                    const sign = diff >= 0 ? '+' : '';
                    return `${sign}${diff}`;
                  };

                  return (
                    <div className="space-y-6">
                      {/* Comparison KPI Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* KPI 1: Faturamento Líquido */}
                        <div className="bg-white p-6 border-l-4 border-l-[#6cf8bb] border font-sans border-[#c3c6d7]/30 rounded-2xl shadow-xs hover:shadow-md transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[11px] font-bold text-[#737686] uppercase tracking-wider block">Faturamento Líquido</span>
                              <h4 className="text-xl font-black text-[#0b1c30] mt-1.5">{formatMoney(currentComp.faturamentoLiquido)}</h4>
                            </div>
                            <div className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                              !previousComp ? 'bg-gray-100 text-gray-500' :
                              currentComp.varFaturamentoLiquido >= 0 ? 'bg-[#6cf8bb]/15 text-[#00714d]' : 'bg-rose-500/10 text-rose-600'
                            }`}>
                              {previousComp ? formatPercent(currentComp.varFaturamentoLiquido) : 'Início'}
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-[#434655]">
                            <div>
                              <span className="opacity-75 block text-[10px] uppercase">Mês Anterior ({previousComp ? previousComp.mesNome : 'N/A'})</span>
                              <span>{previousComp ? formatMoney(previousComp.faturamentoLiquido) : '------'}</span>
                            </div>
                            <div className="text-right">
                              <span className="opacity-75 block text-[10px] uppercase">Diferença</span>
                              <span className={!previousComp ? 'text-gray-400' : (currentComp.faturamentoLiquido - (previousComp?.faturamentoLiquido || 0) >= 0 ? 'text-[#00714d]' : 'text-rose-600')}>
                                {formatDiffMoney(currentComp.faturamentoLiquido, previousComp ? previousComp.faturamentoLiquido : null)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* KPI 2: Faturamento Bruto */}
                        <div className="bg-white p-6 border-l-4 border-l-[#004ac6] border font-sans border-[#c3c6d7]/30 rounded-2xl shadow-xs hover:shadow-md transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[11px] font-bold text-[#737686] uppercase tracking-wider block">Faturamento Bruto</span>
                              <h4 className="text-xl font-black text-[#0b1c30] mt-1.5">{formatMoney(currentComp.faturamentoBruto)}</h4>
                            </div>
                            <div className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                              !previousComp ? 'bg-gray-100 text-gray-500' :
                              currentComp.varFaturamentoBruto >= 0 ? 'bg-[#6cf8bb]/15 text-[#00714d]' : 'bg-rose-500/10 text-rose-600'
                            }`}>
                              {previousComp ? formatPercent(currentComp.varFaturamentoBruto) : 'Início'}
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-[#434655]">
                            <div>
                              <span className="opacity-75 block text-[10px] uppercase">Mês Anterior ({previousComp ? previousComp.mesNome : 'N/A'})</span>
                              <span>{previousComp ? formatMoney(previousComp.faturamentoBruto) : '------'}</span>
                            </div>
                            <div className="text-right">
                              <span className="opacity-75 block text-[10px] uppercase">Diferença</span>
                              <span className={!previousComp ? 'text-gray-400' : (currentComp.faturamentoBruto - (previousComp?.faturamentoBruto || 0) >= 0 ? 'text-[#00714d]' : 'text-rose-600')}>
                                {formatDiffMoney(currentComp.faturamentoBruto, previousComp ? previousComp.faturamentoBruto : null)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* KPI 3: Despesa Oficina */}
                        <div className="bg-white p-6 border-l-4 border-l-rose-500 border font-sans border-[#c3c6d7]/30 rounded-2xl shadow-xs hover:shadow-md transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[11px] font-bold text-[#737686] uppercase tracking-wider block">Despesas Oficina</span>
                              <h4 className="text-xl font-black text-[#0b1c30] mt-1.5">{formatMoney(currentComp.despesaOficina)}</h4>
                            </div>
                            {/* For expense, we want a low value, so increase (positive %) is bad (shown in red) and decrease is good (shown in green) */}
                            <div className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                              !previousComp ? 'bg-gray-100 text-gray-500' :
                              currentComp.varDespesaOficina <= 0 ? 'bg-[#6cf8bb]/15 text-[#00714d]' : 'bg-rose-500/10 text-rose-600'
                            }`}>
                              {previousComp ? formatPercent(currentComp.varDespesaOficina) : 'Início'}
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-[#434655]">
                            <div>
                              <span className="opacity-75 block text-[10px] uppercase">Mês Anterior ({previousComp ? previousComp.mesNome : 'N/A'})</span>
                              <span>{previousComp ? formatMoney(previousComp.despesaOficina) : '------'}</span>
                            </div>
                            <div className="text-right">
                              <span className="opacity-75 block text-[10px] uppercase">Diferença</span>
                              <span className={!previousComp ? 'text-gray-400' : (currentComp.despesaOficina - (previousComp?.despesaOficina || 0) <= 0 ? 'text-[#00714d]' : 'text-rose-600')}>
                                {formatDiffMoney(currentComp.despesaOficina, previousComp ? previousComp.despesaOficina : null)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* KPI 4: Viagens Realizadas */}
                        <div className="bg-white p-6 border border-[#c3c6d7]/30 rounded-2xl shadow-xs hover:shadow-md transition-all font-sans">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[11px] font-bold text-[#737686] uppercase tracking-wider block">Total de Viagens (MoM)</span>
                              <h4 className="text-xl font-black text-[#0b1c30] mt-1.5">{currentComp.qtdViagens} viagens</h4>
                            </div>
                            <div className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                              !previousComp ? 'bg-gray-100 text-gray-500' :
                              currentComp.varQtdViagens >= 0 ? 'bg-[#6cf8bb]/15 text-[#00714d]' : 'bg-rose-500/10 text-rose-600'
                            }`}>
                              {previousComp ? formatPercent(currentComp.varQtdViagens) : 'Início'}
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-[#434655]">
                            <div>
                              <span className="opacity-75 block text-[10px] uppercase">Mês Anterior ({previousComp ? previousComp.mesNome : 'N/A'})</span>
                              <span>{previousComp ? `${previousComp.qtdViagens} viagens` : '------'}</span>
                            </div>
                            <div className="text-right">
                              <span className="opacity-75 block text-[10px] uppercase">Diferença</span>
                              <span className={!previousComp ? 'text-gray-400' : (currentComp.qtdViagens - (previousComp?.qtdViagens || 0) >= 0 ? 'text-[#00714d]' : 'text-rose-600')}>
                                {formatDiffNum(currentComp.qtdViagens, previousComp ? previousComp.qtdViagens : null)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* KPI 5: Veículos Ativos */}
                        <div className="bg-white p-6 border border-[#c3c6d7]/30 rounded-2xl shadow-xs hover:shadow-md transition-all font-sans">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[11px] font-bold text-[#737686] uppercase tracking-wider block">Veículos Ativos (MoM)</span>
                              <h4 className="text-xl font-black text-[#0b1c30] mt-1.5">{currentComp.qtdVeiculos} veículos</h4>
                            </div>
                            <div className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                              !previousComp ? 'bg-gray-100 text-gray-500' :
                              currentComp.varQtdVeiculos >= 0 ? 'bg-[#6cf8bb]/15 text-[#00714d]' : 'bg-rose-500/10 text-rose-600'
                            }`}>
                              {previousComp ? formatPercent(currentComp.varQtdVeiculos) : 'Início'}
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-[#434655]">
                            <div>
                              <span className="opacity-75 block text-[10px] uppercase">Mês Anterior ({previousComp ? previousComp.mesNome : 'N/A'})</span>
                              <span>{previousComp ? `${previousComp.qtdVeiculos} veículos` : '------'}</span>
                            </div>
                            <div className="text-right">
                              <span className="opacity-75 block text-[10px] uppercase">Diferença</span>
                              <span className={!previousComp ? 'text-gray-400' : (currentComp.qtdVeiculos - (previousComp?.qtdVeiculos || 0) >= 0 ? 'text-[#00714d]' : 'text-rose-600')}>
                                {formatDiffNum(currentComp.qtdVeiculos, previousComp ? previousComp.qtdVeiculos : null)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* KPI 6: Distância Km */}
                        <div className="bg-white p-6 border border-[#c3c6d7]/30 rounded-2xl shadow-xs hover:shadow-md transition-all font-sans">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[11px] font-bold text-[#737686] uppercase tracking-wider block">Distância Total (MoM)</span>
                              <h4 className="text-xl font-black text-[#0b1c30] mt-1.5">{currentComp.kmRodado.toLocaleString('pt-BR')} Km</h4>
                            </div>
                            <div className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                              !previousComp ? 'bg-gray-100 text-gray-500' :
                              currentComp.varKmRodado >= 0 ? 'bg-[#6cf8bb]/15 text-[#00714d]' : 'bg-rose-500/10 text-rose-600'
                            }`}>
                              {previousComp ? formatPercent(currentComp.varKmRodado) : 'Início'}
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-[#434655]">
                            <div>
                              <span className="opacity-75 block text-[10px] uppercase">Mês Anterior ({previousComp ? previousComp.mesNome : 'N/A'})</span>
                              <span>{previousComp ? `${previousComp.kmRodado.toLocaleString('pt-BR')} Km` : '------'}</span>
                            </div>
                            <div className="text-right">
                              <span className="opacity-75 block text-[10px] uppercase">Diferença</span>
                              <span className={!previousComp ? 'text-gray-400' : (currentComp.kmRodado - (previousComp?.kmRodado || 0) >= 0 ? 'text-[#00714d]' : 'text-rose-600')}>
                                {previousComp ? `${(currentComp.kmRodado - previousComp.kmRodado)>=0?'+':''}${(currentComp.kmRodado - previousComp.kmRodado).toLocaleString('pt-BR')} Km` : '------'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Visual SVG Monthly Trend representation */}
                      <div className="bg-white p-6 border border-[#c3c6d7]/30 rounded-2xl shadow-xs">
                        <h4 className="text-xs font-extrabold text-[#4a4c58] uppercase tracking-wider mb-4 flex items-center gap-1.5 font-sans">
                          📈 Evolução Mensal do Faturamento Líquido (R$)
                        </h4>
                        <div className="h-44 w-full flex items-end gap-3.5 sm:gap-6 pt-6 px-4">
                          {(() => {
                            const maxVal = Math.max(...comparativoMensal.map(c => Math.max(c.faturamentoLiquido, 1)));
                            return comparativoMensal.map((item) => {
                              const heightPercent = Math.max(5, (item.faturamentoLiquido / maxVal) * 100);
                              const isSelected = item.key === currentComp.key;
                              return (
                                <div
                                  key={item.key}
                                  onClick={() => setSelectedComparisonKey(item.key)}
                                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                                >
                                  <div className="relative w-full flex items-end justify-center h-28">
                                    {/* Tooltip info on hover inside the chart bar */}
                                    <div className="absolute bottom-full mb-2 bg-[#0b1c30] text-white text-[9px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-10 flex flex-col items-center">
                                      <span>Líquido: {formatMoney(item.faturamentoLiquido)}</span>
                                      <span className="text-gray-400 opacity-90 text-[8px]">Bruto: {formatMoney(item.faturamentoBruto)}</span>
                                    </div>
                                    {/* Bar element */}
                                    <div
                                      className={`w-full max-w-[40px] rounded-t-lg transition-all duration-200 ${
                                        isSelected
                                          ? 'bg-gradient-to-t from-[#004ac6] to-[#0070f3] shadow-md shadow-[#004ac6]/20'
                                          : 'bg-slate-200 group-hover:bg-slate-300'
                                      }`}
                                      style={{ height: `${heightPercent}%` }}
                                    />
                                  </div>
                                  <span className={`text-[10px] font-black tracking-wider uppercase ${isSelected ? 'text-[#004ac6]' : 'text-slate-400'}`}>
                                    {item.mesNome.substring(0, 3)}
                                  </span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>

                      {/* Full Historical Listing of Months with MoM Variations */}
                      <div className="bg-white border border-[#c3c6d7]/30 rounded-2xl shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-[#c3c6d7]/30 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <h4 className="text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider font-sans">
                              Planilha de Evolução MoM Histórica
                            </h4>
                            <p className="text-[11px] text-[#737686] mt-0.5 font-semibold font-sans">
                              Demonstrativo completo de variações percentuais. Clique em qualquer linha para detalhar no painel superior.
                            </p>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-[#c3c6d7]/40 text-[#434655] text-[10px] font-extrabold uppercase tracking-wider bg-[#f8f9ff]">
                                <th className="px-5 py-3">Período</th>
                                <th className="px-5 py-3 text-right">Faturamento Bruto</th>
                                <th className="px-5 py-3 text-right">Despesas Oficina</th>
                                <th className="px-5 py-3 text-right">Faturamento Líquido</th>
                                <th className="px-5 py-3 text-center disable-select">∆ Faturamento Líquido %</th>
                                <th className="px-5 py-3 text-center disable-select">∆ Bruto %</th>
                                <th className="px-5 py-3 text-center disable-select">∆ Oficina %</th>
                                <th className="px-5 py-3 text-center">Viagens</th>
                                <th className="px-5 py-3 text-center">Veículos</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs font-bold text-[#434655]">
                              {comparativoMensal.map((item, idx) => {
                                const isSelected = item.key === currentComp.key;
                                return (
                                  <tr
                                    key={item.key}
                                    onClick={() => setSelectedComparisonKey(item.key)}
                                    className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                                      isSelected ? 'bg-blue-50/40 border-l-4 border-l-[#004ac6]' : ''
                                    }`}
                                  >
                                    <td className="px-5 py-3.5 uppercase font-black text-[#0b1c30]">
                                      {item.mesNome} de {item.ano}
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-semibold">
                                      {formatMoney(item.faturamentoBruto)}
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-semibold text-rose-600">
                                      {formatMoney(item.despesaOficina)}
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-extrabold text-[#004ac6]">
                                      {formatMoney(item.faturamentoLiquido)}
                                    </td>
                                    
                                    {/* Net MoM variation percent indicator */}
                                    <td className="px-5 py-3.5 text-center">
                                      {idx === 0 ? (
                                        <span className="text-gray-400 font-normal">--</span>
                                      ) : (
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                          item.varFaturamentoLiquido >= 0 ? 'bg-[#6cf8bb]/15 text-[#00714d]' : 'bg-rose-500/10 text-rose-600'
                                        }`}>
                                          {formatPercent(item.varFaturamentoLiquido)}
                                        </span>
                                      )}
                                    </td>

                                    {/* Gross MoM Variation */}
                                    <td className="px-5 py-3.5 text-center">
                                      {idx === 0 ? (
                                        <span className="text-gray-400 font-normal">--</span>
                                      ) : (
                                        <span className={`text-[10px] font-bold ${
                                          item.varFaturamentoBruto >= 0 ? 'text-[#00714d]' : 'text-rose-600'
                                        }`}>
                                          {formatPercent(item.varFaturamentoBruto)}
                                        </span>
                                      )}
                                    </td>

                                    {/* Oficina Expense Change */}
                                    <td className="px-5 py-3.5 text-center">
                                      {idx === 0 ? (
                                        <span className="text-gray-400 font-normal">--</span>
                                      ) : (
                                        <span className={`text-[10px] font-bold ${
                                          item.varDespesaOficina <= 0 ? 'text-[#00714d]' : 'text-rose-600'
                                        }`}>
                                          {formatPercent(item.varDespesaOficina)}
                                        </span>
                                      )}
                                    </td>

                                    <td className="px-5 py-3.5 text-center text-[#0b1c30]">
                                      {item.qtdViagens}
                                    </td>
                                    <td className="px-5 py-3.5 text-center text-[#434655]">
                                      {item.qtdVeiculos}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Global Footer of Grupo Mateus dashboard */}
        <footer className="mt-auto py-8 px-8 bg-[#f8f9ff] border-t border-[#c3c6d7]/40">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 opacity-70 text-xs font-bold text-[#737686]">
            <p>© 2026 Grupo Mateus - Transp. Externo. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <button onClick={() => triggerToast("Termos de Uso lidos.")} className="hover:text-[#004ac6] uppercase tracking-wide">
                Termos de Uso
              </button>
              <button onClick={() => triggerToast("Política de Privacidade lida.")} className="hover:text-[#004ac6] uppercase tracking-wide">
                Privacidade
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Spreadsheet Upload Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportSuccess}
      />

      {/* Driver Detail Modal Component */}
      <DriverDetailModal
        driverName={selectedDriverName}
        activeViagens={activeViagens}
        onClose={() => setSelectedDriverName(null)}
        triggerToast={triggerToast}
      />

      {/* Settings Logo Manager Modal */}
      <AnimatePresence>
        {isLogoSettingsOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden font-sans border border-[#c3c6d7]/30"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#0b1c30] uppercase tracking-wider">
                    Configurar Logotipo
                  </h3>
                  <p className="text-[10px] font-bold text-[#737686] uppercase tracking-widest mt-0.5">
                    Grupo Mateus - Transp. Externo
                  </p>
                </div>
                <button
                  onClick={() => setIsLogoSettingsOpen(false)}
                  className="p-1 px-2 text-xs font-bold text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Preview existing logo */}
                <div className="p-4 bg-slate-50 border border-dashed border-[#c3c6d7] rounded-xl flex flex-col items-center justify-center gap-3">
                  <span className="text-[10px] font-extrabold text-[#737686] uppercase tracking-wider">Visualização Atual:</span>
                  <div className="bg-white p-3 border border-gray-100 rounded-lg shadow-xs h-16 w-32 flex items-center justify-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Preview" className="h-full object-contain max-w-full" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex flex-col items-center text-[#737686]">
                        <Truck className="w-6 h-6 text-slate-300 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">(Sem Logotipo)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload Option */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-[#434655] uppercase tracking-wider block">
                    Upload de Arquivo de Imagem
                  </label>
                  <div className="border-2 border-dashed border-[#c3c6d7] hover:border-[#004ac6] active:bg-slate-50 rounded-xl p-4 text-center cursor-pointer transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const resultStr = reader.result as string;
                            setLogoUrl(resultStr);
                            localStorage.setItem('app_logo_url', resultStr);
                            triggerToast("Logotipo atualizado por upload com sucesso!");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-[#0b1c30]">Clique para escolher um arquivo</p>
                    <p className="text-[9px] text-[#737686] uppercase tracking-wider mt-0.5 font-bold">PNG, JPG, SVG ou GIF</p>
                  </div>
                </div>

                {/* URL Input option */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-[#434655] uppercase tracking-wider block">
                    Ou Link/URL da Imagem
                  </label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLogoUrl(val);
                      localStorage.setItem('app_logo_url', val);
                    }}
                    placeholder="https://exemplo.com/logo.png"
                    className="w-full bg-[#f8f9ff] text-xs font-semibold text-[#0b1c30] px-3.5 py-2.5 outline-none rounded-xl border border-[#c3c6d7] focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
                  />
                  <p className="text-[9px] font-semibold text-[#737686]">Insira um endereço URL público direto de qualquer imagem na internet.</p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between gap-3">
                {logoUrl && (
                  <button
                    onClick={() => {
                      setLogoUrl('');
                      localStorage.removeItem('app_logo_url');
                      triggerToast("Logotipo redefinido para o padrão!");
                    }}
                    className="px-4 py-2 bg-rose-50 text-rose-600 text-[10px] font-extrabold uppercase tracking-widest rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    Remover Logo
                  </button>
                )}
                <button
                  onClick={() => setIsLogoSettingsOpen(false)}
                  className="px-4 py-2 bg-[#004ac6] text-white text-[10px] font-extrabold uppercase tracking-widest rounded-lg hover:bg-opacity-90 ml-auto transition-colors"
                >
                  Concluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
