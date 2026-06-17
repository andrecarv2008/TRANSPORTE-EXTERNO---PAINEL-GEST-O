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
  Save,
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
  Wrench,
  Database
} from 'lucide-react';

import { Viagem, PlacaMetrics } from '@/lib/types';
import {
  INITIAL_VIAGENS,
  computeExecutiveMetrics,
  computePlacaMetrics,
  computeMotoristaMetrics,
  computeRouteMetrics,
  getDriverAvatar,
  isSemFaturamento
} from '@/lib/data';
import ImportModal from '@/components/ImportModal';
import MultiSelectDropdown from '@/components/MultiSelectDropdown';
import { saveViagensToDB, getViagensFromDB, clearViagensFromDB } from '@/lib/db';
import {
  fetchViagensFromFirestore,
  saveViagensToFirestore,
  fetchLastUpdateMetadata,
  resetViagensInFirestore,
  MetadataLastUpdate,
  ImportLog,
  fetchImportLogsFromFirestore,
  UserProfileConfig,
  fetchUserProfileFromFirestore,
  saveUserProfileToFirestore
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
import { createPortal } from 'react-dom';

const PlateTooltip = ({ plateData, children }: { plateData: PlacaMetrics; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(handle);
  }, []);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      setCoords({
        top: rect.top + scrollY - 6,
        left: rect.left + scrollX + rect.width / 2,
      });
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      updatePosition();
      // Handle page scroll/resize to keep the portal aligned
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
        tooltipRef.current && !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!plateData) return <>{children}</>;
  const faturamentoBruto = plateData.faturamentoTotal;
  const despesaOficina = plateData.despesaOficinaTotal || 0;
  const faturamentoLiquido = faturamentoBruto - despesaOficina;

  const tooltipBody = (
    <div
      ref={tooltipRef}
      style={{
        position: 'absolute',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        transform: 'translate(-50%, -100%)',
      }}
      className="mb-2 w-[315px] bg-[#0b1c30]/95 backdrop-blur-md text-white rounded-xl p-4 shadow-2xl border border-white/10 z-[9999] text-left font-sans normal-case select-none animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
        <span className="text-xs font-black tracking-wider bg-[#004ac6] px-2 py-0.5 rounded text-white font-mono">{plateData.placa}</span>
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
          plateData.statusFaturamento === 'SEM FATURAMENTO' ? 'bg-rose-500/25 text-rose-300 border border-rose-500/30' :
          plateData.statusMeta === 'Dentro da Meta' ? 'bg-[#6cf8bb]/15 text-[#6cf8bb]' : 'bg-red-500/15 text-red-300'
        }`}>
          {plateData.statusFaturamento === 'SEM FATURAMENTO' ? '🛑 SEM FATURAMENTO' :
           plateData.statusMeta === 'Dentro da Meta' ? '🟢 DENTRO DA META' : '🔴 FORA DA META'}
        </span>
      </div>
      
      {plateData.statusFaturamento === 'SEM FATURAMENTO' && (
        <div className="mb-3 text-[10px] text-rose-200 bg-rose-500/10 px-2 py-1.5 rounded border border-rose-500/20 flex items-center gap-1.5 leading-normal font-extrabold uppercase tracking-wide">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>Veículo sem faturamento no período selecionado</span>
        </div>
      )}

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
          <span className="text-white font-black">{plateData.viagensCount}</span>
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
  );

  return (
    <>
      <div 
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        {children}
      </div>
      {isOpen && mounted && typeof document !== 'undefined' && createPortal(tooltipBody, document.body)}
    </>
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

const SemFaturamentoTooltip = ({ 
  plates, 
  percent, 
  children 
}: { 
  plates: string[]; 
  percent: string; 
  children: React.ReactNode 
}) => {
  return (
    <div className="relative group cursor-help w-full">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 w-[325px] bg-[#0b1c30]/95 backdrop-blur-md text-white rounded-xl p-4 shadow-2xl border border-white/10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 scale-95 group-hover:scale-100 z-50 text-left font-sans normal-case select-none">
        <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
          <span className="text-[10px] font-black tracking-wider bg-[#ab0b1c] px-2 py-0.5 rounded text-white font-mono uppercase">Frota sem Faturamento</span>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#ab0b1c]/20 text-[#ffdad6]">
            {percent}% DA FROTA
          </span>
        </div>
        <div className="space-y-2 text-[11px] font-bold">
          <div className="flex justify-between text-slate-300">
            <span>Frota Total Sem Faturamento:</span>
            <span className="text-white font-black">{plates.length} veículos</span>
          </div>
          
          <div className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">
            Lista de Placas Ativas:
          </div>
          
          {plates.length === 0 ? (
            <div className="text-slate-500 italic text-center py-2">
              Nenhuma placa encontrada
            </div>
          ) : (
            <div className="max-h-[140px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {plates.map((plate, i) => (
                  <span 
                    key={i} 
                    className="bg-white/10 hover:bg-white/20 text-white rounded text-center py-1 px-1.5 font-mono text-[10px] font-black transition-colors"
                  >
                    {plate}
                  </span>
                ))}
              </div>
            </div>
          )}
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

const normalizeMonthName = (m: string): string => {
  const lower = m.toLowerCase().trim();
  if (lower.includes('jan')) return 'Janeiro';
  if (lower.includes('fev') || lower.includes('fêv')) return 'Fevereiro';
  if (lower.includes('mar')) return 'Março';
  if (lower.includes('abr')) return 'Abril';
  if (lower.includes('mai')) return 'Maio';
  if (lower.includes('jun')) return 'Junho';
  if (lower.includes('jul')) return 'Julho';
  if (lower.includes('ago')) return 'Agosto';
  if (lower.includes('set')) return 'Setembro';
  if (lower.includes('out')) return 'Outubro';
  if (lower.includes('nov')) return 'Novembro';
  if (lower.includes('dez')) return 'Dezembro';
  return m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
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

    const activeDriverViagens = driverViagens.filter(v => !isSemFaturamento(v));
    const tripsCount = activeDriverViagens.length;
    const uniqueRoutes = new Set(activeDriverViagens.map(v => v.rota)).size;
    const totalKm = activeDriverViagens.reduce((sum, v) => sum + (v.kmRodado || 0), 0);
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
      if (!isSemFaturamento(v)) {
        groups[v.rota].viagens += 1;
      }
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
      if (!isSemFaturamento(v)) {
        groups[v.rota].trips += 1;
      }
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

interface PlacasDetailModalProps {
  categoryLabel: string | null;
  rankings: PlacaMetrics[];
  onClose: () => void;
}

const PlacasDetailModal = ({ categoryLabel, rankings, onClose }: PlacasDetailModalProps) => {
  if (!categoryLabel) return null;

  const filteredRankings = rankings.filter(r => {
    const vc = r.viagensCount;
    if (categoryLabel === '1 viagem') return vc === 1;
    if (categoryLabel === '2 viagens') return vc === 2;
    if (categoryLabel === '3 viagens') return vc === 3;
    if (categoryLabel === '4 viagens') return vc === 4;
    if (categoryLabel === '5 ou mais') return vc >= 5;
    return false;
  });

  const totalFaturamento = filteredRankings.reduce((sum, r) => sum + r.faturamentoTotal, 0);
  const totalDespesa = filteredRankings.reduce((sum, r) => sum + (r.despesaOficinaTotal || 0), 0);
  const totalLiquido = totalFaturamento - totalDespesa;

  return (
    <div 
      className="fixed inset-0 bg-[#0b1c30]/60 backdrop-blur-xs z-55 flex items-center justify-center p-4 md:p-6"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-6xl xl:max-w-7xl rounded-2xl shadow-2xl border border-[#c3c6d7]/30 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0b1c30] px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Detalhamento por Faixa de Viagens</p>
            <h2 className="text-lg font-black text-white mt-1 uppercase leading-tight">Placas na categoria: {categoryLabel}</h2>
            <p className="text-xs text-slate-300 mt-1 font-medium font-sans">
              Total nesta faixa: <span className="text-white font-extrabold">{filteredRankings.length} veículos</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mini Summary Cards inside Modal */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 shrink-0 grid grid-cols-3 gap-4 font-sans text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200/65 shadow-xs">
            <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider block">Faturamento Bruto Total</span>
            <span className="text-sm font-black text-blue-600 block mt-1">
              R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/65 shadow-xs">
            <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider block">Despesa Oficina Total</span>
            <span className="text-sm font-black text-red-500 block mt-1">
              R$ {totalDespesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/65 shadow-xs">
            <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider block">Faturamento Líquido Total</span>
            <span className="text-sm font-black text-emerald-600 block mt-1">
              R$ {totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Table Body Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {filteredRankings.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-bold font-sans">Nenhum veículo encontrado nesta faixa para os filtros selecionados.</p>
            </div>
          ) : (
            <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-100 text-[10px] uppercase font-black tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-center w-16">Classif.</th>
                    <th className="px-4 py-3">Placa</th>
                    <th className="px-4 py-3">Motorista</th>
                    <th className="px-4 py-3">Supervisor</th>
                    <th className="px-4 py-3 text-center">Viagens</th>
                    <th className="px-4 py-3 text-right">Fat. Bruto</th>
                    <th className="px-4 py-3 text-right">Faturamento Líquido</th>
                    <th className="px-4 py-3 text-center">Meta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRankings.map((r, itemIdx) => {
                    const idx = rankings.findIndex(rank => rank.placa === r.placa && rank.mes === r.mes && rank.ano === r.ano) + 1;
                    const faturamentoBruto = r.faturamentoTotal;
                    const despesaOficina = r.despesaOficinaTotal || 0;
                    const faturamentoLiquido = faturamentoBruto - despesaOficina;
                    const isInsideMeta = r.statusMeta === 'Dentro da Meta';

                    return (
                      <tr key={`${r.placa}-${r.mes || ''}-${r.ano || ''}-${itemIdx}`} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-mono border ${
                            idx === 1 ? 'bg-amber-100 border-amber-300 text-amber-700 font-extrabold' : 
                            idx === 2 ? 'bg-slate-100 border-slate-300 text-slate-700 font-extrabold' :
                            idx === 3 ? 'bg-orange-50 border-orange-200 text-orange-700 font-extrabold' :
                            'bg-slate-50 border-slate-100 text-slate-500'
                          }`}>
                            {idx}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 items-start">
                            <span 
                              title={r.statusFaturamento === 'SEM FATURAMENTO' ? 'Veículo sem faturamento no período selecionado' : undefined}
                              className={`px-2.5 py-1 rounded text-[10px] font-mono font-black tracking-wider border whitespace-nowrap ${
                                r.statusFaturamento === 'SEM FATURAMENTO'
                                  ? 'bg-rose-50 text-rose-700 border-rose-250 cursor-help'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {r.placa} {r.mes && `(${r.mes.slice(0, 3)})`}
                            </span>
                            {r.statusFaturamento === 'SEM FATURAMENTO' ? (
                              <span className="inline-block text-[9px] bg-rose-50 text-rose-600 border border-rose-200 rounded px-1 py-0.5 leading-none font-black select-none uppercase tracking-wider">
                                SEM FATURAMENTO
                              </span>
                            ) : (
                              <span className="inline-block text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-1 py-0.5 leading-none font-black select-none uppercase tracking-wider">
                                FATUROU
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-700 uppercase truncate max-w-[320px]">
                          {r.motorista || 'Sem Motorista'}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-500 uppercase truncate max-w-[240px]">
                          {r.supervisor || 'Sem Supervisor'}
                        </td>
                        <td className="px-4 py-3 text-center font-black text-slate-800">
                          {r.viagensCount}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 font-bold font-mono">
                          R$ {faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-emerald-600 font-mono">
                          R$ {faturamentoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap ${
                            isInsideMeta ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {isInsideMeta ? 'DENTRO' : 'FORA'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0b1c30] text-white text-xs font-black rounded-lg hover:bg-opacity-90 transition-colors uppercase tracking-wider cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

interface PotentialRevenueDetailModalProps {
  mesSelected: string | null;
  preFilteredViagens: Viagem[];
  onClose: () => void;
}

const PotentialRevenueDetailModal = ({ mesSelected, preFilteredViagens, onClose }: PotentialRevenueDetailModalProps) => {
  const [search, setSearch] = React.useState('');
  const [sortField, setSortField] = React.useState<string>('placa');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  if (!mesSelected) return null;

  // Filter voyages to the chosen month
  const voyagesInMonth = preFilteredViagens.filter(v => (v.mes || 'Maio') === mesSelected);

  // Group by plate to find which ones did NOT bill
  const plateMap: Record<string, { faturamento: number; hasBilling: boolean; viagens: Viagem[] }> = {};
  
  voyagesInMonth.forEach(v => {
    const p = String(v.placa || '').trim().toUpperCase();
    if (!p) return;
    if (!plateMap[p]) {
      plateMap[p] = { faturamento: 0, hasBilling: false, viagens: [] };
    }
    plateMap[p].viagens.push(v);
    plateMap[p].faturamento += v.valorCarga || 0;
    if (!isSemFaturamento(v)) {
      plateMap[p].hasBilling = true;
    }
  });

  // Calculate unbilled plates
  const unbilledPlatesRaw = Object.keys(plateMap)
    .filter(p => !plateMap[p].hasBilling)
    .map(p => {
      const plateVoyages = plateMap[p].viagens;
      
      const branches = Array.from(new Set(plateVoyages.map(v => v.filial || 'Filial São Luís').filter(Boolean)));
      const drivers = Array.from(new Set(plateVoyages.map(v => v.motorista || 'Sem Motorista').filter(Boolean)));
      
      // Dynamic supervisor resolver that looks across ALL voyages in preFilteredViagens
      let resolvedSupervisor = '';
      
      const isRealSupervisorName = (name: string) => {
        if (!name) return false;
        const upper = name.trim().toUpperCase();
        return (
          upper !== '' &&
          upper !== 'N/D' &&
          upper !== 'SEM SUPERVISOR' &&
          upper !== 'UNDEFINED' &&
          upper !== 'NULL' &&
          upper !== 'LEONAN' &&
          upper !== 'VAZIO'
        );
      };

      // 1. Try to find any other voyage in preFilteredViagens for the exact same plate with a real supervisor name
      const samePlateVoyages = preFilteredViagens.filter(
        v => String(v.placa || '').trim().toUpperCase() === p
      );
      
      const realSupervisorsOfPlate = samePlateVoyages
        .map(v => String(v.supervisao || '').trim())
        .filter(isRealSupervisorName);

      if (realSupervisorsOfPlate.length > 0) {
        resolvedSupervisor = realSupervisorsOfPlate[0];
      } else {
        // 2. Try to find a real supervisor by filial across all voyages
        const filialName = branches[0] || '';
        if (filialName) {
          const sameFilialVoyages = preFilteredViagens.filter(
            v => String(v.filial || '').trim().toUpperCase() === filialName.toUpperCase()
          );
          const realSupervisorsOfFilial = sameFilialVoyages
            .map(v => String(v.supervisao || '').trim())
            .filter(isRealSupervisorName);
          
          if (realSupervisorsOfFilial.length > 0) {
            resolvedSupervisor = realSupervisorsOfFilial[0];
          }
        }
      }

      // 3. Fallback: if we still don't have supervisor, check if 'LEONAN' is verified as a real supervisor for this plate
      if (!resolvedSupervisor) {
        const hasBilledLeonan = samePlateVoyages.some(
          v => !isSemFaturamento(v) && String(v.supervisao || '').trim().toUpperCase() === 'LEONAN'
        );
        if (hasBilledLeonan) {
          resolvedSupervisor = 'LEONAN';
        } else {
          const filialName = branches[0] || '';
          const hasBilledLeonanForFilial = filialName && preFilteredViagens.some(
            v => String(v.filial || '').trim().toUpperCase() === filialName.toUpperCase() &&
                 !isSemFaturamento(v) && 
                 String(v.supervisao || '').trim().toUpperCase() === 'LEONAN'
          );
          if (hasBilledLeonanForFilial) {
            resolvedSupervisor = 'LEONAN';
          }
        }
      }

      // 4. Final resolve: fallback to any non-empty supervisao in this plate's voyages, or 'Vazio'
      if (!resolvedSupervisor) {
        const rawSups = plateVoyages.map(v => String(v.supervisao || '').trim()).filter(Boolean);
        const filteredRawSups = rawSups.filter(s => {
          const u = s.toUpperCase();
          return u !== 'N/D' && u !== 'SEM SUPERVISOR' && u !== 'UNDEFINED' && u !== 'NULL' && u !== 'LEONAN';
        });
        if (filteredRawSups.length > 0) {
          resolvedSupervisor = filteredRawSups[0];
        } else {
          resolvedSupervisor = 'Vazio';
        }
      }

      const routes = Array.from(new Set(plateVoyages.map(v => v.rota || 'N/D').filter(Boolean)));
      const shipTypes = Array.from(new Set(plateVoyages.map(v => v.tipoVeiculo || 'N/D').filter(Boolean)));
      const kmTotal = plateVoyages.reduce((sum, v) => sum + (v.kmRodado || 0), 0);
      const billedVoyagesCount = plateVoyages.filter(v => !isSemFaturamento(v)).length;
      
      return {
        placa: p,
        filial: branches.join(', ') || 'Filial São Luís',
        motorista: drivers.join(', ') || 'Sem Motorista',
        supervisor: resolvedSupervisor,
        rotas: routes.join(', ') || 'N/D',
        tipoVeiculo: shipTypes.join(', ') || 'N/D',
        kmRodadoTotal: kmTotal,
        viagensCount: billedVoyagesCount,
      };
    });

  // Calculate stats for this month
  const totalUnbilledPlatesCount = unbilledPlatesRaw.length;
  // Faturamento médio das placas que FATURARAM neste mês (to calculate potential revenue lost)
  const billedPlates = Object.keys(plateMap).filter(p => plateMap[p].hasBilling);
  const faturamentoTotalBilled = voyagesInMonth.reduce((sum, v) => sum + (isSemFaturamento(v) ? 0 : (v.valorCarga || 0)), 0);
  const faturamentoMedio = billedPlates.length > 0 ? (faturamentoTotalBilled / billedPlates.length) : 0;
  const totalReceitaPotencialFaltante = faturamentoMedio * totalUnbilledPlatesCount;

  // Search filter
  const filteredPlates = unbilledPlatesRaw.filter(p => {
    const term = search.toLowerCase();
    return (
      p.placa.toLowerCase().includes(term) ||
      p.filial.toLowerCase().includes(term) ||
      p.motorista.toLowerCase().includes(term) ||
      p.supervisor.toLowerCase().includes(term) ||
      p.rotas.toLowerCase().includes(term) ||
      p.tipoVeiculo.toLowerCase().includes(term)
    );
  });

  // Sorting
  const sortedPlates = [...filteredPlates].sort((a: any, b: any) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    } else {
      // numeric comparison
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (field: string) => {
    if (sortField !== field) return <span className="ml-1 opacity-20">↕</span>;
    return sortDirection === 'asc' ? <span className="ml-1 text-blue-500">↑</span> : <span className="ml-1 text-blue-500">↓</span>;
  };

  return (
    <div 
      className="fixed inset-0 bg-[#0b1c30]/65 backdrop-blur-xs z-55 flex items-center justify-center p-4 md:p-6"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-6xl xl:max-w-7xl rounded-2xl shadow-2xl border border-[#c3c6d7]/30 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0b1c30] px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div>
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none">Oportunidade e Receita Não Realizada</p>
            <h2 className="text-lg font-black text-white mt-1 uppercase leading-tight">Placas sem Faturamento em {mesSelected}</h2>
            <p className="text-xs text-slate-350 mt-1 font-medium font-sans">
              Consulte aqui o detalhamento de veículos ociosos no mês ou filtre termos na busca inteligente.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Dynamic Monthly KPI Summaries */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-[#737686] font-extrabold uppercase tracking-wider block">Veículos Não Faturados ({mesSelected})</span>
              <span className="text-2xl font-black text-amber-600 block mt-1">
                {totalUnbilledPlatesCount}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 mt-2 block">
              Placas sem viagens produtivas faturadas no mês.
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-[#737686] font-extrabold uppercase tracking-wider block">Faturamento Médio por Placa Ativa</span>
              <span className="text-2xl font-black text-blue-600 block mt-1">
                R$ {faturamentoMedio.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 mt-2 block">
              Ticket médio gerado por veículos produtivos faturantes.
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between bg-amber-50/15 border-amber-250/30">
            <div>
              <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider block">Receita Potencial Não Faturada</span>
              <span className="text-2xl font-black text-rose-600 block mt-1">
                R$ {totalReceitaPotencialFaltante.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[10px] text-amber-600 font-bold mt-2 block">
              Perda potencial calculada para as {totalUnbilledPlatesCount} placas inativas.
            </span>
          </div>
        </div>

        {/* Filter and Search controls */}
        <div className="px-6 py-3.5 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-center gap-3 justify-between shrink-0">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por placa, filial, motorista, supervisor, rota ou veículo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <div className="text-[11px] text-[#737686] font-bold uppercase tracking-wider flex items-center gap-1.5">
            Exibindo <span className="text-slate-900 font-extrabold font-mono">{sortedPlates.length}</span> de <span className="text-slate-900 font-extrabold font-mono">{totalUnbilledPlatesCount}</span> placas sem faturamento
          </div>
        </div>

        {/* Table Body Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-slate-50">
          {sortedPlates.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-xs">
              <AlertTriangle className="mx-auto h-12 w-12 text-slate-400 mb-2" />
              <p className="text-sm font-black text-slate-700 uppercase font-sans">Nenhum veículo encontrado</p>
              <p className="text-xs text-slate-500 font-medium font-sans mt-1">Refine seus termos de busca para encontrar registros específicos.</p>
            </div>
          ) : (
            <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-md">
              <table className="w-full text-left text-sm font-sans">
                <thead className="bg-slate-100/90 text-slate-600 text-[11px] md:text-xs uppercase font-black tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 cursor-pointer select-none text-center w-36 bg-slate-50/50" onClick={() => handleSort('placa')}>
                      Placa {getSortIndicator('placa')}
                    </th>
                    <th className="px-5 py-3.5 cursor-pointer select-none" onClick={() => handleSort('filial')}>
                      Filial / Unidade {getSortIndicator('filial')}
                    </th>
                    <th className="px-5 py-3.5 cursor-pointer select-none" onClick={() => handleSort('motorista')}>
                      Último Motorista {getSortIndicator('motorista')}
                    </th>
                    <th className="px-5 py-3.5 cursor-pointer select-none" onClick={() => handleSort('supervisor')}>
                      Supervisor Responsável {getSortIndicator('supervisor')}
                    </th>
                    <th className="px-5 py-3.5 cursor-pointer select-none text-center" onClick={() => handleSort('viagensCount')}>
                      Viagens {getSortIndicator('viagensCount')}
                    </th>
                    <th className="px-5 py-3.5 cursor-pointer select-none text-right" onClick={() => handleSort('kmRodadoTotal')}>
                      KM Percorrido {getSortIndicator('kmRodadoTotal')}
                    </th>
                    <th className="px-5 py-3.5">Rotas Recorrentes no Mês</th>
                    <th className="px-5 py-3.5">Tipo de Veículo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {sortedPlates.map((item, itemIdx) => {
                    const cleanPlaca = item.placa.trim().toUpperCase().replace('-', '');
                    const displayPlaca = cleanPlaca.length === 7 
                      ? `${cleanPlaca.slice(0, 3)}-${cleanPlaca.slice(3)}` 
                      : item.placa.trim().toUpperCase();

                    return (
                      <tr key={`${item.placa}-${itemIdx}`} className="hover:bg-blue-50/10 transition-colors">
                        <td className="px-4 py-3.5 text-center bg-slate-50/30 whitespace-nowrap align-middle">
                          {/* Authentic Mercosul Styled Plate Badge */}
                          <div className="inline-flex flex-col w-28 h-9 border-2 border-slate-400 rounded-md bg-white shadow-xs select-none shrink-0 overflow-hidden">
                            {/* Blue Upper Strip with BRASIL & Mini Icon */}
                            <div className="bg-[#0051a8] text-white text-[7px] font-sans font-black px-1.5 h-3.5 flex justify-between items-center tracking-wider uppercase select-none leading-none">
                              <span className="flex items-center gap-0.5">
                                <span className="inline-block w-1.5 h-1 bg-green-500 rounded-2xs"></span>
                                BRASIL
                              </span>
                              <span className="text-[5.5px] opacity-80">MERCOSUL</span>
                            </div>
                            {/* Central Alphanumeric Area */}
                            <div className="flex-1 flex items-center justify-center font-mono text-[13px] font-[900] text-slate-900 tracking-wide leading-none bg-[#f8fafc]">
                              {displayPlaca}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs md:text-[13px] font-bold text-slate-800 uppercase leading-snug">
                          {item.filial}
                        </td>
                        <td className="px-5 py-3.5 text-xs md:text-[13px] font-semibold text-slate-700 uppercase truncate max-w-[220px]" title={item.motorista}>
                          {item.motorista}
                        </td>
                        <td className="px-5 py-3.5 text-xs md:text-[13px] font-bold text-slate-600 uppercase truncate max-w-[180px]" title={item.supervisor}>
                          {item.supervisor}
                        </td>
                        <td className="px-5 py-3.5 text-center text-xs md:text-[13px] font-black text-slate-900">
                          {item.viagensCount}
                        </td>
                        <td className="px-5 py-3.5 text-right text-xs md:text-[13px] font-extrabold text-slate-800 font-mono">
                          {item.kmRodadoTotal.toLocaleString('pt-BR')} km
                        </td>
                        <td className="px-5 py-3.5 text-xs md:text-[13px] text-slate-600 font-medium truncate max-w-[240px]" title={item.rotas}>
                          {item.rotas}
                        </td>
                        <td className="px-5 py-3.5 text-xs md:text-[13px] text-slate-500 truncate max-w-[160px] align-middle" title={item.tipoVeiculo}>
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] md:text-[11px] font-extrabold rounded-md uppercase border border-slate-200">
                            {item.tipoVeiculo}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#737686] font-bold uppercase tracking-wider">
            Unidade Transp. Externo - Grupo Mateus
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0b1c30] text-white text-xs font-black rounded-lg hover:bg-opacity-90 transition-colors uppercase tracking-wider cursor-pointer shadow-sm hover:shadow-md"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [viagens, setViagens] = React.useState<Viagem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [hoveredBarLabel, setHoveredBarLabel] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'vehiculos' | 'rotas' | 'relatorios' | 'comparativo' | 'perfil' | 'ranking_supervisao'>('dashboard');
  const [personalProfile, setPersonalProfile] = React.useState<UserProfileConfig>({
    nome: "Usuário Grupo Mateus",
    cargo: "Analista de Transporte",
    filialPreferida: "ALL",
    supervisorPreferido: "ALL",
    whatsapp: "(98) 99123-4567",
    notificacoesEmail: true,
    alertasAudivel: false,
    limiteViagensPlaca: 100,
    avatarColor: "bg-[#004ac6]",
  });
  const [selectedComparisonKey, setSelectedComparisonKey] = React.useState<string | null>(null);
  const [comparisonBaseKey, setComparisonBaseKey] = React.useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchMotorista, setSearchMotorista] = React.useState('');
  const [searchPlaca, setSearchPlaca] = React.useState('');
  const [logoUrl, setLogoUrl] = React.useState<string>('');
  const [isLogoSettingsOpen, setIsLogoSettingsOpen] = React.useState(false);
  
  // Real-time Cloud Auth and Profile Roles
  const [userProfile, setUserProfile] = React.useState<'Administrador' | 'Leitor'>('Leitor');
  const [currentUser, setCurrentUser] = React.useState<FirebaseUser | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<MetadataLastUpdate | null>(null);
  const [importLogs, setImportLogs] = React.useState<ImportLog[]>([]);
  const [dbLoading, setDbLoading] = React.useState<boolean>(true);
  
  // Custom Filters Required by User (Filial, Ano, Mestre Mês) - using multi-select lists
  const [selectedFiliais, setSelectedFiliais] = React.useState<string[]>([]);
  const [selectedAnos, setSelectedAnos] = React.useState<string[]>([]);
  const [selectedMeses, setSelectedMeses] = React.useState<string[]>([]);
  const [selectedSupervisores, setSelectedSupervisores] = React.useState<string[]>([]);
  const [statusMetaFilter, setStatusMetaFilter] = React.useState<'ALL' | 'DENTRO' | 'FORA'>('ALL');
  const [billingFilter, setBillingFilter] = React.useState<'ALL' | 'FATURADO' | 'NAO_FATURADO'>('ALL');
  const [potentialChartHoveredIndex, setPotentialChartHoveredIndex] = React.useState<number | null>(null);
  const [selectedPotentialMonth, setSelectedPotentialMonth] = React.useState<string | null>(null);
  
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [selectedDriverName, setSelectedDriverName] = React.useState<string | null>(null);
  const [selectedRouteName, setSelectedRouteName] = React.useState<string | null>(null);
  const [selectedTripCategory, setSelectedTripCategory] = React.useState<string | null>(null);

  // Pagination for Trips / Relatórios Table
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 8;

  // New States for Vehicles Tab Dashboard
  const [vehiculosSearchQuery, setVehiculosSearchQuery] = React.useState('');
  const [vehiculosPage, setVehiculosPage] = React.useState(1);

  // Filter values for Relatórios
  const [filterPlaca, setFilterPlaca] = React.useState('');
  const [filterMotorista, setFilterMotorista] = React.useState('ALL');
  const [filterSupervisao, setFilterSupervisao] = React.useState('ALL');

  // New States for Ranking Supervisao Tab
  const [rankingFilial, setRankingFilial] = React.useState('ALL');
  const [rankingViewType, setRankingViewType] = React.useState<'bento' | 'tabela'>('bento');
  const [rankingSearchQuery, setRankingSearchQuery] = React.useState('');
  const [rankingSortField, setRankingSortField] = React.useState<'supervisor' | 'faturamento' | 'viagensCount' | 'platesDentro' | 'platesFora' | 'metaAproveitamento'>('faturamento');
  const [rankingSortDirection, setRankingSortDirection] = React.useState<'asc' | 'desc'>('desc');
  const [expandedSupervisor, setExpandedSupervisor] = React.useState<string | null>(null);



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

        // Fetch Google Profile data from Cloud Firestore
        fetchUserProfileFromFirestore(user.uid)
          .then((prof) => {
            if (prof) {
              setPersonalProfile(prof);
            } else {
              // Populate default profile settings if brand new
              const nickname = user.displayName || user.email?.split('@')[0] || "Usuário";
              const newProf: UserProfileConfig = {
                nome: nickname,
                cargo: user.email === 'andreandersoncarvalhorocha1@gmail.com' ? "Administrador de Transporte" : "Supervisor de Frota",
                filialPreferida: "ALL",
                supervisorPreferido: "ALL",
                whatsapp: "(98) 99123-4567",
                notificacoesEmail: true,
                alertasAudivel: false,
                limiteViagensPlaca: 100,
                avatarColor: "bg-[#004ac6]"
              };
              setPersonalProfile(newProf);
              saveUserProfileToFirestore(user.uid, newProf).catch(e => console.warn("Failed saving basic profile on init:", e));
            }
          })
          .catch((e) => console.warn("Firestore profile loading failed:", e));

      } else {
        setCurrentUser(null);
        // Load offline profile config from localStorage as fallback
        const localCached = localStorage.getItem('personal_profile');
        if (localCached) {
          try {
            setPersonalProfile(JSON.parse(localCached));
          } catch(e) {
            console.warn(e);
          }
        }
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

    // C. Fetch latest upload metadata and import logs from Cloud Firestore
    fetchLastUpdateMetadata()
      .then((meta) => {
        if (meta) {
          setLastUpdate(meta);
        }
      })
      .catch((error) => {
        console.warn("Metadata retrieval skipped:", error);
      });

    fetchImportLogsFromFirestore()
      .then((logs) => {
        if (logs) {
          setImportLogs(logs);
        }
      })
      .catch((error) => {
        console.warn("Import logs retrieval skipped:", error);
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

        const savedBilling = localStorage.getItem('filters_billing');
        if (savedBilling) setBillingFilter(savedBilling as any);

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

  const updateBillingFilter = (value: 'ALL' | 'FATURADO' | 'NAO_FATURADO') => {
    setBillingFilter(value);
    localStorage.setItem('filters_billing', value);
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

      const logs = await fetchImportLogsFromFirestore();
      if (logs) {
        setImportLogs(logs);
      }
      
      triggerToast("Dados importados e salvos com sucesso.");
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

    if (confirm("Deseja realmente limpar todos os dados importados? O painel ficará limpo aguardando novas importações.")) {
      setViagens([]);
      await clearViagensFromDB();
      
      try {
        triggerToast("🔄 Redefinindo banco de dados na Nuvem (Firestore)...");
        const uploader = currentUser?.email || 'Administrador';
        await resetViagensInFirestore(uploader);
        
        const meta = await fetchLastUpdateMetadata();
        if (meta) {
          setLastUpdate(meta);
        }

        const logs = await fetchImportLogsFromFirestore();
        if (logs) {
          setImportLogs(logs);
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
  const preFilteredViagens = React.useMemo(() => {
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
      list = list.filter(v => {
        const vMes = normalizeMonthName(v.mes || 'Maio');
        return selectedMeses.some(sel => normalizeMonthName(sel) === vMes);
      });
    }

    // Filter by Supervisor (Multi-select)
    if (selectedSupervisores && selectedSupervisores.length > 0) {
      list = list.filter(v => selectedSupervisores.includes(v.supervisao || 'Sem Supervisor'));
    }

    // Search by Driver
    if (searchMotorista.trim().length > 0) {
      const q = searchMotorista.toLowerCase();
      list = list.filter(v => v.motorista && v.motorista.toLowerCase().includes(q));
    }

    // Search by Plate/Placa
    if (searchPlaca.trim().length > 0) {
      const q = searchPlaca.toUpperCase().trim();
      list = list.filter(v => v.placa && v.placa.toUpperCase().includes(q));
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
      const activeMonthsCount = selectedMeses && selectedMeses.length > 0 
        ? selectedMeses.length 
        : mesesDrop.length;
      const targetTrips = activeMonthsCount * 4;

      if (statusMetaFilter === 'DENTRO') {
        list = list.filter(v => (counts[v.placa] || 0) >= targetTrips);
      } else if (statusMetaFilter === 'FORA') {
        list = list.filter(v => (counts[v.placa] || 0) < targetTrips);
      }
    }

    return list;
  }, [viagens, selectedFiliais, selectedAnos, selectedMeses, selectedSupervisores, statusMetaFilter, searchQuery, searchMotorista, searchPlaca, mesesDrop]);

  // Handle the Faturado / Não Faturado billingFilter
  const activeViagens = React.useMemo(() => {
    if (billingFilter === 'FATURADO') {
      return preFilteredViagens.filter(v => !isSemFaturamento(v));
    } else if (billingFilter === 'NAO_FATURADO') {
      return preFilteredViagens.filter(v => isSemFaturamento(v));
    }
    return preFilteredViagens;
  }, [preFilteredViagens, billingFilter]);

  const activeMonthsCount = React.useMemo(() => {
    return selectedMeses && selectedMeses.length > 0 
      ? selectedMeses.length 
      : mesesDrop.length;
  }, [selectedMeses, mesesDrop]);

  // Compute metrics dynamically
  const preFilteredMetrics = React.useMemo(() => computeExecutiveMetrics(preFilteredViagens), [preFilteredViagens]);

  // Compute total active unique plate-month combinations to serve as fleet-month denominator
  const totalPlateMonthsCount = React.useMemo(() => {
    const activeCombos = new Set<string>();
    preFilteredViagens.forEach(v => {
      const p = v.placa.trim().toUpperCase();
      if (!p) return;
      const m = v.mes || 'Maio';
      activeCombos.add(`${p} | ${m}`);
    });
    return activeCombos.size;
  }, [preFilteredViagens]);

  const platesSemFaturamento = React.useMemo(() => {
    // We group preFilteredViagens by plate and month (e.g. v.mes)
    // to check for billing within that specific month.
    const plateMonthMap: Record<string, { plate: string; mes: string; hasBilling: boolean }> = {};

    preFilteredViagens.forEach(v => {
      const p = v.placa.trim().toUpperCase();
      if (!p) return;
      const m = v.mes || 'Maio';
      const key = `${p} | ${m}`;

      if (!plateMonthMap[key]) {
        plateMonthMap[key] = { plate: p, mes: m, hasBilling: false };
      }

      if (!isSemFaturamento(v)) {
        plateMonthMap[key].hasBilling = true;
      }
    });

    const list: string[] = [];
    Object.values(plateMonthMap).forEach(item => {
      if (!item.hasBilling) {
        if (selectedMeses && selectedMeses.length === 1) {
          list.push(item.plate);
        } else {
          list.push(`${item.plate} (${item.mes.slice(0, 3)})`);
        }
      }
    });

    return list.sort();
  }, [preFilteredViagens, selectedMeses]);

  const pctSemFaturamento = React.useMemo(() => {
    if (totalPlateMonthsCount === 0) return '0.0';
    return ((platesSemFaturamento.length / totalPlateMonthsCount) * 100).toFixed(1);
  }, [platesSemFaturamento, totalPlateMonthsCount]);

  const metrics = React.useMemo(() => computeExecutiveMetrics(activeViagens), [activeViagens]);
  const rankings = React.useMemo(() => computePlacaMetrics(activeViagens, activeViagens, activeMonthsCount), [activeViagens, activeMonthsCount]);
  const motoristas = React.useMemo(() => computeMotoristaMetrics(activeViagens), [activeViagens]);
  const rotas = React.useMemo(() => computeRouteMetrics(activeViagens), [activeViagens]);

  // Compute physical plate rankings (aggregated across all matching trips for the selected filters)
  const tableRankings = React.useMemo(() => {
    const groups: Record<string, {
      placa: string;
      faturamento: number;
      kmTotal: number;
      despesaOficinaTotal: number;
      supervisores: Record<string, number>;
      motoristas: Record<string, number>;
      viagensCount: number;
      ultimaRota: string;
      hasBilling: boolean;
    }> = {};

    activeViagens.forEach(v => {
      const p = v.placa.trim().toUpperCase();
      if (!p) return;

      if (!groups[p]) {
        groups[p] = {
          placa: p,
          faturamento: 0,
          kmTotal: 0,
          despesaOficinaTotal: 0,
          supervisores: {},
          motoristas: {},
          viagensCount: 0,
          ultimaRota: '',
          hasBilling: false
        };
      }

      const g = groups[p];
      g.faturamento += v.valorCarga || 0;
      g.kmTotal += v.kmRodado || 0;
      g.despesaOficinaTotal += v.despesaOficina || 0;

      if (!isSemFaturamento(v)) {
        g.viagensCount += 1;
        g.hasBilling = true;
      }

      const sup = v.supervisao || 'Sem Supervisor';
      g.supervisores[sup] = (g.supervisores[sup] || 0) + 1;

      const mot = v.motorista || 'Sem Motorista';
      g.motoristas[mot] = (g.motoristas[mot] || 0) + 1;

      if (v.rota) {
        g.ultimaRota = v.rota;
      }
    });

    const list = Object.values(groups).map(g => {
      const targetMeta = activeMonthsCount * 4;
      const percentMeta = targetMeta > 0 ? Math.min(1000, Math.round((g.viagensCount / targetMeta) * 100)) : 0;

      // Find principal supervisor
      let supervisor = 'Sem Supervisor';
      const sups = g.supervisores;
      const realSups = Object.keys(sups).filter(sup => {
        const s = sup.toUpperCase().trim();
        return s !== 'CAMINHAO PARADO' && s !== 'SEM SUPERVISOR' && s !== '';
      });
      if (realSups.length > 0) {
        let maxSupCount = -1;
        realSups.forEach(sup => {
          if (sups[sup] > maxSupCount) {
            maxSupCount = sups[sup];
            supervisor = sup;
          }
        });
      } else {
        let maxSupCount = -1;
        Object.keys(sups).forEach(sup => {
          if (sups[sup] > maxSupCount) {
            maxSupCount = sups[sup];
            supervisor = sup;
          }
        });
      }

      // Find principal motorista
      let motorista = 'Sem Motorista';
      let maxMotCount = -1;
      Object.keys(g.motoristas).forEach(mot => {
        if (g.motoristas[mot] > maxMotCount) {
          maxMotCount = g.motoristas[mot];
          motorista = mot;
        }
      });

      return {
        placa: g.placa,
        viagensCount: g.viagensCount,
        faturamentoTotal: g.faturamento,
        kmRodadoTotal: g.kmTotal,
        despesaOficinaTotal: g.despesaOficinaTotal,
        percentMeta,
        statusMeta: g.viagensCount >= targetMeta ? 'Dentro da Meta' : 'Fora da Meta',
        supervisor,
        motorista,
        ultimaRota: g.ultimaRota || 'Sem rota programada',
        targetMeta,
        statusFaturamento: (g.hasBilling ? 'FATUROU' : 'SEM FATURAMENTO') as 'SEM FATURAMENTO' | 'FATUROU'
      };
    });

    return list.sort((a, b) => b.viagensCount - a.viagensCount || b.faturamentoTotal - a.faturamentoTotal);
  }, [activeViagens, activeMonthsCount]);

  const computedSupervisorRankings = React.useMemo(() => {
    const rankingActiveMonthsCount = selectedMeses && selectedMeses.length > 0 
      ? selectedMeses.length 
      : mesesDrop.length;
    // Compute plate rankings for the filtered subset of trips to get the statusMeta correctly evaluated
    const plateMetrics = computePlacaMetrics(activeViagens, activeViagens, rankingActiveMonthsCount);
    
    const supMap: Record<string, {
      supervisor: string;
      faturamento: number;
      viagensCount: number;
      platesDentro: number;
      platesFora: number;
      totalPlates: number;
      platesList: { placa: string; statusMeta: string; faturamento: number; viagens: number }[];
    }> = {};
    
    plateMetrics.forEach(p => {
      const sup = p.supervisor || 'Sem Supervisor';
      if (!supMap[sup]) {
        supMap[sup] = {
          supervisor: sup,
          faturamento: 0,
          viagensCount: 0,
          platesDentro: 0,
          platesFora: 0,
          totalPlates: 0,
          platesList: []
        };
      }
      const sData = supMap[sup];
      sData.faturamento += p.faturamentoTotal || 0;
      sData.viagensCount += p.viagensCount || 0;
      sData.totalPlates += 1;
      if (p.statusMeta === 'Dentro da Meta') {
        sData.platesDentro += 1;
      } else {
        sData.platesFora += 1;
      }
      sData.platesList.push({
        placa: p.placa,
        statusMeta: p.statusMeta || 'Fora da Meta',
        faturamento: p.faturamentoTotal || 0,
        viagens: p.viagensCount || 0
      });
    });
    
    const arr = Object.values(supMap).map(s => {
      const metaAproveitamento = s.totalPlates > 0 
        ? Math.round((s.platesDentro / s.totalPlates) * 100) 
        : 0;
      return {
        ...s,
        metaAproveitamento
      };
    });
    
    const byFaturamento = [...arr].sort((a, b) => b.faturamento - a.faturamento);
    const byViagens = [...arr].sort((a, b) => b.viagensCount - a.viagensCount);
    // Sort logic for compliance meta rankings:
    // Sort by:
    // 1st. Number of plates inside target (platesDentro) descending,
    // 2nd. If equal, by % of target achievement (metaAproveitamento) descending,
    // 3rd. If equal, by total faturamento descending.
    const byMeta = [...arr].sort((a, b) => {
      if (b.platesDentro !== a.platesDentro) {
        return b.platesDentro - a.platesDentro;
      }
      if (b.metaAproveitamento !== a.metaAproveitamento) {
        return b.metaAproveitamento - a.metaAproveitamento;
      }
      return b.faturamento - a.faturamento;
    });
    
    return {
      all: arr,
      byFaturamento,
      byViagens,
      byMeta
    };
  }, [activeViagens, selectedMeses, mesesDrop]);

  const sortedAndFilteredAllSupervisors = React.useMemo(() => {
    let result = [...computedSupervisorRankings.all];
    
    // Filter by name search
    if (rankingSearchQuery.trim()) {
      const q = rankingSearchQuery.toLowerCase();
      result = result.filter(s => s.supervisor.toLowerCase().includes(q));
    }
    
    // Sort by selected field and direction
    result.sort((a: any, b: any) => {
      let valA = a[rankingSortField];
      let valB = b[rankingSortField];
      
      if (typeof valA === 'string') {
        valA = valA.toUpperCase();
        valB = valB.toUpperCase();
      }
      
      if (valA < valB) return rankingSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return rankingSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  }, [computedSupervisorRankings, rankingSearchQuery, rankingSortField, rankingSortDirection]);

  // ADICIONAR VALIDAÇÃO: Exibir temporariamente no console
  React.useEffect(() => {
    const totalPlacasEncontradas = new Set(activeViagens.map(v => v.placa)).size;
    
    // Calculate category breakdown matching rankings
    const c1 = rankings.filter(r => r.viagensCount === 1).length;
    const c2 = rankings.filter(r => r.viagensCount === 2).length;
    const c3 = rankings.filter(r => r.viagensCount === 3).length;
    const c4 = rankings.filter(r => r.viagensCount === 4).length;
    const c5 = rankings.filter(r => r.viagensCount >= 5).length;
    const somaTotalCategorias = c1 + c2 + c3 + c4 + c5;

    console.log("=== VALIDAÇÃO DE CONTEÚDO ===");
    console.log("Total de registros da base:", viagens ? viagens.length : 0);
    console.log("Total após filtros:", activeViagens ? activeViagens.length : 0);
    console.log("Meses selecionados:", selectedMeses && selectedMeses.length > 0 ? selectedMeses : "Todos (Nenhum selecionado)");
    console.log("Quantidade de placas encontradas:", totalPlacasEncontradas);
    console.log("-----------------------------");
    console.log("AUDITORIA DE FAIXAS DE VIAGENS");
    console.log("Total de Placas:", rankings.length);
    console.log("Placas com 1 viagem:", c1);
    console.log("Placas com 2 viagens:", c2);
    console.log("Placas com 3 viagens:", c3);
    console.log("Placas com 4 viagens:", c4);
    console.log("Placas com 5 ou mais viagens:", c5);
    console.log("Soma Total:", somaTotalCategorias, "placas");
    console.log("=============================");
  }, [viagens, activeViagens, selectedMeses, rankings]);

  const potentialRevenueByMonth = React.useMemo(() => {
    // We want the months sorted in chronological order.
    const mesesOrdem = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Find all unique months present in preFilteredViagens
    const uniqueMonths = Array.from(new Set(preFilteredViagens.map(v => v.mes || 'Maio')))
      .sort((a, b) => mesesOrdem.indexOf(a) - mesesOrdem.indexOf(b));

    const monthlyData = uniqueMonths.map(mes => {
      const voyagesInMonth = preFilteredViagens.filter(v => (v.mes || 'Maio') === mes);

      // Group by plate to find which ones billed and which ones did not
      const plateMap: Record<string, { faturamento: number; hasBilling: boolean }> = {};
      voyagesInMonth.forEach(v => {
        const p = v.placa.trim().toUpperCase();
        if (!p) return;
        if (!plateMap[p]) {
          plateMap[p] = { faturamento: 0, hasBilling: false };
        }
        plateMap[p].faturamento += v.valorCarga || 0;
        if (!isSemFaturamento(v)) {
          plateMap[p].hasBilling = true;
        }
      });

      const platesFaturadas = Object.keys(plateMap).filter(p => plateMap[p].hasBilling);
      const platesSemFaturamentoInfo = Object.keys(plateMap).filter(p => !plateMap[p].hasBilling);

      const countFaturadas = platesFaturadas.length;
      const countSemFaturamento = platesSemFaturamentoInfo.length;

      const faturamentoTotal = voyagesInMonth.reduce((sum, v) => sum + (v.valorCarga || 0), 0);
      const faturamentoMedio = countFaturadas > 0 ? (faturamentoTotal / countFaturadas) : 0;
      const receitaPotencial = faturamentoMedio * countSemFaturamento;

      return {
        mes,
        countFaturadas,
        countSemFaturamento,
        faturamentoMedio,
        receitaPotencial,
        faturamentoTotal
      };
    });

    return monthlyData;
  }, [preFilteredViagens]);

  // Aggregate stats across all active months for the card
  const potentialRevenueTotalStats = React.useMemo(() => {
    const totalReceitaPotencial = potentialRevenueByMonth.reduce((sum, item) => sum + item.receitaPotencial, 0);
    const totalPlacasSemFaturamento = potentialRevenueByMonth.reduce((sum, item) => sum + item.countSemFaturamento, 0);

    const plateMap: Record<string, { faturamento: number; hasBilling: boolean }> = {};
    preFilteredViagens.forEach(v => {
      const p = v.placa.trim().toUpperCase();
      if (!p) return;
      if (!plateMap[p]) {
        plateMap[p] = { faturamento: 0, hasBilling: false };
      }
      plateMap[p].faturamento += v.valorCarga || 0;
      if (!isSemFaturamento(v)) {
        plateMap[p].hasBilling = true;
      }
    });

    const platesFaturadas = Object.keys(plateMap).filter(p => plateMap[p].hasBilling);
    const countFaturadas = platesFaturadas.length;

    const faturamentoTotal = preFilteredViagens.reduce((sum, v) => sum + (v.valorCarga || 0), 0);
    const faturamentoMedioGeral = countFaturadas > 0 ? (faturamentoTotal / countFaturadas) : 0;

    return {
      totalReceitaPotencial,
      totalPlacasSemFaturamento,
      faturamentoMedioGeral
    };
  }, [potentialRevenueByMonth, preFilteredViagens]);

  const topRotasMaiorFaturamento = React.useMemo(() => {
    return [...rotas].sort((a, b) => b.totalValue - a.totalValue).slice(0, 5);
  }, [rotas]);

  const topRotasPiorFaturamento = React.useMemo(() => {
    return [...rotas].sort((a, b) => a.totalValue - b.totalValue).slice(0, 5);
  }, [rotas]);

  const topRotasMaiorViagens = React.useMemo(() => {
    return [...rotas].sort((a, b) => b.totalTrips - a.totalTrips).slice(0, 5);
  }, [rotas]);

  const topRotasMenorViagens = React.useMemo(() => {
    return [...rotas].sort((a, b) => a.totalTrips - b.totalTrips).slice(0, 5);
  }, [rotas]);

  const selectedRouteDetails = React.useMemo(() => {
    if (!selectedRouteName) return null;
    const filtered = activeViagens.filter(v => v.rota === selectedRouteName);
    const activeTrips = filtered.filter(v => !isSemFaturamento(v));
    const totalTrips = activeTrips.length;
    if (filtered.length === 0) return null;

    const totalDays = filtered.reduce((sum, v) => sum + (v.qtdDias || 0), 0);
    const avgDays = totalTrips > 0 ? parseFloat((totalDays / totalTrips).toFixed(1)) : 0;

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
      if (!isSemFaturamento(v)) {
        driverGroups[dName].viagens += 1;
      }
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
      if (!plateGroups[p]) {
        plateGroups[p] = 0;
      }
      if (!isSemFaturamento(v)) {
        plateGroups[p] += 1;
      }
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

    const currentTarget = activeMonthsCount * 4;

    return Object.keys(groups).map(sup => {
      const g = groups[sup];
      
      let dentro = 0;
      let fora = 0;
      Object.keys(g.plateViagens).forEach(p => {
        if (g.plateViagens[p] >= currentTarget) {
          dentro += 1;
        } else {
          fora += 1;
        }
      });

      const supervisorMeta = g.plates.size * currentTarget;
      const metaAtingidaPercent = supervisorMeta > 0 ? Math.round((g.viagensCount / supervisorMeta) * 100) : 0;
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
  }, [activeViagens, activeMonthsCount]);

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
    if (billingFilter === 'FATURADO') {
      list = list.filter(v => !isSemFaturamento(v));
    } else if (billingFilter === 'NAO_FATURADO') {
      list = list.filter(v => isSemFaturamento(v));
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
      const mesNome = normalizeMonthName(v.mes || 'Meticuloso');
      const mesNum = mapMes(mesNome);
      const key = `${ano}-${mesNum}`;

      if (!groups[key]) {
        groups[key] = {
          key,
          ano,
          mesNome,
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
  }, [viagens, selectedFiliais, selectedSupervisores, searchQuery, billingFilter]);

  // Effect to select default comparison key when the list loads or updates
  React.useEffect(() => {
    if (comparativoMensal.length > 0) {
      let targetKey = selectedComparisonKey;
      let baseKey = comparisonBaseKey;
      let targetUpdated = false;
      let baseUpdated = false;

      if (!targetKey || !comparativoMensal.some(c => c.key === targetKey)) {
        targetKey = comparativoMensal[comparativoMensal.length - 1].key;
        targetUpdated = true;
      }

      const activeIdx = comparativoMensal.findIndex(c => c.key === targetKey);
      if (!baseKey || !comparativoMensal.some(c => c.key === baseKey)) {
        if (activeIdx > 0) {
          baseKey = comparativoMensal[activeIdx - 1].key;
        } else {
          baseKey = comparativoMensal[0].key;
        }
        baseUpdated = true;
      }

      if (targetUpdated || baseUpdated) {
        const finalTargetKey = targetKey;
        const finalBaseKey = baseKey;
        const timer = setTimeout(() => {
          if (targetUpdated) {
            setSelectedComparisonKey(finalTargetKey);
          }
          if (baseUpdated) {
            setComparisonBaseKey(finalBaseKey);
          }
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [comparativoMensal, selectedComparisonKey, comparisonBaseKey]);

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

          <button
            onClick={() => { updateActiveTab('ranking_supervisao'); updateSearchQuery(''); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              activeTab === 'ranking_supervisao'
                ? 'bg-[#6cf8bb] text-[#00714d] shadow-sm font-extrabold'
                : 'text-[#434655] hover:bg-gray-100 hover:text-[#0b1c30]'
            }`}
          >
            <Award className="w-4.5 h-4.5" />
            <span>Ranking Supervisão</span>
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
              onClick={() => { updateActiveTab('perfil'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'perfil'
                  ? 'bg-[#004ac6]/10 text-[#004ac6]'
                  : 'text-[#434655] hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              Configuração Perfil
            </button>
             <button
              onClick={async () => {
                await clearViagensFromDB();
                setViagens([]);
                
                // Reset states
                setSelectedFiliais([]);
                setSelectedAnos([]);
                setSelectedMeses([]);
                setSelectedSupervisores([]);
                setStatusMetaFilter('ALL');
                setSearchQuery('');
                setSearchMotorista('');
                setSearchPlaca('');
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

            {/* Billing Filter (Faturamento/Faturado) */}
            <div className="flex bg-[#eff4ff] p-1 rounded-lg border border-[#c3c6d7]/30 items-center">
              <span className="text-[9px] font-black uppercase text-[#737686] px-1.5 whitespace-nowrap hidden sm:inline border-r border-[#c3c6d7]/30 mr-1.5">Faturamento</span>
              <button
                onClick={() => updateBillingFilter('ALL')}
                className={`px-2 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                  billingFilter === 'ALL'
                    ? 'bg-[#004ac6] text-white shadow-xs font-black'
                    : 'text-[#434655] hover:text-[#0b1c30]'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => updateBillingFilter('FATURADO')}
                className={`px-2 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                  billingFilter === 'FATURADO'
                    ? 'bg-[#00714d] text-white shadow-xs font-black'
                    : 'text-[#434655] hover:text-[#00714d]'
                }`}
              >
                Faturado
              </button>
              <button
                onClick={() => updateBillingFilter('NAO_FATURADO')}
                className={`px-2 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                  billingFilter === 'NAO_FATURADO'
                    ? 'bg-[#ab0b1c] text-white shadow-xs font-black'
                    : 'text-[#434655] hover:text-[#ab0b1c]'
                }`}
              >
                Não Faturado
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

                  {/* Compact Base de Dados Status Indicator */}
                  <div className="flex items-center gap-2 bg-white border border-[#c3c6d7]/40 px-2.5 py-1 rounded-xl shadow-3xs text-[10px] font-bold text-slate-600 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00714d] animate-pulse" />
                    <span className="font-extrabold text-[#00714d] tracking-wider uppercase pr-1.5 border-r border-slate-200">Sincronizado</span>
                    <span className="text-[#004ac6] font-semibold pl-0.5">
                      Última atualização: {lastUpdate ? lastUpdate.lastUploadedAt.replace(' às', '') : '01/06/2026 16:10'}
                    </span>
                  </div>
                </header>



                {/* KPI metrics row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-3">
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

                  {/* KPI: KM TOTAL RODADO */}
                  <div className="bg-white border border-[#c3c6d7]/30 p-4 rounded-xl shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#737686] uppercase">KM Total Rodado</span>
                        <span className="text-[10px] font-bold text-[#004ac6] bg-[#eff4ff] px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                          <Route className="w-2.5 h-2.5" /> Km
                        </span>
                      </div>
                      <p className="text-2xl font-black text-[#0b1c30] tracking-tight mt-2.5">
                        {metrics.kmRodadoTotal.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <p className="text-[9px] text-[#737686] mt-3 font-semibold uppercase tracking-wider">
                      Total de Km rodado
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

                  {/* KPI: Placas Sem Faturamento */}
                  <SemFaturamentoTooltip plates={platesSemFaturamento} percent={pctSemFaturamento}>
                    <div className="bg-white border border-[#c3c6d7]/30 p-4 rounded-xl shadow-xs flex flex-col justify-between border-l-4 border-l-[#ab0b1c]/70 hover:border-[#ab0b1c] transition-colors h-full select-none">
                      <div>
                        <span className="text-[11px] font-bold text-[#ab0b1c] uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ab0b1c]" /> Sem Faturamento
                        </span>
                        <p className="text-2xl font-black text-[#ab0b1c] tracking-tight mt-2.5">
                          {platesSemFaturamento.length}
                          <span className="text-xs font-semibold text-slate-500 ml-1.5">
                            ({pctSemFaturamento}%)
                          </span>
                        </p>
                      </div>
                      <p className="text-[9px] text-[#737686] mt-3 font-semibold uppercase tracking-wider flex items-center justify-between">
                        <span>Frota ativa sem receita</span>
                        <span className="text-[8px] bg-red-50 text-red-600 px-1 py-0.2 rounded font-black border border-red-200">HOVER INFO</span>
                      </p>
                    </div>
                  </SemFaturamentoTooltip>

                  {/* KPI: Receita Potencial Não Faturada */}
                  <div className="bg-white border border-[#c3c6d7]/30 p-4 rounded-xl shadow-xs flex flex-col justify-between border-l-4 border-l-amber-500 hover:border-amber-500 transition-colors h-full select-none">
                    <div>
                      <span className="text-[11px] font-bold text-amber-600 uppercase flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5 shrink-0" /> Receita Potencial
                      </span>
                      <p className="text-xl font-black text-[#0b1c30] tracking-tight mt-2.5">
                        R$ {potentialRevenueTotalStats.totalReceitaPotencial.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
                        {potentialRevenueTotalStats.totalPlacasSemFaturamento} {potentialRevenueTotalStats.totalPlacasSemFaturamento === 1 ? 'placa' : 'placas'} sem receita
                      </p>
                    </div>
                    <p className="text-[9px] text-[#737686] mt-3 font-semibold uppercase tracking-wider">
                      Baseado na média de faturamento das placas ativas
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
                      ≥ 4 viagens por veículo/mês
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
                      &lt; 4 viagens por veículo/mês
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
                      <p className="text-[11px] text-[#737686] mt-1">Progresso total • {metrics.metaGlobal} viagens/mês</p>
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
                          strokeDasharray={`${(metrics.foraMetaCount / ((metrics.dentroMetaCount + metrics.foraMetaCount) || 1)) * 100} ${100 - (metrics.foraMetaCount / ((metrics.dentroMetaCount + metrics.foraMetaCount) || 1)) * 100}`}
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
                          strokeDasharray={`${(metrics.dentroMetaCount / ((metrics.dentroMetaCount + metrics.foraMetaCount) || 1)) * 100} ${100 - (metrics.dentroMetaCount / ((metrics.dentroMetaCount + metrics.foraMetaCount) || 1)) * 100}`}
                          strokeDashoffset={`${100 - (metrics.foraMetaCount / ((metrics.dentroMetaCount + metrics.foraMetaCount) || 1)) * 100}`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      {/* Labeled overlay */}
                      <div className="absolute text-center flex flex-col justify-center items-center">
                        <p className="text-2xl sm:text-3xl font-black text-[#0b1c30] leading-none">{metrics.dentroMetaCount + metrics.foraMetaCount}</p>
                        <p className="text-[9px] text-[#737686] font-bold uppercase tracking-wider mt-1 font-sans">Placas/Mês</p>
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

                  {/* Evolução da Receita Potencial Não Faturada Line Chart */}
                  <div className="col-span-12 lg:col-span-6 bg-white border border-[#c3c6d7]/30 rounded-xl p-6 shadow-xs flex flex-col justify-between min-h-[352px]">
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-[#0b1c30]">Evolução da Receita Potencial Não Faturada</h4>
                          <p className="text-[11px] text-[#737686] mt-1">Evolução mensal do faturamento não realizado</p>
                        </div>
                        <span className="text-[9px] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded uppercase font-mono">OPORTUNIDADE</span>
                      </div>
                    </div>

                    {/* Interactive SVG Line Chart */}
                    <div className="flex-1 my-4 relative h-48 flex items-center justify-center">
                      {potentialRevenueByMonth.length === 0 ? (
                        <div className="text-xs font-bold text-gray-400 py-12">Nenhum dado mensal disponível para exibição.</div>
                      ) : (() => {
                        const chartHoveredIndex = potentialChartHoveredIndex;
                        const setChartHoveredIndex = setPotentialChartHoveredIndex;

                        // Layout Constants
                        const chartHeight = 160;
                        const chartWidth = 460;
                        const paddingLeft = 45;
                        const paddingRight = 15;
                        const paddingTop = 20;
                        const paddingBottom = 25;

                        const visibleWidth = chartWidth - paddingLeft - paddingRight;
                        const visibleHeight = chartHeight - paddingTop - paddingBottom;

                        // Find maximum potential revenue to scale the graph
                        const maxVal = Math.max(...potentialRevenueByMonth.map(d => d.receitaPotencial), 1000) * 1.15;

                        // Helper coordinates generator
                        const points = potentialRevenueByMonth.map((d, index) => {
                          const x = paddingLeft + (potentialRevenueByMonth.length > 1
                            ? (index / (potentialRevenueByMonth.length - 1)) * visibleWidth
                            : visibleWidth / 2);
                          const y = chartHeight - paddingBottom - (d.receitaPotencial / maxVal) * visibleHeight;
                          return { x, y, d };
                        });

                        // Svg Path generator string
                        let pathData = "";
                        let areaData = "";
                        if (points.length > 0) {
                          pathData = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
                          areaData = pathData + ` L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`;
                        }

                        // Generate some standard y-axis ticks cleanly
                        const yTicks = [0, maxVal / 2, maxVal];

                        return (
                          <div className="w-full h-full relative" onMouseLeave={() => setChartHoveredIndex(null)}>
                            <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="potentialGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.12" />
                                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                                </linearGradient>
                                <filter id="redShadow" x="-10%" y="-10%" width="120%" height="120%">
                                  <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#ef4444" floodOpacity="0.2" />
                                </filter>
                              </defs>

                              {/* Horizontal background gridlines */}
                              {yTicks.map((tick, idx) => {
                                const y = chartHeight - paddingBottom - (tick / maxVal) * visibleHeight;
                                return (
                                  <line
                                    key={idx}
                                    x1={paddingLeft}
                                    y1={y}
                                    x2={chartWidth - paddingRight}
                                    y2={y}
                                    stroke="#e2e8f0"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                  />
                                );
                              })}

                              {/* Hover vertical timeline guideline */}
                              {chartHoveredIndex !== null && points[chartHoveredIndex] && (
                                <line
                                  x1={points[chartHoveredIndex].x}
                                  y1={paddingTop}
                                  x2={points[chartHoveredIndex].x}
                                  y2={chartHeight - paddingBottom}
                                  stroke="#ef4444"
                                  strokeWidth="1"
                                  strokeDasharray="3 3"
                                  opacity="0.4"
                                />
                              )}

                              {/* Gradient overlay fill below line */}
                              {areaData && (
                                <path d={areaData} fill="url(#potentialGrad)" className="transition-all duration-500" />
                              )}

                              {/* Line Path */}
                              {pathData && (
                                <path
                                  d={pathData}
                                  fill="none"
                                  stroke="#dc2626"
                                  strokeWidth="1.75"
                                  strokeLinecap="round"
                                  filter="url(#redShadow)"
                                  className="transition-all duration-500 animate-fade-in"
                                />
                              )}

                              {/* Interactive dots with ring styling */}
                              {points.map((p, idx) => (
                                <g key={idx}>
                                  <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={chartHoveredIndex === idx ? 6.5 : 4}
                                    fill={chartHoveredIndex === idx ? "#dc2626" : "#ffffff"}
                                    stroke="#dc2626"
                                    strokeWidth={chartHoveredIndex === idx ? 2.5 : 1.75}
                                    style={{ transition: "all 0.15s ease-out" }}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedPotentialMonth(p.d.mes)}
                                  />
                                </g>
                              ))}

                              {/* Y Axis Tick Labels */}
                              {yTicks.map((tick, idx) => {
                                const y = chartHeight - paddingBottom - (tick / maxVal) * visibleHeight;
                                return (
                                  <text
                                    key={idx}
                                    x={paddingLeft - 8}
                                    y={y + 3.5}
                                    textAnchor="end"
                                    fill="#64748b"
                                    className="text-[9px] font-bold font-mono"
                                  >
                                    {tick >= 1000000 
                                      ? `R$ ${(tick / 1000000).toFixed(1)}M` 
                                      : `R$ ${(tick / 1000).toFixed(0)}k`
                                    }
                                  </text>
                                );
                              })}

                              {/* X Axis Labels */}
                              {points.map((p, idx) => (
                                <text
                                  key={idx}
                                  x={p.x}
                                  y={chartHeight - 8}
                                  textAnchor="middle"
                                  fill="#64748b"
                                  className="text-[9px] font-bold"
                                >
                                  {p.d.mes.slice(0, 3)}
                                </text>
                              ))}
                            </svg>

                            {/* Invisible Column overlays to simplify mouse hovering */}
                            <div className="absolute inset-0 flex" style={{ paddingLeft, paddingRight, paddingTop, paddingBottom: paddingBottom }}>
                              {points.map((p, idx) => (
                                <div
                                  key={idx}
                                  className="h-full flex-1 cursor-pointer"
                                  onMouseEnter={() => setChartHoveredIndex(idx)}
                                  onClick={() => setSelectedPotentialMonth(p.d.mes)}
                                />
                              ))}
                            </div>

                            {/* Rich Hover Tooltip Overlay with flawless pt-BR formatting */}
                            {chartHoveredIndex !== null && points[chartHoveredIndex] && (() => {
                              const item = points[chartHoveredIndex].d;
                              const posX = points[chartHoveredIndex].x;
                              const isLeft = chartHoveredIndex > points.length / 2;

                              return (
                                <div
                                  className="absolute bg-slate-900 text-white rounded-xl p-4 shadow-2xl border border-slate-800 pointer-events-none z-10 text-xs w-64 flex flex-col gap-2 font-sans tracking-wide"
                                  style={{
                                    top: "-30px",
                                    left: isLeft ? `${posX - 275}px` : `${posX + 15}px`,
                                    transition: "left 0.1s ease-out"
                                  }}
                                >
                                  <div className="font-black text-[#f59e0b] uppercase text-sm mb-1.5 border-b border-white/10 pb-1.5 flex items-center justify-between">
                                    <span>{item.mes}</span>
                                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">PERDA POTENCIAL</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs text-gray-300">
                                    <span>Placas faturadas:</span>
                                    <span className="font-extrabold text-white text-sm">{item.countFaturadas}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs text-gray-300">
                                    <span>Placas sem faturamento:</span>
                                    <span className="font-extrabold text-amber-400 text-sm">{item.countSemFaturamento}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs text-gray-300">
                                    <span>Faturamento médio:</span>
                                    <span className="font-mono font-bold text-white text-sm">
                                      R$ {item.faturamentoMedio.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-1.5 text-amber-400 font-extrabold text-xs">
                                    <span>Receita potencial perdida:</span>
                                    <span className="font-mono text-sm">
                                      R$ {item.receitaPotencial.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                    </span>
                                  </div>
                                  <div className="text-[9px] text-amber-350/70 font-bold uppercase mt-1 italic text-center border-t border-white/5 pt-1.5">
                                    ✨ Clique para listar placas e filiais
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="text-[10px] text-gray-500 font-bold text-center border-t border-slate-100 pt-2.5">
                      Passe o mouse para detalhar ou clique para ver a lista de placas e filiais.
                    </div>
                  </div>
                </div>

                {/* Lower Charts row */}
                <div className="grid grid-cols-12 gap-6 mt-8">
                  {/* Faturamento por Placa Bar Chart horizontal with rounded ends */}
                  <div className="col-span-12 lg:col-span-4 bg-white border border-[#c3c6d7]/30 rounded-xl p-6 shadow-xs flex flex-col justify-between min-h-[352px]">
                    <div>
                      <h4 className="text-xs font-bold text-[#0b1c30]">Faturamento por Placa</h4>
                      <p className="text-[11px] text-[#737686] mt-1 mb-6">Valor total faturado (R$)</p>
                    </div>

                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                      {(() => {
                        const topRankings = rankings.slice(0, 4);
                        const maxFaturamentoPlaca = Math.max(...topRankings.map(r => r.faturamentoTotal), 1);
                        return topRankings.map((r, index) => {
                          const isHighPerf = r.statusMeta === 'Dentro da Meta';
                          const formattedVal = r.faturamentoTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
                          const barWidthPercent = (r.faturamentoTotal / maxFaturamentoPlaca) * 100;
                          return (
                            <div key={`${r.placa}-${r.mes || ''}-${r.ano || ''}-${index}`} className="flex items-center gap-4 group">
                              <span className="w-16 text-[10px] font-extrabold text-[#434655] tracking-wider text-left leading-none uppercase truncate" title={`${r.placa} ${r.mes ? `(${r.mes})` : ''}`}>
                                {r.placa} {r.mes && `(${r.mes.slice(0,3)})`}
                              </span>
                              <div className="flex-1 bg-gray-50 h-7.5 rounded-md overflow-hidden flex items-center relative pr-2">
                                <motion.div
                                  initial={{ width: '0%' }}
                                  animate={{ width: `${Math.max(4, barWidthPercent)}%` }}
                                  transition={{ type: 'spring', stiffness: 45 }}
                                  className={`h-full ${isHighPerf ? 'bg-[#004ac6]' : 'bg-[#ab0b1c]'} rounded-r-md group-hover:opacity-90`}
                                />
                                <span className="absolute right-2 text-[10px] font-black text-black">
                                  R$ {formattedVal}
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Top Placas por Viagens card ranking */}
                  <div className="col-span-12 lg:col-span-4 bg-white border border-[#c3c6d7]/30 rounded-xl p-6 shadow-xs flex flex-col justify-between min-h-[352px]">
                    <div>
                      <h4 className="text-xs font-bold text-[#0b1c30]">Top Placas por Viagens</h4>
                      <p className="text-[11px] text-[#737686] mt-1">Ranking de produtividade da frota</p>
                    </div>

                    <div className="my-4 space-y-4 flex-1 justify-center flex flex-col">
                      {rankings.slice(0, 4).map((r, index) => {
                        const trophyColors = ["text-[#cca43b]", "text-[#737686]", "text-[#ab0b1c]"];
                        return (
                          <div key={`${r.placa}-${r.mes || ''}-${r.ano || ''}-${index}`} className="flex items-center gap-4">
                            <div className="w-8 h-8 flex items-center justify-center bg-[#eff4ff] rounded-lg">
                              {index < 3 ? (
                                <Award className={`w-4.5 h-4.5 ${trophyColors[index] || 'text-[#737686]'}`} />
                              ) : (
                                <span className="text-[11px] font-black text-[#737686]">{index + 1}</span>
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex justify-between items-center text-xs font-bold leading-none mb-1.5">
                                <span className="text-[#0b1c30]">{r.placa} {r.mes && `(${r.mes.slice(0, 3)})`}</span>
                                <span className="text-[#004ac6] text-[10px]">{r.percentMeta}% meta</span>
                              </div>
                              <div className="w-full bg-[#eff4ff] h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#004ac6]"
                                  style={{ width: `${Math.min(100, (r.viagensCount / 4) * 100)}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-black text-[#004ac6] w-6 text-right leading-none">
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

                  {/* List of active top performance drivers styled inside clean bento card */}
                  <div className="col-span-12 lg:col-span-4 bg-white border border-[#c3c6d7]/30 rounded-xl p-6 shadow-xs flex flex-col justify-between min-h-[352px]">
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
                  </div>
                </div>
              </motion.div>
            )}

            {/* View tab: Veículos (Unique license plates with search highlighted) */}
            {activeTab === 'vehiculos' && (() => {
              // Local variables and calculations on rendering
              const totalPlacas = rankings.length;
              const dentroMetaCount = rankings.filter(r => r.statusMeta === 'Dentro da Meta').length;
              const foraMetaCount = rankings.filter(r => r.statusMeta === 'Fora da Meta').length;
              const dentroMetaPercent = totalPlacas > 0 ? Math.round((dentroMetaCount / totalPlacas) * 100) : 0;
              const foraMetaPercent = totalPlacas > 0 ? Math.round((foraMetaCount / totalPlacas) * 100) : 0;

              // Trips-based target metrics
              const tripsDentroCount = rankings.filter(r => r.statusMeta === 'Dentro da Meta').reduce((sum, r) => sum + r.viagensCount, 0);
              const tripsForaCount = rankings.filter(r => r.statusMeta === 'Fora da Meta').reduce((sum, r) => sum + r.viagensCount, 0);
              const totalTripsCount = tripsDentroCount + tripsForaCount;
              const tripsDentroPercent = totalTripsCount > 0 ? Math.round((tripsDentroCount / totalTripsCount) * 100) : 0;
              const tripsForaPercent = totalTripsCount > 0 ? 100 - tripsDentroPercent : 0;

              const totalTrips = activeViagens.filter(v => !isSemFaturamento(v)).length;
              const mediaViagens = totalPlacas > 0 ? (totalTrips / totalPlacas).toFixed(1).replace('.', ',') : '0';

              const melhorPlaca = rankings[0]?.placa || 'N/A';
              const melhorPlacaViagens = rankings[0]?.viagensCount || 0;

              // Find top faturamento plate
              const sortedByFat = [...rankings].sort((a, b) => b.faturamentoTotal - a.faturamentoTotal);
              const highestRevenuePlate = sortedByFat[0];
              const maiorFaturamentoValue = highestRevenuePlate?.faturamentoTotal || 0;
              const maiorFaturamentoPlaca = highestRevenuePlate?.placa || 'N/A';

              // Format compact format (e.g. 1.191.700 -> R$ 1.191,7k)
              const formatCargoCompactLocal = (val: number) => {
                const kVal = val / 1000;
                return `R$ ${kVal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k`;
              };

              // Faturamento por status da meta
              const faturamentoDentro = rankings.filter(r => r.statusMeta === 'Dentro da Meta').reduce((sum, r) => sum + r.faturamentoTotal, 0);
              const faturamentoFora = rankings.filter(r => r.statusMeta !== 'Dentro da Meta').reduce((sum, r) => sum + r.faturamentoTotal, 0);
              const totalFaturamentoStatus = faturamentoDentro + faturamentoFora;

              const percentDentroFat = totalFaturamentoStatus > 0 ? (faturamentoDentro / totalFaturamentoStatus) * 100 : 0;
              const percentForaFat = totalFaturamentoStatus > 0 ? (faturamentoFora / totalFaturamentoStatus) * 100 : 0;

              // Distribution of trips counts computed directly using plate rankings to ensure perfect alignment with modais & active filters
              const c1 = rankings.filter(r => r.viagensCount === 1).length;
              const c2 = rankings.filter(r => r.viagensCount === 2).length;
              const c3 = rankings.filter(r => r.viagensCount === 3).length;
              const c4 = rankings.filter(r => r.viagensCount === 4).length;
              const c5 = rankings.filter(r => r.viagensCount >= 5).length;

              const totalForDist = c1 + c2 + c3 + c4 + c5 || 1;

              const barData = [
                { label: '1 viagem', count: c1, percent: ((c1 / totalForDist) * 100).toFixed(1) },
                { label: '2 viagens', count: c2, percent: ((c2 / totalForDist) * 100).toFixed(1) },
                { label: '3 viagens', count: c3, percent: ((c3 / totalForDist) * 100).toFixed(1) },
                { label: '4 viagens', count: c4, percent: ((c4 / totalForDist) * 100).toFixed(1) },
                { label: '5 ou mais', count: c5, percent: ((c5 / totalForDist) * 100).toFixed(1) },
              ];

              const totalForDistSafe = totalForDist || 1;
              const p1 = (c1 / totalForDistSafe) * 100;
              const p2 = (c2 / totalForDistSafe) * 100;
              const p3 = (c3 / totalForDistSafe) * 100;
              const p4 = (c4 / totalForDistSafe) * 100;
              const p5 = (c5 / totalForDistSafe) * 100;

              const s1 = (p1 / 100) * 50.265;
              const s2 = (p2 / 100) * 50.265;
              const s3 = (p3 / 100) * 50.265;
              const s4 = (p4 / 100) * 50.265;
              const s5 = (p5 / 100) * 50.265;

              const maxCount = Math.max(...barData.map(d => d.count), 1);
              const maxTick = Math.ceil(maxCount / 10) * 10 || 10;
              const ticks = [maxTick, Math.round(maxTick * 0.8), Math.round(maxTick * 0.6), Math.round(maxTick * 0.4), Math.round(maxTick * 0.2), 0];

              const filteredTableRankings = tableRankings.filter(r => {
                if (!vehiculosSearchQuery.trim()) return true;
                return r.placa.toLowerCase().includes(vehiculosSearchQuery.toLowerCase());
              });

              const rankingsPageSize = 10;
              const maxRankingsPage = Math.max(1, Math.ceil(filteredTableRankings.length / rankingsPageSize));
              // Clamp page index if it goes out of bounds due to filters
              const currentPageClamped = Math.min(vehiculosPage, maxRankingsPage);
              const paginatedRankings = filteredTableRankings.slice((currentPageClamped - 1) * rankingsPageSize, currentPageClamped * rankingsPageSize);

              return (
                <motion.div
                  key="vehiculos"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Dashboard Tab Title Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-[10px] font-extrabold text-[#737686] uppercase tracking-widest leading-none">
                        FROTA E PRODUTIVIDADE
                      </h2>
                      <h3 className="text-xl font-bold mt-1 text-[#0b1c30]">DESEMPENHO DAS PLACAS</h3>
                      <p className="text-xs text-[#737686] mt-0.5">Análise geral de viagens por placa</p>
                    </div>
                  </div>

                  {/* SEVEN PILL KPI GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                    {/* KPI 1: QUANTIDADE DE VIAGENS GERAL */}
                    <div className="bg-white border border-[#c3c6d7]/30 rounded-2xl p-4.5 xl:p-5 flex items-center gap-3.5 shadow-xs transition-all duration-300 ease-in-out hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg hover:border-[#004ac6]/40 cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                        <Truck className="w-6 h-6 text-[#004ac6]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#737686] font-bold uppercase tracking-wider leading-none">QTD VIAGENS GERAL</p>
                        <p className="text-3xl font-black text-[#0b1c30] mt-2.5 leading-none">{metrics.totalViagens.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>

                    {/* KPI 2: DENTRO DA META */}
                    <div className="bg-white border border-[#c3c6d7]/30 rounded-2xl p-4.5 xl:p-5 flex items-center gap-3.5 shadow-xs transition-all duration-300 ease-in-out hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg hover:border-[#10b981]/40 cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                        <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#737686] font-bold uppercase tracking-wider leading-none">DENTRO DA META</p>
                        <p className="text-3xl font-black text-[#10b981] mt-2.5 leading-none">
                          {dentroMetaCount} <span className="text-xs text-[#737686] font-bold block mt-1">({dentroMetaPercent}%)</span>
                        </p>
                      </div>
                    </div>

                    {/* KPI 3: FORA DA META */}
                    <div className="bg-white border border-[#c3c6d7]/30 rounded-2xl p-4.5 xl:p-5 flex items-center gap-3.5 shadow-xs transition-all duration-300 ease-in-out hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg hover:border-rose-300 cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#737686] font-bold uppercase tracking-wider leading-none">FORA DA META</p>
                        <p className="text-3xl font-black text-rose-500 mt-2.5 leading-none">
                          {foraMetaCount} <span className="text-xs text-[#737686] font-bold block mt-1">({foraMetaPercent}%)</span>
                        </p>
                      </div>
                    </div>

                    {/* KPI 4: MÉDIA DE VIAGENS */}
                    <div className="bg-[#fffdf5] border border-amber-200/50 rounded-2xl p-4.5 xl:p-5 flex items-center gap-3.5 shadow-xs transition-all duration-300 ease-in-out hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg hover:border-amber-400 cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                        <TrendingUp className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#737686] font-bold uppercase tracking-wider leading-none">MÉDIA DE VIAGENS</p>
                        <p className="text-3xl font-black text-[#0b1c30] mt-2.5 leading-none">
                          {mediaViagens} <span className="text-[10px] text-[#737686] font-semibold block mt-1 whitespace-nowrap">/ placa</span>
                        </p>
                      </div>
                    </div>

                    {/* KPI 5: KM TOTAL RODADO */}
                    <div className="bg-[#f4f7ff] border border-indigo-100/50 rounded-2xl p-4.5 xl:p-5 flex items-center gap-3.5 shadow-xs transition-all duration-300 ease-in-out hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg hover:border-indigo-400 cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                        <Route className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-[#737686] font-bold uppercase tracking-wider leading-none">KM TOTAL RODADO</p>
                        <p className="text-2xl font-black text-[#0b1c30] mt-2 leading-none">
                          {rankings.reduce((sum, r) => sum + (r.kmRodadoTotal || 0), 0).toLocaleString('pt-BR')}
                        </p>
                        <p className="text-[11px] text-[#737686] font-extrabold mt-1.5 leading-none">Km rodados total</p>
                      </div>
                    </div>

                    {/* KPI 6: MELHOR PLACA */}
                    <div className="bg-white border border-[#c3c6d7]/30 rounded-2xl p-4.5 xl:p-5 flex items-center gap-3.5 shadow-xs transition-all duration-300 ease-in-out hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg hover:border-purple-300 cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
                        <Award className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-[#737686] font-bold uppercase tracking-wider leading-none">MELHOR PLACA</p>
                        <p className="text-2xl font-black text-purple-700 mt-2 leading-none" title={melhorPlaca}>{melhorPlaca}</p>
                        <p className="text-[11px] text-[#737686] font-extrabold mt-1.5 leading-none">{melhorPlacaViagens} viagens</p>
                      </div>
                    </div>

                    {/* KPI 7: MAIOR FATURAMENTO */}
                    <div className="bg-white border border-[#c3c6d7]/30 rounded-2xl p-4.5 xl:p-5 flex items-center gap-3.5 shadow-xs transition-all duration-300 ease-in-out hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg hover:border-sky-300 cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center shrink-0 border border-sky-100">
                        <Sparkles className="w-6 h-6 text-[#004ac6]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-[#737686] font-bold uppercase tracking-wider leading-none">MAIOR FATURAMENTO</p>
                        <p className="text-[#004ac6] text-xl font-black mt-2 leading-none" title={formatCargoCompactLocal(maiorFaturamentoValue)}>
                          {formatCargoCompactLocal(maiorFaturamentoValue)}
                        </p>
                        <p className="text-[11px] text-[#737686] font-extrabold mt-1.5 leading-none">{maiorFaturamentoPlaca}</p>
                      </div>
                    </div>
                  </div>

                  {/* ANALYTICS SECTION GRID: BAR DISTRIBUTION (7/12) & META METRICS PIE (5/12) */}
                  <div className="grid grid-cols-12 gap-6">
                    {/* TRIPS DISTRIBUTION BAR CHART */}
                    <div className="col-span-12 lg:col-span-7 bg-white border border-[#c3c6d7]/30 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[380px]">
                      <div>
                        <h4 className="text-sm font-black text-[#0b1c30] uppercase tracking-wider mb-1">
                          DISTRIBUIÇÃO DE PLACAS POR QUANTIDADE DE VIAGENS
                        </h4>
                        <p className="text-[11px] text-[#737686] mb-4 font-bold">
                          Contagem consolidada de veículos em cada categoria de viagem
                        </p>
                      </div>

                      {/* Bar Plot */}
                      <div id="vehiculos-distribuicao-grafico" className="relative flex-1 h-[260px] flex items-end">
                        {/* Y-Axis scale label */}
                        <div className="absolute top-0 -left-2 h-full flex flex-col justify-between items-end text-slate-400 font-mono text-[10px] leading-none pointer-events-none pr-3 py-1">
                          {ticks.map((t, idx) => (
                            <span key={idx}>{t}</span>
                          ))}
                        </div>

                        {/* Chart Area background dotted grid lines */}
                        <div className="absolute inset-x-0 inset-y-0 pl-6 flex flex-col justify-between pointer-events-none">
                          {ticks.map((_, idx) => (
                            <div key={idx} className="w-full h-0 border-b border-dashed border-slate-100" />
                          ))}
                        </div>

                        {/* Dynamic Interactive Columns container */}
                        <div className="flex-1 h-full pl-8 flex items-end justify-around relative z-10 select-none pb-0.5">
                          {barData.map((d) => {
                            const heightPercent = maxTick > 0 ? (d.count / maxTick) * 100 : 0;
                            const isCurrentlyHovered = hoveredBarLabel === d.label;
                            return (
                              <div
                                key={d.label}
                                onMouseEnter={() => setHoveredBarLabel(d.label)}
                                onMouseLeave={() => setHoveredBarLabel(null)}
                                onClick={() => setSelectedTripCategory(d.label)}
                                className={`relative group flex flex-col items-center w-12 md:w-16 h-full justify-end cursor-pointer pt-4 transition-transform duration-200 ${
                                  isCurrentlyHovered ? 'scale-105' : 'scale-100'
                                }`}
                              >
                                {/* Hover interactive tooltip popover */}
                                <div
                                  className={`absolute bottom-[105%] left-1/2 -translate-x-1/2 bg-[#0b1c30]/95 backdrop-blur-md text-white border border-white/10 shadow-2xl rounded-xl p-3.5 z-40 w-48 transition-all duration-150 text-left ${
                                    isCurrentlyHovered
                                      ? 'opacity-100 scale-100 pointer-events-auto'
                                      : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100'
                                  }`}
                                >
                                  <p className="text-xs font-black leading-none text-[#6cf8bb]">
                                    {d.label}
                                  </p>
                                  <div className="mt-2.5 text-[11px] space-y-1.5 text-slate-200 font-sans">
                                    <p className="flex justify-between gap-4">
                                      <span>Quantidade:</span>
                                      <span className="font-extrabold text-white">{d.count} placas</span>
                                    </p>
                                    <p className="flex justify-between gap-4">
                                      <span>Participação:</span>
                                      <span className="font-extrabold text-[#6cf8bb]">{d.percent}%</span>
                                    </p>
                                  </div>
                                  <div className="mt-2.5 pt-2 border-t border-white/10 text-[9px] text-[#6cf8bb] font-black text-center flex items-center justify-center gap-1 font-sans uppercase">
                                    <span>🔍 Clique para detalhar placas</span>
                                  </div>
                                </div>

                                {/* Active labels above the column bars */}
                                <span className={`text-xs font-black mb-1.5 z-10 transition-transform duration-200 ${
                                  isCurrentlyHovered ? 'text-[#004ac6] scale-115' : 'text-[#0b1c30] group-hover:scale-110'
                                }`}>
                                  {d.count}
                                </span>

                                {/* Vertical Column Color bar */}
                                <div
                                  className={`w-full bg-gradient-to-t from-[#00399c] to-[#1e70e3] rounded-t-lg transition-all duration-300 shadow-sm relative ${
                                    isCurrentlyHovered ? 'from-[#004ac6] to-[#4e96ff] shadow-md' : 'hover:from-[#004ac6] hover:to-[#4e96ff]'
                                  }`}
                                  style={{ height: `${heightPercent}%`, minHeight: d.count > 0 ? '5px' : '1px' }}
                                >
                                  {/* Glass highlight overlay */}
                                  <div className={`absolute inset-0 bg-white/10 transition-opacity rounded-t-lg ${
                                    isCurrentlyHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                  }`} />
                                </div>

                                {/* X-Axis title labels under the vertical bars */}
                                <span className={`absolute top-[102%] text-[10px] whitespace-nowrap tracking-tight transition-colors duration-200 ${
                                  isCurrentlyHovered ? 'text-[#004ac6] font-extrabold' : 'font-black text-slate-500'
                                }`}>
                                  {d.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* TARGET METRIC RATIO DONUT AND HIGHLIGHT (5/12) */}
                    <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                      {/* Plates Distribution Pie Chart Card */}
                      <div className="bg-white border border-[#c3c6d7]/30 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-[240px]">
                        <div>
                          <h4 className="text-xs font-black text-[#0b1c30] uppercase tracking-wider mb-1">
                            DISTRIBUIÇÃO DE PLACAS (%)
                          </h4>
                          <p className="text-[11px] text-[#737686] font-bold">
                            Proporção de veículos por quantidade de viagens
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-8 py-1.5 mt-1">
                          {/* Circle Pie SVG */}
                          <div className="relative flex-shrink-0 w-32 h-32 flex items-center justify-center">
                            <svg className="-rotate-90 w-full h-full drop-shadow-sm" viewBox="0 0 32 32">
                              {/* Base background circle */}
                              <circle cx="16" cy="16" r="16" fill="#f1f5f9" />
                              
                              {/* Slice 1 (1 viagem - Red) */}
                              {s1 > 0 && (
                                <circle
                                  cx="16"
                                  cy="16"
                                  r="8"
                                  fill="transparent"
                                  stroke="#ef4444"
                                  strokeWidth="16"
                                  strokeDasharray={`${s1} 50.265`}
                                  strokeDashoffset="0"
                                  className="transition-all duration-700 ease-out"
                                />
                              )}
                              
                              {/* Slice 2 (2 viagens - Orange) */}
                              {s2 > 0 && (
                                <circle
                                  cx="16"
                                  cy="16"
                                  r="8"
                                  fill="transparent"
                                  stroke="#f97316"
                                  strokeWidth="16"
                                  strokeDasharray={`${s2} 50.265`}
                                  strokeDashoffset={`-${s1}`}
                                  className="transition-all duration-700 ease-out"
                                />
                              )}
                              
                              {/* Slice 3 (3 viagens - Amber) */}
                              {s3 > 0 && (
                                <circle
                                  cx="16"
                                  cy="16"
                                  r="8"
                                  fill="transparent"
                                  stroke="#f59e0b"
                                  strokeWidth="16"
                                  strokeDasharray={`${s3} 50.265`}
                                  strokeDashoffset={`-${s1 + s2}`}
                                  className="transition-all duration-700 ease-out"
                                />
                              )}
                              
                              {/* Slice 4 (4 viagens - Emerald) */}
                              {s4 > 0 && (
                                <circle
                                  cx="16"
                                  cy="16"
                                  r="8"
                                  fill="transparent"
                                  stroke="#10b981"
                                  strokeWidth="16"
                                  strokeDasharray={`${s4} 50.265`}
                                  strokeDashoffset={`-${s1 + s2 + s3}`}
                                  className="transition-all duration-700 ease-out"
                                />
                              )}
                              
                              {/* Slice 5 (5 ou mais - Purple) */}
                              {s5 > 0 && (
                                <circle
                                  cx="16"
                                  cy="16"
                                  r="8"
                                  fill="transparent"
                                  stroke="#8b5cf6"
                                  strokeWidth="16"
                                  strokeDasharray={`${s5} 50.265`}
                                  strokeDashoffset={`-${s1 + s2 + s3 + s4}`}
                                  className="transition-all duration-700 ease-out"
                                />
                              )}
                            </svg>
                            {/* Centered clean badge overlay */}
                            <div className="absolute bg-[#0b1c30]/90 backdrop-blur-xs text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg border border-white/20 whitespace-nowrap">
                              {metrics.totalPlacas} Placas
                            </div>
                          </div>

                          {/* Beautiful compact list/legend of plate percent segment distributions */}
                          <div className="flex-1 space-y-1.5 pl-1.5 select-none text-[11px]">
                            <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shrink-0" />
                                <span className="font-extrabold text-slate-700">1 viagem</span>
                              </div>
                              <span className="font-black text-slate-800">{c1} ({p1.toFixed(0)}%)</span>
                            </div>

                            <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] shrink-0" />
                                <span className="font-extrabold text-slate-700">2 viagens</span>
                              </div>
                              <span className="font-black text-slate-800">{c2} ({p2.toFixed(0)}%)</span>
                            </div>

                            <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0" />
                                <span className="font-extrabold text-slate-700">3 viagens</span>
                              </div>
                              <span className="font-black text-slate-800">{c3} ({p3.toFixed(0)}%)</span>
                            </div>

                            <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0" />
                                <span className="font-extrabold text-slate-700">4 viagens</span>
                              </div>
                              <span className="font-black text-slate-800">{c4} ({p4.toFixed(0)}%)</span>
                            </div>

                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] shrink-0" />
                                <span className="font-extrabold text-slate-700">5+ viagens</span>
                              </div>
                              <span className="font-black text-slate-800">{c5} ({p5.toFixed(0)}%)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* STATUS REVENUE HORIZONTAL PRODUCER COMPARISON */}
                      <div className="bg-white border border-[#c3c6d7]/30 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-[240px]">
                        <div>
                          <h4 className="text-xs font-black text-[#0b1c30] uppercase tracking-wider mb-1">
                            FATURAMENTO POR STATUS DA META
                          </h4>
                          <p className="text-[11px] text-[#737686] font-bold">
                            Faturamento total acumulado por faixa
                          </p>
                        </div>

                        <div className="space-y-5 my-2.5">
                          {/* Within threshold revenue */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-end text-[11px] font-bold">
                              <span className="text-[#00714d] uppercase tracking-wider">Dentro da Meta</span>
                              <span className="text-xs text-[#0b1c30] font-black">
                                R$ {faturamentoDentro.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="w-full bg-[#f8f9ff] h-4.5 rounded-xl overflow-hidden p-0.5 border border-[#c3c6d7]/15">
                              <div
                                className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] rounded-lg transition-all duration-1000 ease-out"
                                style={{ width: `${percentDentroFat || 1}%` }}
                              />
                            </div>
                          </div>

                          {/* Out-of threshold revenue */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-end text-[11px] font-bold">
                              <span className="text-rose-700 uppercase tracking-wider">Fora da Meta</span>
                              <span className="text-xs text-[#0b1c30] font-black">
                                R$ {faturamentoFora.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="w-full bg-[#f8f9ff] h-4.5 rounded-xl overflow-hidden p-0.5 border border-[#c3c6d7]/15">
                              <div
                                className="h-full bg-gradient-to-r from-[#f04438] to-[#f87171] rounded-lg transition-all duration-1000 ease-out"
                                style={{ width: `${percentForaFat || 1}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Metric ticks indicator */}
                        <div className="border-t border-slate-100 mt-2 pt-1.5 flex justify-between text-[8px] text-slate-400 font-mono select-none">
                          <span>0</span>
                          <span>1M</span>
                          <span>2M</span>
                          <span>3M</span>
                          <span>4M</span>
                          <span>5M</span>
                          <span>6M</span>
                          <span>Faturamento (R$)</span>
                        </div>
                      </div>

                      {/* AUDITORIA DE FAIXAS (VALIDAÇÃO OBRIGATÓRIA) */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                              AUDITORIA DE FAIXAS (VALIDAÇÃO)
                            </h4>
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold mb-3">
                            Verificação detalhada baseada no período operacional para {totalPlacas} placas:
                          </p>
                          
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs font-mono text-slate-700 bg-white p-3 rounded-lg border border-slate-100">
                            <div className="flex justify-between border-b border-dashed border-slate-100 pb-0.5">
                              <span className="font-semibold text-slate-400">Total de Placas:</span>
                              <span id="audi-total-placas" className="font-bold text-slate-800">{totalPlacas}</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-slate-100 pb-0.5">
                              <span className="font-semibold text-slate-400">Faixa 1 viagem:</span>
                              <span id="audi-c1" className="font-bold text-slate-800">{c1} placas</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-slate-100 pb-0.5">
                              <span className="font-semibold text-slate-400">Faixa 2 viagens:</span>
                              <span id="audi-c2" className="font-bold text-slate-800">{c2} placas</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-slate-100 pb-0.5">
                              <span className="font-semibold text-slate-400">Faixa 3 viagens:</span>
                              <span id="audi-c3" className="font-bold text-slate-800">{c3} placas</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-slate-100 pb-0.5">
                              <span className="font-semibold text-slate-400">Faixa 4 viagens:</span>
                              <span id="audi-c4" className="font-bold text-slate-800">{c4} placas</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-slate-100 pb-0.5">
                              <span className="font-semibold text-slate-400">Faixa 5+ viagens:</span>
                              <span id="audi-c5" className="font-bold text-slate-800">{c5} placas</span>
                            </div>
                            <div className="col-span-2 flex justify-between pt-1.5 mt-0.5 border-t border-slate-200 font-black">
                              <span className="text-[#0b1c30] uppercase text-[10px]">Soma das faixas:</span>
                              <span id="audi-soma-faixas" className={c1+c2+c3+c4+c5 === totalPlacas ? "text-[#10b981] text-[11px]" : "text-rose-500 text-[11px]"}>
                                {c1 + c2 + c3 + c4 + c5} placas {c1+c2+c3+c4+c5 === totalPlacas ? "✓ INTEGRADO" : "✗ RECOUP"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* GRANULAR VEHICLE SEARCH AND DETAILED RANKINGS TABLE */}
                  <div className="bg-white border border-[#c3c6d7]/30 rounded-2xl p-6 shadow-xs space-y-4">
                    {/* Header Controls for sorting, search and download */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h4 className="text-sm font-black text-[#0b1c30] flex items-center gap-2">
                          🏆 Ranking Geral de Desempenho por Veículo
                        </h4>
                        <p className="text-[11px] text-[#737686] font-bold">
                          Mostrando {filteredTableRankings.length === 0 ? 0 : (currentPageClamped - 1) * rankingsPageSize + 1} a {Math.min(currentPageClamped * rankingsPageSize, filteredTableRankings.length)} de {filteredTableRankings.length} registros
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        {/* Search Placa Text Box */}
                        <div className="relative flex-1 sm:w-56">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Buscar placa..."
                            value={vehiculosSearchQuery}
                            onChange={(e) => {
                              setVehiculosSearchQuery(e.target.value);
                              setVehiculosPage(1); // Auto rest page to 1
                            }}
                            className="w-full pl-9 pr-4 py-2 border border-[#c3c6d7]/35 rounded-xl text-xs font-bold text-[#0b1c30] placeholder-slate-400 focus:outline-[#004ac6] focus:outline focus:outline-1 transition-all bg-white"
                          />
                          {vehiculosSearchQuery && (
                            <button
                              onClick={() => { setVehiculosSearchQuery(''); setVehiculosPage(1); }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-extrabold cursor-pointer"
                            >
                              Limpar
                            </button>
                          )}
                        </div>
 
                        {/* Export PDF Button */}
                        <button
                          onClick={() => handleDownloadPDF('Relatorio_Frotas')}
                          className="border border-[#c3c6d7]/35 text-[#0b1c30] hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all w-full sm:w-auto shrink-0 bg-white"
                        >
                          <Download className="w-4 h-4" /> Exportar PDF
                        </button>
                      </div>
                    </div>

                    {/* Responsive Tabular Grid block */}
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                      <table className="w-full text-left border-collapse min-w-[1100px]">
                        <thead>
                          <tr className="border-b border-[#c3c6d7]/30 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider bg-[#f8f9ff]">
                            <th className="px-4 py-3.5 text-center w-14">Rank</th>
                            <th className="px-4 py-3.5 w-32">Placa</th>
                            <th className="px-4 py-3.5">Supervisor</th>
                            <th className="px-4 py-3.5">Motorista Principal</th>
                            <th className="px-4 py-3.5">Última Rota</th>
                            <th className="px-4 py-3.5 text-center w-24">Viagens</th>
                            <th className="px-4 py-3.5 text-center w-18">Meta</th>
                            <th className="px-4 py-3.5 text-center w-22">% Ating.</th>
                            <th className="px-4 py-3.5 text-right">Faturamento</th>
                            <th className="px-4 py-3.5 text-right">KM Rodados</th>
                            <th className="px-4 py-3.5 text-center w-36">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700 font-sans bg-white">
                          {paginatedRankings.length === 0 ? (
                            <tr>
                              <td colSpan={11} className="text-center py-10 text-slate-400 font-semibold">
                                Nenhuma placa correspondente aos filtros e busca ativa.
                              </td>
                            </tr>
                          ) : (
                            paginatedRankings.map((r, idx) => {
                              const overallPos = (currentPageClamped - 1) * rankingsPageSize + idx + 1;
                              const isMetaDone = r.statusMeta === 'Dentro da Meta';
                              
                              // Medal style or position styled badge representation
                              const medalStyle = 
                                overallPos === 1 ? 'bg-amber-100 text-amber-800 border-amber-200 font-black' :
                                overallPos === 2 ? 'bg-slate-100 text-slate-800 border-slate-200 font-black' :
                                overallPos === 3 ? 'bg-orange-100 text-orange-850 border-orange-200 font-black' :
                                'bg-slate-50 text-slate-500 border-slate-100 font-semibold';

                              return (
                                <tr key={`${r.placa}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-4 py-3.5 text-center">
                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] border ${medalStyle}`}>
                                      {overallPos}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3.5">
                                    <div className="flex flex-col gap-1 items-start">
                                      <PlateTooltip plateData={r}>
                                        <span 
                                          title={r.statusFaturamento === 'SEM FATURAMENTO' ? 'Veículo sem faturamento no período selecionado' : undefined}
                                          className={`cursor-help inline-block px-2.5 py-1 rounded-lg font-mono text-[11px] font-extrabold transition-all whitespace-nowrap border ${
                                            r.statusFaturamento === 'SEM FATURAMENTO'
                                              ? 'bg-rose-50 text-rose-700 border-rose-250 hover:border-rose-500'
                                              : 'bg-[#eff4ff] text-[#004ac6] border-[#c3c6d7]/30 hover:border-[#004ac6]'
                                          }`}
                                        >
                                          {r.placa}
                                        </span>
                                      </PlateTooltip>
                                      {r.statusFaturamento === 'SEM FATURAMENTO' ? (
                                        <span className="inline-block text-[9px] bg-rose-50 text-rose-600 border border-rose-200 rounded px-1 py-0.5 leading-none font-black select-none uppercase tracking-wider">
                                          SEM FATURAMENTO
                                        </span>
                                      ) : (
                                        <span className="inline-block text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-1 py-0.5 leading-none font-black select-none uppercase tracking-wider">
                                          FATUROU
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3.5 text-slate-600 font-bold uppercase max-w-[120px] truncate" title={r.supervisor || 'Sem Supervisor'}>
                                    {r.supervisor || 'Sem Supervisor'}
                                  </td>
                                  <td className="px-4 py-3.5 text-slate-600 font-bold uppercase max-w-[160px] truncate" title={r.motorista || 'Sem motorista'}>
                                    {r.motorista || 'Sem motorista'}
                                  </td>
                                  <td className="px-4 py-3.5 text-slate-500 font-medium truncate max-w-[180px]" title={r.ultimaRota}>
                                    {r.ultimaRota || 'Sem rota programada'}
                                  </td>
                                  <td className="px-4 py-3.5 text-center text-slate-800 font-black">
                                    {r.viagensCount}
                                  </td>
                                  <td className="px-4 py-3.5 text-center text-slate-400">
                                    {r.targetMeta ?? 4}
                                  </td>
                                  <td className="px-4 py-3.5 text-center">
                                    <span className={`font-black ${isMetaDone ? 'text-emerald-600' : 'text-rose-500'}`}>
                                      {r.percentMeta}%
                                    </span>
                                  </td>
                                  <td className="px-4 py-3.5 text-right text-[#004ac6] font-black whitespace-nowrap">
                                    R$ {r.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td className="px-4 py-3.5 text-right text-slate-600 whitespace-nowrap font-mono text-[11px] font-semibold">
                                    {r.kmRodadoTotal ? r.kmRodadoTotal.toLocaleString('pt-BR') : '0'} km
                                  </td>
                                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                                      isMetaDone 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                        : 'bg-rose-50 text-rose-700 border-rose-100'
                                    }`}>
                                      {isMetaDone ? '✓ Dentro da Meta' : '⚠ Fora da Meta'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Pagination Section */}
                    {maxRankingsPage > 1 && (
                      <div className="flex items-center justify-between border-t border-slate-100 pt-5 select-none">
                        <span className="text-xs text-[#737686] font-bold">
                          Página {currentPageClamped} de {maxRankingsPage}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setVehiculosPage(p => Math.max(1, p - 1))}
                            disabled={currentPageClamped === 1}
                            className="border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent text-[#0b1c30] w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer text-xs font-black"
                          >
                            &lt;
                          </button>
                          
                          {Array.from({ length: maxRankingsPage }, (_, i) => i + 1)
                            .filter(p => {
                              // Only show pages around the current page standard range
                              return p === 1 || p === maxRankingsPage || Math.abs(p - currentPageClamped) <= 1;
                            })
                            .map((p, i, arr) => {
                              const showEllipsis = i > 0 && p - arr[i - 1] > 1;
                              return (
                                <React.Fragment key={p}>
                                  {showEllipsis && <span className="text-slate-400 text-xs px-1 font-extrabold">...</span>}
                                  <button
                                    onClick={() => setVehiculosPage(p)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${
                                      currentPageClamped === p
                                        ? 'bg-[#004ac6] text-white shadow-xs'
                                        : 'bg-white border border-slate-200 hover:bg-slate-50 text-[#0b1c30]'
                                    }`}
                                  >
                                    {p}
                                  </button>
                                </React.Fragment>
                              );
                            })}
                          
                          <button
                            onClick={() => setVehiculosPage(p => Math.min(maxRankingsPage, p + 1))}
                            disabled={currentPageClamped === maxRankingsPage}
                            className="border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent text-[#0b1c30] w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer text-xs font-black"
                          >
                            &gt;
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })()}



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

                {/* Comparativos de Rankings de Rotas */}
                <div className="pt-4 border-t border-[#c3c6d7]/20 space-y-4">
                  <div>
                    <h4 className="text-[10px] font-black text-[#737686] uppercase tracking-widest leading-none">
                      DESEMPENHO COMPARATIVO DE ROTAS
                    </h4>
                    <h3 className="text-base font-black mt-1 text-[#0b1c30]">
                      Principais Indicadores de Rotas (Top 5)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {/* Card 1: Maior Faturamento */}
                    <div className="bg-white border border-[#c3c6d7]/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                          <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
                          <h5 className="text-[11px] font-extrabold text-[#0b1c30] uppercase tracking-wider">
                            Maior Faturamento
                          </h5>
                        </div>
                        <div className="space-y-2">
                          {topRotasMaiorFaturamento.length === 0 ? (
                            <p className="text-[11px] text-gray-400 font-bold py-2">Nenhuma rota calculada.</p>
                          ) : (
                            topRotasMaiorFaturamento.map((item, index) => (
                              <div
                                key={item.rota}
                                onClick={() => setSelectedRouteName(item.rota)}
                                className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                                  selectedRouteName === item.rota
                                    ? 'bg-[#eff4ff] border-[#004ac6]'
                                    : 'bg-slate-50/50 border-transparent hover:bg-slate-50 hover:border-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                                    index === 0 ? 'bg-amber-100 text-amber-700' :
                                    index === 1 ? 'bg-slate-100 text-slate-700' :
                                    index === 2 ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-500'
                                  }`}>
                                    {index + 1}º
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-700 truncate uppercase" title={item.rota}>
                                    {item.rota}
                                  </span>
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 shrink-0 select-none">
                                  R$ {item.totalValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Maior Número de Viagens */}
                    <div className="bg-white border border-[#c3c6d7]/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                          <Award className="w-4 h-4 text-blue-500 shrink-0" />
                          <h5 className="text-[11px] font-extrabold text-[#0b1c30] uppercase tracking-wider">
                            Mais Viagens
                          </h5>
                        </div>
                        <div className="space-y-2">
                          {topRotasMaiorViagens.length === 0 ? (
                            <p className="text-[11px] text-gray-400 font-bold py-2">Nenhuma rota calculada.</p>
                          ) : (
                            topRotasMaiorViagens.map((item, index) => (
                              <div
                                key={item.rota}
                                onClick={() => setSelectedRouteName(item.rota)}
                                className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                                  selectedRouteName === item.rota
                                    ? 'bg-[#eff4ff] border-[#004ac6]'
                                    : 'bg-slate-50/50 border-transparent hover:bg-slate-50 hover:border-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                                    index === 0 ? 'bg-amber-100 text-amber-700' :
                                    index === 1 ? 'bg-slate-100 text-slate-700' :
                                    index === 2 ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-500'
                                  }`}>
                                    {index + 1}º
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-700 truncate uppercase" title={item.rota}>
                                    {item.rota}
                                  </span>
                                </div>
                                <span className="text-[10px] font-black text-blue-600 shrink-0 select-none">
                                  {item.totalTrips} {item.totalTrips === 1 ? 'viagem' : 'viagens'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Menor Faturamento */}
                    <div className="bg-white border border-[#c3c6d7]/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                          <TrendingDown className="w-4 h-4 text-rose-500 shrink-0" />
                          <h5 className="text-[11px] font-extrabold text-[#0b1c30] uppercase tracking-wider">
                            Pior Faturamento
                          </h5>
                        </div>
                        <div className="space-y-2">
                          {topRotasPiorFaturamento.length === 0 ? (
                            <p className="text-[11px] text-gray-400 font-bold py-2">Nenhuma rota calculada.</p>
                          ) : (
                            topRotasPiorFaturamento.map((item, index) => (
                              <div
                                key={item.rota}
                                onClick={() => setSelectedRouteName(item.rota)}
                                className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                                  selectedRouteName === item.rota
                                    ? 'bg-[#eff4ff] border-[#004ac6]'
                                    : 'bg-slate-50/50 border-transparent hover:bg-slate-50 hover:border-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                                    index === 0 ? 'bg-rose-100 text-rose-700' :
                                    index === 1 ? 'bg-orange-100 text-orange-700' :
                                    index === 2 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-500'
                                  }`}>
                                    {index + 1}º
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-700 truncate uppercase" title={item.rota}>
                                    {item.rota}
                                  </span>
                                </div>
                                <span className="text-[10px] font-black text-rose-600 shrink-0 select-none">
                                  R$ {item.totalValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card 4: Menor Número de Viagens */}
                    <div className="bg-white border border-[#c3c6d7]/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          <h5 className="text-[11px] font-extrabold text-[#0b1c30] uppercase tracking-wider">
                            Menor Nº de Viagens
                          </h5>
                        </div>
                        <div className="space-y-2">
                          {topRotasMenorViagens.length === 0 ? (
                            <p className="text-[11px] text-gray-400 font-bold py-2">Nenhuma rota calculada.</p>
                          ) : (
                            topRotasMenorViagens.map((item, index) => (
                              <div
                                key={item.rota}
                                onClick={() => setSelectedRouteName(item.rota)}
                                className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                                  selectedRouteName === item.rota
                                    ? 'bg-[#eff4ff] border-[#004ac6]'
                                    : 'bg-slate-50/50 border-transparent hover:bg-slate-50 hover:border-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                                    index === 0 ? 'bg-rose-100 text-rose-700' :
                                    index === 1 ? 'bg-orange-100 text-orange-700' :
                                    index === 2 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-500'
                                  }`}>
                                    {index + 1}º
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-700 truncate uppercase" title={item.rota}>
                                    {item.rota}
                                  </span>
                                </div>
                                <span className="text-[10px] font-black text-amber-600 shrink-0 select-none">
                                  {item.totalTrips} {item.totalTrips === 1 ? 'viagem' : 'viagens'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
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
                            const isMet = plateRankData ? plateRankData.statusMeta === 'Dentro da Meta' : false;

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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-6"
              >
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-[10px] font-extrabold text-[#737686] uppercase tracking-widest leading-none">
                      Desempenho e Variação Temporal
                    </h2>
                    <h3 className="text-xl font-black mt-1 text-[#0b1c30]">Comparativo Mensal & Variações de Período</h3>
                  </div>
                </header>

                {comparativoMensal.length === 0 ? (
                  <div className="bg-white p-12 border border-[#c3c6d7]/30 rounded-2xl text-center space-y-2">
                    <p className="text-gray-400 font-bold">Nenhum dado mensal disponível.</p>
                    <p className="text-xs text-gray-400">Verifique os filtros selecionados ou faça uma nova importação de planilha.</p>
                  </div>
                ) : (() => {
                  const activeIndex = comparativoMensal.findIndex(c => c.key === selectedComparisonKey);
                  const currentComp = activeIndex !== -1 ? comparativoMensal[activeIndex] : comparativoMensal[comparativoMensal.length - 1];

                  const baseIndex = comparisonBaseKey ? comparativoMensal.findIndex(c => c.key === comparisonBaseKey) : (activeIndex > 0 ? activeIndex - 1 : 0);
                  const previousComp = baseIndex !== -1 ? comparativoMensal[baseIndex] : null;

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

                  const pct = (curr: number, prev: number) => {
                    if (prev === 0) return curr > 0 ? 100 : 0;
                    return ((curr - prev) / prev) * 100;
                  };

                  const compMetrics = {
                    faturamentoLiquido: currentComp.faturamentoLiquido,
                    faturamentoBruto: currentComp.faturamentoBruto,
                    despesaOficina: currentComp.despesaOficina,
                    qtdViagens: currentComp.qtdViagens,
                    qtdVeiculos: currentComp.qtdVeiculos,
                    kmRodado: currentComp.kmRodado,

                    baseFaturamentoLiquido: previousComp ? previousComp.faturamentoLiquido : 0,
                    baseFaturamentoBruto: previousComp ? previousComp.faturamentoBruto : 0,
                    baseDespesaOficina: previousComp ? previousComp.despesaOficina : 0,
                    baseQtdViagens: previousComp ? previousComp.qtdViagens : 0,
                    baseQtdVeiculos: previousComp ? previousComp.qtdVeiculos : 0,
                    baseKmRodado: previousComp ? previousComp.kmRodado : 0,

                    varFaturamentoLiquido: previousComp ? pct(currentComp.faturamentoLiquido, previousComp.faturamentoLiquido) : 0,
                    varFaturamentoBruto: previousComp ? pct(currentComp.faturamentoBruto, previousComp.faturamentoBruto) : 0,
                    varDespesaOficina: previousComp ? pct(currentComp.despesaOficina, previousComp.despesaOficina) : 0,
                    varQtdViagens: previousComp ? pct(currentComp.qtdViagens, previousComp.qtdViagens) : 0,
                    varQtdVeiculos: previousComp ? pct(currentComp.qtdVeiculos, previousComp.qtdVeiculos) : 0,
                    varKmRodado: previousComp ? pct(currentComp.kmRodado, previousComp.kmRodado) : 0,

                    diffFaturamentoLiquido: previousComp ? currentComp.faturamentoLiquido - previousComp.faturamentoLiquido : 0,
                    diffFaturamentoBruto: previousComp ? currentComp.faturamentoBruto - previousComp.faturamentoBruto : 0,
                    diffDespesaOficina: previousComp ? currentComp.despesaOficina - previousComp.despesaOficina : 0,
                    diffQtdViagens: previousComp ? currentComp.qtdViagens - previousComp.qtdViagens : 0,
                    diffQtdVeiculos: previousComp ? currentComp.qtdVeiculos - previousComp.qtdVeiculos : 0,
                    diffKmRodado: previousComp ? currentComp.kmRodado - previousComp.kmRodado : 0,
                  };

                  // Generate successive consecutive month pairs from loaded sequence
                  const consecutivePairs = [];
                  for (let i = 1; i < comparativoMensal.length; i++) {
                    const base = comparativoMensal[i - 1];
                    const target = comparativoMensal[i];
                    
                    const varLiquido = base.faturamentoLiquido !== 0
                      ? ((target.faturamentoLiquido - base.faturamentoLiquido) / base.faturamentoLiquido) * 100
                      : 0;
                    
                    consecutivePairs.push({
                      baseKey: base.key,
                      targetKey: target.key,
                      label: `${base.mesNome.toUpperCase()} X ${target.mesNome.toUpperCase()}`,
                      percent: varLiquido,
                    });
                  }

                  return (
                    <div className="space-y-6">
                      {/* Comparison selection center with High Fidelity consecutive button selection pills and custom selectors */}
                      <div className="bg-white border border-[#c3c6d7]/35 rounded-2xl p-5 shadow-3xs space-y-4 font-sans">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <h4 className="text-xs font-black text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
                              Selecione os Meses de Referência para Comparar
                            </h4>
                            <p className="text-[11px] text-[#737686] font-semibold mt-1">
                              Clique em uma comparação rápida MoM entre meses ou refine de forma totalmente personalizada usando os seletores abaixo
                            </p>
                          </div>
                        </div>

                        {consecutivePairs.length > 0 ? (
                          <div className="flex flex-wrap gap-2.5 pt-1">
                            {consecutivePairs.map((pair, idx) => {
                              const isSelected = comparisonBaseKey === pair.baseKey && selectedComparisonKey === pair.targetKey;
                              const isPositive = pair.percent >= 0;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setComparisonBaseKey(pair.baseKey);
                                    setSelectedComparisonKey(pair.targetKey);
                                    triggerToast(`📅 Comparando ${pair.label}`);
                                  }}
                                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-black transition-all duration-200 cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#004ac6] border-[#004ac6] text-white shadow-sm shadow-[#004ac6]/15'
                                      : 'bg-[#f8f9ff] border-[#c3c6d7]/40 hover:bg-slate-50 text-[#0b1c30]'
                                  }`}
                                >
                                  <span className="tracking-wide">{pair.label}</span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-normal ${
                                    isSelected
                                      ? (isPositive ? 'bg-white/20 text-white' : 'bg-white/15 text-white')
                                      : (isPositive ? 'bg-[#6cf8bb]/15 text-[#00714d]' : 'bg-rose-500/10 text-rose-600')
                                  }`}>
                                    {isPositive ? '+' : ''}{pair.percent.toFixed(1)}%
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-xs italic font-medium">É necessário pelo menos dois meses de dados para ver comparações rápidas.</p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-dashed border-slate-100">
                          <div className="space-y-1.5 animate-fade-in">
                            <label className="text-[10px] font-extrabold uppercase text-[#737686] tracking-wider block">Mês de Referência Base (Mês A)</label>
                            <select
                              value={comparisonBaseKey || ''}
                              onChange={(e) => {
                                setComparisonBaseKey(e.target.value);
                                triggerToast(`📅 Mês Base atualizado!`);
                              }}
                              className="w-full bg-[#f8f9ff] text-xs font-bold text-[#0b1c30] px-4 py-3 rounded-xl border border-[#c3c6d7]/35 focus:outline-none focus:ring-1 focus:ring-[#004ac6] cursor-pointer"
                            >
                              {comparativoMensal.map((item) => (
                                <option key={item.key} value={item.key}>
                                  {item.mesNome} de {item.ano}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5 animate-fade-in">
                            <label className="text-[10px] font-extrabold uppercase text-[#737686] tracking-wider block">Mês de Referência Comparado (Mês B)</label>
                            <select
                              value={selectedComparisonKey || ''}
                              onChange={(e) => {
                                setSelectedComparisonKey(e.target.value);
                                triggerToast(`📅 Mês Comparado atualizado!`);
                              }}
                              className="w-full bg-[#f8f9ff] text-xs font-bold text-[#0b1c30] px-4 py-3 rounded-xl border border-[#c3c6d7]/35 focus:outline-none focus:ring-1 focus:ring-[#004ac6] cursor-pointer"
                            >
                              {comparativoMensal.map((item) => (
                                <option key={item.key} value={item.key}>
                                  {item.mesNome} de {item.ano}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Comparison KPI Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* KPI 1: Faturamento Líquido */}
                        <div className="bg-white p-6 border border-[#c3c6d7]/35 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-[#737686] uppercase tracking-wider block">Faturamento Líquido</span>
                              <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                                currentComp.faturamentoLiquido === (previousComp?.faturamentoLiquido || 0) ? 'bg-gray-100 text-gray-500' :
                                compMetrics.varFaturamentoLiquido >= 0 ? 'bg-[#6cf8bb]/15 text-[#00714d]' : 'bg-rose-500/10 text-rose-600'
                              }`}>
                                {previousComp ? formatPercent(compMetrics.varFaturamentoLiquido) : '------'}
                              </div>
                            </div>
                            
                            {/* Comparison Side-By-Side */}
                            <div className="grid grid-cols-2 gap-4 mt-4 font-sans">
                              <div className="border-r border-slate-100 pr-2">
                                <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider block">Base ({previousComp ? `${previousComp.mesNome}/${String(previousComp.ano).slice(-2)}` : 'N/A'})</span>
                                <span className="text-sm font-bold text-slate-500 block mt-1">{previousComp ? formatMoney(previousComp.faturamentoLiquido) : '------'}</span>
                              </div>
                              <div className="pl-2">
                                <span className="text-[9px] text-[#004ac6] font-bold uppercase tracking-wider block">Comparativo ({currentComp.mesNome}/{String(currentComp.ano).slice(-2)})</span>
                                <span className="text-base font-black text-[#0b1c30] block mt-1">{formatMoney(currentComp.faturamentoLiquido)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-[11px] font-bold text-[#434655]">
                            <span className="opacity-75 font-semibold">Diferença Total:</span>
                            <span className={previousComp === null ? 'text-gray-400' : (compMetrics.diffFaturamentoLiquido >= 0 ? 'text-[#00714d]' : 'text-rose-600')}>
                              {previousComp ? formatDiffMoney(currentComp.faturamentoLiquido, previousComp.faturamentoLiquido) : '------'}
                            </span>
                          </div>
                        </div>

                        {/* KPI 2: Faturamento Bruto */}
                        <div className="bg-white p-6 border border-[#c3c6d7]/35 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-[#737686] uppercase tracking-wider block">Faturamento Bruto</span>
                              <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                                currentComp.faturamentoBruto === (previousComp?.faturamentoBruto || 0) ? 'bg-gray-100 text-gray-500' :
                                compMetrics.varFaturamentoBruto >= 0 ? 'bg-[#6cf8bb]/15 text-[#00714d]' : 'bg-rose-500/10 text-rose-600'
                              }`}>
                                {previousComp ? formatPercent(compMetrics.varFaturamentoBruto) : '------'}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4 font-sans">
                              <div className="border-r border-slate-100 pr-2">
                                <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider block">Base ({previousComp ? `${previousComp.mesNome}/${String(previousComp.ano).slice(-2)}` : 'N/A'})</span>
                                <span className="text-sm font-bold text-slate-500 block mt-1">{previousComp ? formatMoney(previousComp.faturamentoBruto) : '------'}</span>
                              </div>
                              <div className="pl-2">
                                <span className="text-[9px] text-[#004ac6] font-bold uppercase tracking-wider block">Comparativo ({currentComp.mesNome}/{String(currentComp.ano).slice(-2)})</span>
                                <span className="text-base font-black text-[#0b1c30] block mt-1">{formatMoney(currentComp.faturamentoBruto)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-[11px] font-bold text-[#434655]">
                            <span className="opacity-75 font-semibold">Diferença Total:</span>
                            <span className={previousComp === null ? 'text-gray-400' : (compMetrics.diffFaturamentoBruto >= 0 ? 'text-[#00714d]' : 'text-rose-600')}>
                              {previousComp ? formatDiffMoney(currentComp.faturamentoBruto, previousComp.faturamentoBruto) : '------'}
                            </span>
                          </div>
                        </div>

                        {/* KPI 3: Despesa Oficina */}
                        <div className="bg-white p-6 border border-[#c3c6d7]/35 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-[#737686] uppercase tracking-wider block">Despesas Oficina</span>
                              <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                                currentComp.despesaOficina === (previousComp?.despesaOficina || 0) ? 'bg-gray-100 text-gray-500' :
                                compMetrics.varDespesaOficina <= 0 ? 'bg-[#6cf8bb]/15 text-[#00714d]' : 'bg-rose-500/10 text-rose-600'
                              }`}>
                                {previousComp ? formatPercent(compMetrics.varDespesaOficina) : '------'}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4 font-sans">
                              <div className="border-r border-slate-100 pr-2">
                                <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider block">Base ({previousComp ? `${previousComp.mesNome}/${String(previousComp.ano).slice(-2)}` : 'N/A'})</span>
                                <span className="text-sm font-bold text-slate-500 block mt-1">{previousComp ? formatMoney(previousComp.despesaOficina) : '------'}</span>
                              </div>
                              <div className="pl-2">
                                <span className="text-[9px] text-[#ab0b1c] font-bold uppercase tracking-wider block">Comparativo ({currentComp.mesNome}/{String(currentComp.ano).slice(-2)})</span>
                                <span className="text-base font-black text-[#0b1c30] block mt-1">{formatMoney(currentComp.despesaOficina)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-[11px] font-bold text-[#434655]">
                            <span className="opacity-75 font-semibold">Diferença Total:</span>
                            <span className={previousComp === null ? 'text-gray-400' : (compMetrics.diffDespesaOficina <= 0 ? 'text-[#00714d]' : 'text-rose-600')}>
                              {previousComp ? formatDiffMoney(currentComp.despesaOficina, previousComp.despesaOficina) : '------'}
                            </span>
                          </div>
                        </div>

                        {/* KPI 4: Viagens Realizadas */}
                        <div className="bg-white p-6 border border-[#c3c6d7]/35 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between font-sans">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-[#737686] uppercase tracking-wider block">Viagens Realizadas</span>
                              <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                                currentComp.qtdViagens === (previousComp?.qtdViagens || 0) ? 'bg-gray-100 text-gray-500' :
                                compMetrics.varQtdViagens >= 0 ? 'bg-[#6cf8bb]/15 text-[#00714d]' : 'bg-rose-500/10 text-rose-600'
                              }`}>
                                {previousComp ? formatPercent(compMetrics.varQtdViagens) : '------'}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4 font-sans">
                              <div className="border-r border-slate-100 pr-2">
                                <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider block">Base ({previousComp ? `${previousComp.mesNome}/${String(previousComp.ano).slice(-2)}` : 'N/A'})</span>
                                <span className="text-sm font-bold text-slate-500 block mt-1">{previousComp ? `${previousComp.qtdViagens} viag.` : '------'}</span>
                              </div>
                              <div className="pl-2">
                                <span className="text-[9px] text-[#004ac6] font-bold uppercase tracking-wider block">Comparativo ({currentComp.mesNome}/{String(currentComp.ano).slice(-2)})</span>
                                <span className="text-base font-black text-[#0b1c30] block mt-1">{currentComp.qtdViagens} viagens</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-[11px] font-bold text-[#434655]">
                            <span className="opacity-75 font-semibold">Diferença Total:</span>
                            <span className={previousComp === null ? 'text-gray-400' : (compMetrics.diffQtdViagens >= 0 ? 'text-[#00714d]' : 'text-rose-600')}>
                              {previousComp ? formatDiffNum(currentComp.qtdViagens, previousComp.qtdViagens) + ' viagens' : '------'}
                            </span>
                          </div>
                        </div>

                        {/* KPI 5: Veículos Ativos */}
                        <div className="bg-white p-6 border border-[#c3c6d7]/35 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between font-sans font-sans">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-[#737686] uppercase tracking-wider block">Veículos Ativos</span>
                              <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                                currentComp.qtdVeiculos === (previousComp?.qtdVeiculos || 0) ? 'bg-gray-100 text-gray-500' :
                                compMetrics.varQtdVeiculos >= 0 ? 'bg-[#6cf8bb]/15 text-[#00714d]' : 'bg-rose-500/10 text-rose-600'
                              }`}>
                                {previousComp ? formatPercent(compMetrics.varQtdVeiculos) : '------'}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4 font-sans">
                              <div className="border-r border-slate-100 pr-2">
                                <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider block">Base ({previousComp ? `${previousComp.mesNome}/${String(previousComp.ano).slice(-2)}` : 'N/A'})</span>
                                <span className="text-sm font-bold text-slate-500 block mt-1">{previousComp ? `${previousComp.qtdVeiculos} veíc.` : '------'}</span>
                              </div>
                              <div className="pl-2">
                                <span className="text-[9px] text-[#004ac6] font-bold uppercase tracking-wider block">Comparativo ({currentComp.mesNome}/{String(currentComp.ano).slice(-2)})</span>
                                <span className="text-base font-black text-[#0b1c30] block mt-1">{currentComp.qtdVeiculos} veículos</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-[11px] font-bold text-[#434655]">
                            <span className="opacity-75 font-semibold">Diferença Total:</span>
                            <span className={previousComp === null ? 'text-gray-400' : (compMetrics.diffQtdVeiculos >= 0 ? 'text-[#00714d]' : 'text-rose-600')}>
                              {previousComp ? formatDiffNum(currentComp.qtdVeiculos, previousComp.qtdVeiculos) + ' veículos' : '------'}
                            </span>
                          </div>
                        </div>

                        {/* KPI 6: Distância Total */}
                        <div className="bg-white p-6 border border-[#c3c6d7]/35 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between font-sans">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-[#737686] uppercase tracking-wider block">Distância Total</span>
                              <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                                currentComp.kmRodado === (previousComp?.kmRodado || 0) ? 'bg-gray-100 text-gray-500' :
                                compMetrics.varKmRodado >= 0 ? 'bg-[#6cf8bb]/15 text-[#00714d]' : 'bg-rose-500/10 text-rose-600'
                              }`}>
                                {previousComp ? formatPercent(compMetrics.varKmRodado) : '------'}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4 font-sans">
                              <div className="border-r border-slate-100 pr-2">
                                <span className="text-[9px] text-[#737686] font-bold uppercase tracking-wider block">Base ({previousComp ? `${previousComp.mesNome}/${String(previousComp.ano).slice(-2)}` : 'N/A'})</span>
                                <span className="text-sm font-bold text-slate-500 block mt-1">{previousComp ? `${previousComp.kmRodado.toLocaleString('pt-BR')} Km` : '------'}</span>
                              </div>
                              <div className="pl-2">
                                <span className="text-[9px] text-[#004ac6] font-bold uppercase tracking-wider block">Comparativo ({currentComp.mesNome}/{String(currentComp.ano).slice(-2)})</span>
                                <span className="text-base font-black text-[#0b1c30] block mt-1">{currentComp.kmRodado.toLocaleString('pt-BR')} Km</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-[11px] font-bold text-[#434655]">
                            <span className="opacity-75 font-semibold">Diferença Total:</span>
                            <span className={previousComp === null ? 'text-gray-400' : (compMetrics.diffKmRodado >= 0 ? 'text-[#00714d]' : 'text-rose-600')}>
                              {previousComp ? `${compMetrics.diffKmRodado >= 0 ? '+' : ''}${compMetrics.diffKmRodado.toLocaleString('pt-BR')} Km` : '------'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Visual SVG Monthly Trend representation */}
                      <div className="bg-white p-6 border border-[#c3c6d7]/30 rounded-2xl shadow-xs">
                        <h4 className="text-xs font-extrabold text-[#4a4c58] uppercase tracking-wider mb-4 flex items-center gap-1.5 font-sans">
                          📈 Evolução Mensal do Faturamento Líquido (R$)
                        </h4>
                        <div className="w-full pt-2">
                          {(() => {
                            const maxVal = Math.max(...comparativoMensal.map(c => Math.max(c.faturamentoLiquido, 1)));
                            const minVal = Math.min(0, ...comparativoMensal.map(c => c.faturamentoLiquido));
                            const range = maxVal - minVal;

                            const paddingLeft = 135;
                            const paddingRight = 135;
                            const chartWidth = 1000;
                            const chartHeight = 350;
                            const plotWidth = chartWidth - paddingLeft - paddingRight;

                            // Y range mapping: top = 125, bottom = 295 (leaves 125px on top for tooltip card rendering!)
                            const yTop = 125;
                            const yBottom = 295;
                            const plotHeight = yBottom - yTop;

                            const getY = (val: number) => {
                              if (range === 0) return yBottom - plotHeight / 2;
                              return yBottom - ((val - minVal) / range) * plotHeight;
                            };

                            const points = comparativoMensal.map((item, idx) => {
                              const x = paddingLeft + (comparativoMensal.length > 1 ? (idx / (comparativoMensal.length - 1)) * plotWidth : plotWidth / 2);
                              const y = getY(item.faturamentoLiquido);
                              return { x, y, item, idx };
                            });

                            // Generate smooth line path
                            const pathD = points.length > 0 
                              ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
                              : '';

                            // Generate smooth area path
                            const areaD = points.length > 0
                              ? `M ${points[0].x} ${yBottom} L ${points[0].x} ${points[0].y} ` +
                                points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') +
                                ` L ${points[points.length - 1].x} ${yBottom} Z`
                              : '';

                            // Dash lines grid values (0, 25%, 50%, 75%, 100% of range)
                            const gridCount = 4;
                            const gridLines = Array.from({ length: gridCount + 1 }).map((_, i) => {
                              const ratio = i / gridCount;
                              const value = minVal + ratio * range;
                              const y = yBottom - ratio * plotHeight;
                              return { y, value };
                            });

                            return (
                              <div className="relative w-full overflow-hidden">
                                <svg
                                  className="w-full h-auto overflow-visible select-none"
                                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                  preserveAspectRatio="xMidYMid meet"
                                >
                                  <defs>
                                    <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#004ac6" stopOpacity="0.25"/>
                                      <stop offset="100%" stopColor="#004ac6" stopOpacity="0.00"/>
                                    </linearGradient>
                                  </defs>

                                  {/* Grid Lines */}
                                  {gridLines.map((line, idx) => (
                                    <g key={idx} className="opacity-40">
                                      <line
                                        x1={paddingLeft}
                                        y1={line.y}
                                        x2={paddingLeft + plotWidth}
                                        y2={line.y}
                                        stroke="#c3c6d7"
                                        strokeWidth={1}
                                        strokeDasharray="4 4"
                                      />
                                      <text
                                        x={paddingLeft - 12}
                                        y={line.y + 3.5}
                                        textAnchor="end"
                                        className="font-sans font-extrabold text-[11px] text-slate-500 fill-current"
                                      >
                                        {line.value >= 1000000
                                          ? `R$ ${(line.value / 1000000).toFixed(1)}M`
                                          : line.value >= 1000
                                            ? `R$ ${(line.value / 1000).toFixed(0)}k`
                                            : `R$ ${line.value}`}
                                      </text>
                                    </g>
                                  ))}

                                  {/* Solid Y Axis Line */}
                                  <line
                                    x1={paddingLeft}
                                    y1={yTop - 10}
                                    x2={paddingLeft}
                                    y2={yBottom}
                                    stroke="#c3c6d7"
                                    strokeWidth={1.5}
                                    className="opacity-50"
                                  />

                                  {/* Area filled underneath */}
                                  {areaD && (
                                    <path
                                      d={areaD}
                                      fill="url(#chartAreaGradient)"
                                    />
                                  )}

                                  {/* Smooth Line Path */}
                                  {pathD && (
                                    <path
                                      d={pathD}
                                      fill="none"
                                      stroke="#004ac6"
                                      strokeWidth={3.5}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  )}

                                  {/* Main solid baseline */}
                                  <line
                                    x1={paddingLeft}
                                    y1={yBottom}
                                    x2={paddingLeft + plotWidth}
                                    y2={yBottom}
                                    stroke="#c3c6d7"
                                    strokeWidth={1.5}
                                    className="opacity-60"
                                  />

                                  {/* Text Labels under base line */}
                                  {points.map((p, idx) => {
                                    const isSelected = p.item.key === currentComp.key;
                                    return (
                                      <text
                                        key={idx}
                                        x={p.x}
                                        y={yBottom + 22}
                                        textAnchor="middle"
                                        className={`font-sans text-[11px] font-black tracking-wider uppercase select-none transition-colors duration-150 ${
                                          isSelected ? 'fill-[#004ac6] text-[#004ac6]' : 'fill-[#82869a] text-[#82869a]'
                                        }`}
                                      >
                                        {p.item.mesNome.substring(0, 3)}
                                      </text>
                                    );
                                  })}

                                  {/* Interactive Points and Tooltips */}
                                  {points.map((p, idx) => {
                                    const isSelected = p.item.key === currentComp.key;
                                    const prevMonth = idx > 0 ? comparativoMensal[idx - 1] : null;
                                    const diffVal = prevMonth ? p.item.faturamentoLiquido - prevMonth.faturamentoLiquido : 0;
                                    const pctVal = prevMonth ? p.item.varFaturamentoLiquido : 0;

                                    return (
                                      <g
                                        key={p.item.key}
                                        className="group cursor-pointer"
                                        onClick={() => {
                                          setSelectedComparisonKey(p.item.key);
                                          if (idx > 0) {
                                            setComparisonBaseKey(comparativoMensal[idx - 1].key);
                                          } else {
                                            setComparisonBaseKey(p.item.key);
                                          }
                                          triggerToast(`📅 Comparando ${p.item.mesNome} de ${p.item.ano}`);
                                        }}
                                      >
                                        {/* Invisible Rect for hovering anywhere in vertical slice */}
                                        <rect
                                          x={p.x - ((chartWidth - paddingLeft - paddingRight) / (points.length - 1 || 1)) / 2}
                                          y={0}
                                          width={(chartWidth - paddingLeft - paddingRight) / (points.length - 1 || 1)}
                                          height={chartHeight}
                                          fill="transparent"
                                        />

                                        {/* Vertical dashboard grid guide line on hover */}
                                        <line
                                          x1={p.x}
                                          y1={yTop - 10}
                                          x2={p.x}
                                          y2={yBottom}
                                          stroke="#004ac6"
                                          strokeWidth={1.5}
                                          strokeDasharray="4 4"
                                          className="opacity-0 group-hover:opacity-45 transition-opacity duration-150 pointer-events-none"
                                        />

                                        {/* Outer glow aura on hover */}
                                        <circle
                                          cx={p.x}
                                          cy={p.y}
                                          r={12}
                                          className="fill-[#004ac6] opacity-0 group-hover:opacity-15 transition-opacity duration-150 pointer-events-none"
                                        />

                                        {/* Colored circle point */}
                                        <circle
                                          cx={p.x}
                                          cy={p.y}
                                          r={isSelected ? 6.5 : 5}
                                          className={`transition-all duration-150 stroke-[3px] pointer-events-none ${
                                            isSelected
                                              ? 'fill-white stroke-[#004ac6]'
                                              : 'fill-[#c3c6d7] stroke-white group-hover:stroke-[#004ac6] group-hover:fill-white'
                                          }`}
                                        />

                                        {/* Polish Tooltip Card wrapped in foreignObject */}
                                        <foreignObject
                                          x={p.x - 110}
                                          y={p.y - 114}
                                          width={220}
                                          height={115}
                                          className="overflow-visible pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        >
                                          <div className="flex flex-col items-center">
                                            <div className="bg-[#0b1c30] text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-700/60 flex flex-col gap-1 w-full text-[10px] leading-tight font-sans">
                                              <div className="font-extrabold text-[#6cf8bb] text-[10px] border-b border-slate-700/40 pb-1 mb-1 flex justify-between items-center">
                                                <span>{p.item.mesNome.toUpperCase()} / {p.item.ano}</span>
                                                <span className="text-[8px] text-slate-400 font-semibold uppercase font-mono">Ref. Líquido</span>
                                              </div>
                                              
                                              {/* Valor */}
                                              <div className="flex items-center justify-between">
                                                <span className="text-[#a0a5c0] font-semibold">Valor Líquido:</span>
                                                <span className="text-white font-black text-xs leading-none">{formatMoney(p.item.faturamentoLiquido)}</span>
                                              </div>

                                              {prevMonth ? (
                                                <>
                                                  {/* Diferença */}
                                                  <div className="flex items-center justify-between border-t border-slate-800/40 pt-1 mt-0.5">
                                                    <span className="text-[#a0a5c0] font-semibold">Diferença MoM:</span>
                                                    <span className={`font-black tracking-tight ${diffVal >= 0 ? 'text-[#6cf8bb]' : 'text-rose-400'}`}>
                                                      {formatDiffMoney(p.item.faturamentoLiquido, prevMonth.faturamentoLiquido)}
                                                    </span>
                                                  </div>
                                                  {/* Porcentagem */}
                                                  <div className="flex items-center justify-between pt-0.5">
                                                    <span className="text-[#a0a5c0] font-semibold">Porcentagem:</span>
                                                    <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${pctVal >= 0 ? 'bg-[#6cf8bb]/15 text-[#6cf8bb]' : 'bg-rose-500/15 text-rose-400'}`}>
                                                      {formatPercent(pctVal)}
                                                    </span>
                                                  </div>
                                                </>
                                              ) : (
                                                <div className="text-[10px] text-slate-400 font-medium italic text-center w-full pt-1.5 border-t border-slate-800/40">
                                                  Mês Base de Carga
                                                </div>
                                              )}
                                            </div>
                                            {/* Beautiful Little Tooltip cursor arrow */}
                                            <div className="w-2.5 h-2.5 bg-[#0b1c30] rotate-45 -mt-1 border-r border-[#0b1c30]" />
                                          </div>
                                        </foreignObject>
                                      </g>
                                    );
                                  })}
                                </svg>
                              </div>
                            );
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
                                    onClick={() => {
                                      setSelectedComparisonKey(item.key);
                                      if (idx > 0) {
                                        setComparisonBaseKey(comparativoMensal[idx - 1].key);
                                      } else {
                                        setComparisonBaseKey(item.key);
                                      }
                                    }}
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

            {activeTab === 'ranking_supervisao' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-6 font-sans"
              >
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-[#c3c6d7]/30 shadow-3xs">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#737686] uppercase tracking-widest flex items-center gap-1.5 leading-none">
                      <Award className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> Desempenho e Liderança
                    </span>
                    <h2 className="text-xl font-black text-[#0b1c30] mt-1.5 uppercase tracking-tight">
                      Ranking de Supervisão por Filial
                    </h2>
                    <p className="text-xs font-medium text-[#737686] mt-1">
                      Análise classificatória dos supervisores com base em faturamento, volume de viagens e conformidade de metas.
                    </p>
                  </div>
                  
                  {/* Local Controls */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* View type switcher */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#434655] uppercase tracking-wider">Modo de Exibição</label>
                      <div className="flex items-center bg-[#f8f9fc] border border-[#c3c6d7]/40 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setRankingViewType('bento')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            rankingViewType === 'bento'
                              ? 'bg-white text-[#004ac6] shadow-3xs font-extrabold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Líderes (Bento)
                        </button>
                        <button
                          type="button"
                          onClick={() => setRankingViewType('tabela')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            rankingViewType === 'tabela'
                              ? 'bg-white text-[#004ac6] shadow-3xs font-extrabold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Tabela Geral
                        </button>
                      </div>
                    </div>
                  </div>
                </header>

                {/* KPI Totalizers */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {(() => {
                    const totalS = computedSupervisorRankings.all.length;
                    const totalFat = computedSupervisorRankings.all.reduce((sum, s) => sum + s.faturamento, 0);
                    const totalV = computedSupervisorRankings.all.reduce((sum, s) => sum + s.viagensCount, 0);
                    const totalP_evals = metrics.dentroMetaCount + metrics.foraMetaCount;
                    const totalPDentro = metrics.dentroMetaCount;
                    const overallCompliance = totalP_evals > 0 ? Math.round((totalPDentro / totalP_evals) * 100) : 0;

                    return (
                      <>
                        <div className="bg-white border border-[#c3c6d7]/30 p-5 rounded-2xl shadow-3xs flex flex-col justify-between">
                          <span className="text-[10px] font-extrabold text-[#737686] uppercase tracking-wider block">Supervisores Ativos</span>
                          <div className="mt-2.5">
                            <span className="text-2xl font-black text-[#0b1c30] block">{totalS}</span>
                            <span className="text-[10px] font-bold text-slate-500 mt-1 block">no filtro selecionado</span>
                          </div>
                        </div>

                        <div className="bg-white border border-[#c3c6d7]/30 p-5 rounded-2xl shadow-3xs flex flex-col justify-between">
                          <span className="text-[10px] font-extrabold text-[#737686] uppercase tracking-wider block">Faturamento Acumulado</span>
                          <div className="mt-2.5">
                            <span className="text-xl font-black text-emerald-600 truncate block">R$ {totalFat.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span className="text-[10px] font-bold text-slate-500 mt-1 block">rendimento bruto gerido</span>
                          </div>
                        </div>

                        <div className="bg-white border border-[#c3c6d7]/30 p-5 rounded-2xl shadow-3xs flex flex-col justify-between">
                          <span className="text-[10px] font-extrabold text-[#737686] uppercase tracking-wider block">Total de Viagens</span>
                          <div className="mt-2.5">
                            <span className="text-2xl font-black text-[#004ac6] block">{totalV.toLocaleString('pt-BR')}</span>
                            <span className="text-[10px] font-bold text-slate-500 mt-1 block">conhecimentos emitidos</span>
                          </div>
                        </div>

                        <div className="bg-white border border-[#c3c6d7]/30 p-5 rounded-2xl shadow-3xs flex flex-col justify-between">
                          <span className="text-[10px] font-extrabold text-[#737686] uppercase tracking-wider block">Aproveitamento de Placas</span>
                          <div className="mt-2.5 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-blue-600 block">{overallCompliance}%</span>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {totalPDentro}/{totalP_evals} dentro
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 mt-1 block">veículos atingindo metas</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Bento Grid Leaders View */}
                {rankingViewType === 'bento' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
                    
                    {/* BENTO CARD 1: BY FATURAMENTO */}
                    <div className="bg-white border border-[#c3c6d7]/35 rounded-2xl p-6 shadow-3xs space-y-5 flex flex-col">
                      <div className="flex items-center justify-between border-b border-[#c3c6d7]/20 pb-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-500" />
                          <div>
                            <h3 className="text-xs font-black text-[#0b1c30] uppercase tracking-wider">Top 5 por Faturamento</h3>
                            <p className="text-[10px] font-bold text-slate-400">Classificação por receita bruta total</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded uppercase font-mono">RECONHECIMENTO</span>
                      </div>

                      {computedSupervisorRankings.byFaturamento.length > 0 ? (
                        <div className="flex flex-col flex-1 justify-between">
                          {/* Podium Visual Graphic */}
                          {(() => {
                            const list = computedSupervisorRankings.byFaturamento;
                            const first = list[0];
                            const second = list[1];
                            const third = list[2];
                            const fourth = list[3];
                            const fifth = list[4];

                            const valFmt = (sup: any) => `R$ ${sup.faturamento.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

                            return (
                              <>
                                <div className="flex items-end justify-between gap-1 h-44 bg-[#f8f9fc] rounded-2xl p-3 border border-[#c3c6d7]/15">
                                  
                                  {/* 2º Place (Left) */}
                                  <div className="flex-1 flex flex-col items-center">
                                    {second ? (
                                      <>
                                        <div className="flex flex-col items-center w-full mb-1">
                                          <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-[10px] font-black text-slate-600 mb-0.5 select-none shadow-3xs">
                                            {second.supervisor.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                          </div>
                                          <span className="text-[9px] font-black text-[#0b1c30] text-center truncate w-full uppercase" title={second.supervisor}>
                                            {second.supervisor.split(' ')[0]}
                                          </span>
                                          <span className="text-[9px] font-bold text-[#004ac6] truncate w-full text-center">
                                            {valFmt(second)}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-lg flex flex-col items-center justify-center h-14 relative border-t-2 border-slate-300 shadow-3xs">
                                          <span className="text-xs">🥈</span>
                                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider font-mono">2º</span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="w-full h-14 bg-slate-100/30 rounded-t-lg border-t border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-[8px] font-bold">Vazio</div>
                                    )}
                                  </div>

                                  {/* 1º Place (Center) */}
                                  <div className="flex-1 flex flex-col items-center relative -top-1">
                                    {first ? (
                                      <>
                                        <div className="flex flex-col items-center w-full mb-1">
                                          <div className="relative mb-0.5">
                                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs animate-bounce select-none">👑</span>
                                            <div className="w-10 h-10 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center text-xs font-black text-amber-700 shadow-3xs">
                                              {first.supervisor.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                            </div>
                                          </div>
                                          <span className="text-[10px] font-black text-amber-600 text-center truncate w-full uppercase" title={first.supervisor}>
                                            {first.supervisor.split(' ')[0]}
                                          </span>
                                          <span className="text-[10px] font-black text-emerald-600 truncate w-full text-center">
                                            {valFmt(first)}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gradient-to-t from-amber-200/50 to-amber-100/40 rounded-t-lg flex flex-col items-center justify-center h-20 relative border-t-2 border-amber-400 shadow-2xs">
                                          <span className="text-sm select-none">🥇</span>
                                          <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest font-mono">1º</span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="w-full h-20 bg-slate-200/35 rounded-t-lg border-t border-dashed border-slate-300 flex items-center justify-center text-slate-300 text-[8px] font-bold">Vazio</div>
                                    )}
                                  </div>

                                  {/* 3º Place (Right) */}
                                  <div className="flex-1 flex flex-col items-center">
                                    {third ? (
                                      <>
                                        <div className="flex flex-col items-center w-full mb-1">
                                          <div className="w-8 h-8 rounded-full bg-amber-50/50 border-2 border-amber-600/20 flex items-center justify-center text-[10px] font-black text-amber-900/60 mb-0.5 select-none shadow-3xs">
                                            {third.supervisor.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                          </div>
                                          <span className="text-[9px] font-black text-[#0b1c30] text-center truncate w-full uppercase" title={third.supervisor}>
                                            {third.supervisor.split(' ')[0]}
                                          </span>
                                          <span className="text-[9px] font-bold text-slate-500 truncate w-full text-center">
                                            {valFmt(third)}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gradient-to-t from-orange-100 to-orange-50/50 rounded-t-lg flex flex-col items-center justify-center h-10 relative border-t-2 border-orange-200 shadow-3xs">
                                          <span className="text-xs">🥉</span>
                                          <span className="text-[8px] font-black text-orange-600 uppercase tracking-wider font-mono">3º</span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="w-full h-10 bg-slate-100/30 rounded-t-lg border-t border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-[8px] font-bold">Vazio</div>
                                    )}
                                  </div>

                                </div>

                                {/* Items 4 and 5 */}
                                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                                  {fourth && (
                                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#f8f9fc] border border-[#c3c6d7]/10 hover:border-[#004ac6]/20 transition-all">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black bg-slate-100 text-slate-500 w-5 h-5 flex items-center justify-center rounded-md font-mono">4º</span>
                                        <span className="text-xs font-black text-[#0b1c30] uppercase truncate max-w-[150px]">{fourth.supervisor}</span>
                                      </div>
                                      <span className="text-xs font-black text-slate-600">{valFmt(fourth)}</span>
                                    </div>
                                  )}
                                  {fifth && (
                                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#f8f9fc] border border-[#c3c6d7]/10 hover:border-[#004ac6]/20 transition-all">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black bg-slate-100 text-slate-500 w-5 h-5 flex items-center justify-center rounded-md font-mono">5º</span>
                                        <span className="text-xs font-black text-[#0b1c30] uppercase truncate max-w-[150px]">{fifth.supervisor}</span>
                                      </div>
                                      <span className="text-xs font-black text-slate-600">{valFmt(fifth)}</span>
                                    </div>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400 text-xs font-medium">Nenhum supervisor ativo no momento.</div>
                      )}
                    </div>

                    {/* BENTO CARD 2: BY TRIP COUNT */}
                    <div className="bg-white border border-[#c3c6d7]/35 rounded-2xl p-6 shadow-3xs space-y-5 flex flex-col">
                      <div className="flex items-center justify-between border-b border-[#c3c6d7]/20 pb-3">
                        <div className="flex items-center gap-2">
                          <Truck className="w-5 h-5 text-blue-500" />
                          <div>
                            <h3 className="text-xs font-black text-[#0b1c30] uppercase tracking-wider">Top 5 por Viagens (QTD)</h3>
                            <p className="text-[10px] font-bold text-slate-400">Classificação por volume operacional</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase font-mono">FORÇA</span>
                      </div>

                      {computedSupervisorRankings.byViagens.length > 0 ? (
                        <div className="flex flex-col flex-1 justify-between">
                          {/* Podium Visual Graphic */}
                          {(() => {
                            const list = computedSupervisorRankings.byViagens;
                            const first = list[0];
                            const second = list[1];
                            const third = list[2];
                            const fourth = list[3];
                            const fifth = list[4];

                            const valFmt = (sup: any) => `${sup.viagensCount} viagens`;

                            return (
                              <>
                                <div className="flex items-end justify-between gap-1 h-44 bg-[#f8f9fc] rounded-2xl p-3 border border-[#c3c6d7]/15">
                                  
                                  {/* 2º Place (Left) */}
                                  <div className="flex-1 flex flex-col items-center">
                                    {second ? (
                                      <>
                                        <div className="flex flex-col items-center w-full mb-1">
                                          <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-[10px] font-black text-slate-600 mb-0.5 select-none shadow-3xs">
                                            {second.supervisor.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                          </div>
                                          <span className="text-[9px] font-black text-[#0b1c30] text-center truncate w-full uppercase" title={second.supervisor}>
                                            {second.supervisor.split(' ')[0]}
                                          </span>
                                          <span className="text-[9px] font-bold text-[#004ac6] truncate w-full text-center">
                                            {valFmt(second)}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-lg flex flex-col items-center justify-center h-14 relative border-t-2 border-slate-300 shadow-3xs">
                                          <span className="text-xs">🥈</span>
                                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider font-mono">2º</span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="w-full h-14 bg-slate-100/30 rounded-t-lg border-t border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-[8px] font-bold">Vazio</div>
                                    )}
                                  </div>

                                  {/* 1º Place (Center) */}
                                  <div className="flex-1 flex flex-col items-center relative -top-1">
                                    {first ? (
                                      <>
                                        <div className="flex flex-col items-center w-full mb-1">
                                          <div className="relative mb-0.5">
                                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs animate-bounce select-none">👑</span>
                                            <div className="w-10 h-10 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center text-xs font-black text-amber-700 shadow-3xs">
                                              {first.supervisor.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                            </div>
                                          </div>
                                          <span className="text-[10px] font-black text-amber-600 text-center truncate w-full uppercase" title={first.supervisor}>
                                            {first.supervisor.split(' ')[0]}
                                          </span>
                                          <span className="text-[10px] font-black text-blue-600 truncate w-full text-center font-bold">
                                            {valFmt(first)}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gradient-to-t from-amber-200/50 to-amber-100/40 rounded-t-lg flex flex-col items-center justify-center h-20 relative border-t-2 border-amber-400 shadow-2xs">
                                          <span className="text-sm select-none">🥇</span>
                                          <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest font-mono">1º</span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="w-full h-20 bg-slate-200/35 rounded-t-lg border-t border-dashed border-slate-300 flex items-center justify-center text-slate-300 text-[8px] font-bold">Vazio</div>
                                    )}
                                  </div>

                                  {/* 3º Place (Right) */}
                                  <div className="flex-1 flex flex-col items-center">
                                    {third ? (
                                      <>
                                        <div className="flex flex-col items-center w-full mb-1">
                                          <div className="w-8 h-8 rounded-full bg-amber-50/50 border-2 border-amber-600/20 flex items-center justify-center text-[10px] font-black text-amber-900/60 mb-0.5 select-none shadow-3xs">
                                            {third.supervisor.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                          </div>
                                          <span className="text-[9px] font-black text-[#0b1c30] text-center truncate w-full uppercase" title={third.supervisor}>
                                            {third.supervisor.split(' ')[0]}
                                          </span>
                                          <span className="text-[9px] font-bold text-slate-500 truncate w-full text-center">
                                            {valFmt(third)}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gradient-to-t from-orange-100 to-orange-50/50 rounded-t-lg flex flex-col items-center justify-center h-10 relative border-t-2 border-orange-200 shadow-3xs">
                                          <span className="text-xs">🥉</span>
                                          <span className="text-[8px] font-black text-orange-600 uppercase tracking-wider font-mono">3º</span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="w-full h-10 bg-slate-100/30 rounded-t-lg border-t border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-[8px] font-bold">Vazio</div>
                                    )}
                                  </div>

                                </div>

                                {/* Items 4 and 5 */}
                                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                                  {fourth && (
                                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#f8f9fc] border border-[#c3c6d7]/10 hover:border-[#004ac6]/20 transition-all">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black bg-slate-100 text-slate-500 w-5 h-5 flex items-center justify-center rounded-md font-mono">4º</span>
                                        <span className="text-xs font-black text-[#0b1c30] uppercase truncate max-w-[150px]">{fourth.supervisor}</span>
                                      </div>
                                      <span className="text-xs font-black text-slate-600">{valFmt(fourth)}</span>
                                    </div>
                                  )}
                                  {fifth && (
                                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#f8f9fc] border border-[#c3c6d7]/10 hover:border-[#004ac6]/20 transition-all">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black bg-slate-100 text-slate-500 w-5 h-5 flex items-center justify-center rounded-md font-mono">5º</span>
                                        <span className="text-xs font-black text-[#0b1c30] uppercase truncate max-w-[150px]">{fifth.supervisor}</span>
                                      </div>
                                      <span className="text-xs font-black text-slate-600">{valFmt(fifth)}</span>
                                    </div>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400 text-xs font-medium">Nenhum supervisor ativo no momento.</div>
                      )}
                    </div>

                    {/* BENTO CARD 3: BY GOAL COMPLIANCE (DENTRO VS FORA DA META) */}
                    <div className="bg-white border border-[#c3c6d7]/35 rounded-2xl p-6 shadow-3xs space-y-5 flex flex-col">
                      <div className="flex items-center justify-between border-b border-[#c3c6d7]/20 pb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          <div>
                            <h3 className="text-xs font-black text-[#0b1c30] uppercase tracking-wider">Aproveitamento de Metas</h3>
                            <p className="text-[10px] font-bold text-slate-400">Veículos dentro das viagens desejadas</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded uppercase font-mono">CONFORMIDADE</span>
                      </div>

                      {computedSupervisorRankings.byMeta.length > 0 ? (
                        <div className="flex flex-col flex-1 justify-between">
                          {/* Podium Visual Graphic */}
                          {(() => {
                            const list = computedSupervisorRankings.byMeta;
                            const first = list[0];
                            const second = list[1];
                            const third = list[2];
                            const fourth = list[3];
                            const fifth = list[4];

                            const valFmt = (sup: any) => `${sup.metaAproveitamento}%`;

                            return (
                              <>
                                <div className="flex items-end justify-between gap-1 h-44 bg-[#f8f9fc] rounded-2xl p-3 border border-[#c3c6d7]/15">
                                  
                                  {/* 2º Place (Left) */}
                                  <div className="flex-1 flex flex-col items-center">
                                    {second ? (
                                      <>
                                        <div className="flex flex-col items-center w-full mb-1">
                                          <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-[10px] font-black text-slate-600 mb-0.5 select-none shadow-3xs">
                                            {second.supervisor.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                          </div>
                                          <span className="text-[9px] font-black text-[#0b1c30] text-center truncate w-full uppercase" title={second.supervisor}>
                                            {second.supervisor.split(' ')[0]}
                                          </span>
                                          <span className="text-[9px] font-bold text-[#004ac6] truncate w-full text-center">
                                            {valFmt(second)}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-lg flex flex-col items-center justify-center h-14 relative border-t-2 border-slate-300 shadow-3xs">
                                          <span className="text-xs">🥈</span>
                                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider font-mono">2º</span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="w-full h-14 bg-slate-100/30 rounded-t-lg border-t border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-[8px] font-bold">Vazio</div>
                                    )}
                                  </div>

                                  {/* 1º Place (Center) */}
                                  <div className="flex-1 flex flex-col items-center relative -top-1">
                                    {first ? (
                                      <>
                                        <div className="flex flex-col items-center w-full mb-1">
                                          <div className="relative mb-0.5">
                                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs animate-bounce select-none">👑</span>
                                            <div className="w-10 h-10 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center text-xs font-black text-amber-700 shadow-3xs">
                                              {first.supervisor.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                            </div>
                                          </div>
                                          <span className="text-[10px] font-black text-amber-600 text-center truncate w-full uppercase" title={first.supervisor}>
                                            {first.supervisor.split(' ')[0]}
                                          </span>
                                          <span className="text-[10px] font-black text-emerald-600 truncate w-full text-center font-bold">
                                            {valFmt(first)}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gradient-to-t from-amber-200/50 to-amber-100/40 rounded-t-lg flex flex-col items-center justify-center h-20 relative border-t-2 border-amber-400 shadow-2xs">
                                          <span className="text-sm select-none">🥇</span>
                                          <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest font-mono">1º</span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="w-full h-20 bg-slate-200/35 rounded-t-lg border-t border-dashed border-slate-300 flex items-center justify-center text-slate-300 text-[8px] font-bold">Vazio</div>
                                    )}
                                  </div>

                                  {/* 3º Place (Right) */}
                                  <div className="flex-1 flex flex-col items-center">
                                    {third ? (
                                      <>
                                        <div className="flex flex-col items-center w-full mb-1">
                                          <div className="w-8 h-8 rounded-full bg-amber-50/50 border-2 border-amber-600/20 flex items-center justify-center text-[10px] font-black text-amber-900/60 mb-0.5 select-none shadow-3xs">
                                            {third.supervisor.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                          </div>
                                          <span className="text-[9px] font-black text-[#0b1c30] text-center truncate w-full uppercase" title={third.supervisor}>
                                            {third.supervisor.split(' ')[0]}
                                          </span>
                                          <span className="text-[9px] font-bold text-slate-500 truncate w-full text-center">
                                            {valFmt(third)}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gradient-to-t from-orange-100 to-orange-50/50 rounded-t-lg flex flex-col items-center justify-center h-10 relative border-t-2 border-orange-200 shadow-3xs">
                                          <span className="text-xs">🥉</span>
                                          <span className="text-[8px] font-black text-orange-600 uppercase tracking-wider font-mono">3º</span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="w-full h-10 bg-slate-100/30 rounded-t-lg border-t border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-[8px] font-bold">Vazio</div>
                                    )}
                                  </div>

                                </div>

                                {/* Items 4 and 5 */}
                                <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                                  {[fourth, fifth].map((sup, idx) => {
                                    if (!sup) return null;
                                    const rankNum = idx === 0 ? '4º' : '5º';
                                    return (
                                      <div key={sup.supervisor} className="flex flex-col gap-1 p-2 bg-[#f8f9fc] border border-[#c3c6d7]/15 rounded-xl hover:border-[#004ac6]/20 transition-all">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black bg-slate-100 text-slate-500 w-5 h-5 flex items-center justify-center rounded-md font-mono">{rankNum}</span>
                                            <span className="text-xs font-black text-[#0b1c30] uppercase truncate max-w-[150px]">{sup.supervisor}</span>
                                          </div>
                                          <span className="text-xs font-black text-slate-700">
                                            {sup.metaAproveitamento}%
                                          </span>
                                        </div>
                                        {/* Horizontal Split bar */}
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                                          {sup.platesDentro > 0 && (
                                            <div className="bg-emerald-400 h-full" style={{ width: `${(sup.platesDentro / sup.totalPlates) * 100}%` }}></div>
                                          )}
                                          {sup.platesFora > 0 && (
                                            <div className="bg-rose-400 h-full" style={{ width: `${(sup.platesFora / sup.totalPlates) * 100}%` }}></div>
                                          )}
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                                          <span className="text-emerald-600">{sup.platesDentro} dentro</span>
                                          <span className="text-rose-500">{sup.platesFora} fora</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400 text-xs font-medium">Nenhum supervisor ativo no momento.</div>
                      )}
                    </div>

                  </div>
                )}

                {/* DETAILED LEADERBOARD TABLE OF ALL SUPERVISORS */}
                <div className="bg-white border border-[#c3c6d7]/35 rounded-2xl shadow-3xs overflow-hidden flex flex-col">
                  
                  {/* Table Control Header */}
                  <div className="p-5 border-b border-[#c3c6d7]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#f8f9fc]/40">
                    <div>
                      <h3 className="text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider">
                        Lista Geral de Supervisão
                      </h3>
                      <p className="text-[10px] font-bold text-[#737686] mt-0.5">
                        Exibindo {sortedAndFilteredAllSupervisors.length} registros. Clique em qualquer linha para ver os veículos sob supervisão.
                      </p>
                    </div>

                    {/* Search inside table */}
                    <div className="w-full sm:w-auto relative max-w-xs">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="Buscar supervisor..."
                        value={rankingSearchQuery}
                        onChange={(e) => setRankingSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 text-xs font-medium bg-white text-[#0b1c30] border border-[#c3c6d7]/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#004ac6] transition-all"
                      />
                      {rankingSearchQuery && (
                        <button
                          onClick={() => setRankingSearchQuery('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#0b1c30]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Standard Interactive Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans text-xs">
                      <thead>
                        <tr className="bg-slate-100/50 border-b border-[#c3c6d7]/30 text-[#434655] font-extrabold uppercase select-none tracking-wider text-[10px]">
                          <th className="px-5 py-3.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (rankingSortField === 'supervisor') {
                                  setRankingSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                } else {
                                  setRankingSortField('supervisor');
                                  setRankingSortDirection('asc');
                                }
                              }}
                              className="flex items-center gap-1 hover:text-[#0b1c30]"
                            >
                              Supervisor {rankingSortField === 'supervisor' && (rankingSortDirection === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="px-5 py-3.5 text-right font-sans">
                            <button
                              type="button"
                              onClick={() => {
                                if (rankingSortField === 'faturamento') {
                                  setRankingSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                } else {
                                  setRankingSortField('faturamento');
                                  setRankingSortDirection('desc');
                                }
                              }}
                              className="flex items-center justify-end gap-1 hover:text-[#0b1c30] w-full"
                            >
                              Faturamento Bruto {rankingSortField === 'faturamento' && (rankingSortDirection === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="px-5 py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (rankingSortField === 'viagensCount') {
                                  setRankingSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                } else {
                                  setRankingSortField('viagensCount');
                                  setRankingSortDirection('desc');
                                }
                              }}
                              className="flex items-center justify-center gap-1 hover:text-[#0b1c30] w-full"
                            >
                              Qtd de Viagens {rankingSortField === 'viagensCount' && (rankingSortDirection === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="px-5 py-3.5 text-center">
                            Aproveitamento de Placas (Dentro / Fora da Meta)
                          </th>
                          <th className="px-5 py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (rankingSortField === 'metaAproveitamento') {
                                  setRankingSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                } else {
                                  setRankingSortField('metaAproveitamento');
                                  setRankingSortDirection('desc');
                                }
                              }}
                              className="flex items-center justify-center gap-1 hover:text-[#0b1c30] w-full"
                            >
                              Aproveitamento (%) {rankingSortField === 'metaAproveitamento' && (rankingSortDirection === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="px-5 py-3.5 text-center w-[120px]">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#c3c6d7]/15">
                        {sortedAndFilteredAllSupervisors.map((row) => {
                          const isExpanded = expandedSupervisor === row.supervisor;
                          return (
                            <React.Fragment key={row.supervisor}>
                              <tr
                                onClick={() => setExpandedSupervisor(isExpanded ? null : row.supervisor)}
                                className={`group cursor-pointer hover:bg-slate-50/70 transition-colors ${
                                  isExpanded ? 'bg-slate-50/50' : ''
                                }`}
                              >
                                <td className="px-5 py-4 font-black text-[#0b1c30] uppercase flex items-center gap-2">
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 animate-fade-in" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 animate-fade-in" />
                                  )}
                                  {row.supervisor}
                                </td>
                                <td className="px-5 py-4 text-right font-bold text-[#00714d] font-sans">
                                  R$ {row.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-5 py-4 text-center font-bold text-[#0b1c30]">
                                  {row.viagensCount}
                                </td>
                                <td className="px-5 py-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-100/30">
                                      {row.platesDentro} na meta
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-100/30">
                                      {row.platesFora} fora
                                    </span>
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-center font-bold text-[#0b1c30]">
                                  <div className="flex items-center justify-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wide ${
                                      row.metaAproveitamento >= 80 ? 'bg-emerald-500 text-white' : 
                                      row.metaAproveitamento >= 50 ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                                    }`}>
                                      {row.metaAproveitamento}%
                                    </span>
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedSupervisor(isExpanded ? null : row.supervisor);
                                    }}
                                    className="text-[10px] font-black uppercase text-[#004ac6] hover:underline"
                                  >
                                    {isExpanded ? 'Ocultar' : 'Ver Detalhes'}
                                  </button>
                                </td>
                              </tr>
                              
                              {/* Expanded sub-grid of plates */}
                              {isExpanded && (
                                <tr>
                                  <td colSpan={6} className="bg-[#fcfdfe] p-5 shadow-inner border-y border-[#c3c6d7]/15">
                                    <div className="space-y-3 pl-6">
                                      <div className="flex items-center justify-between">
                                        <h4 className="text-[10.5px] font-black text-[#535665] uppercase tracking-wider flex items-center gap-1.5">
                                          📦 Placas Geridas por {row.supervisor} ({row.totalPlates} veículos)
                                        </h4>
                                        <span className="text-[9px] font-bold text-slate-400 italic">
                                          Valores obtidos do fechamento de contas do período
                                        </span>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {row.platesList.map((plt) => (
                                          <div 
                                            key={plt.placa} 
                                            className="bg-white border border-[#c3c6d7]/20 p-3 rounded-xl flex items-center justify-between shadow-3xs"
                                          >
                                            <div className="space-y-1">
                                              <span 
                                                className="text-xs font-black bg-slate-100 text-[#0b1c30] px-2 py-0.5 rounded font-mono uppercase"
                                              >
                                                🚚 {plt.placa}
                                              </span>
                                              <div className="text-[9px] text-slate-400 font-medium font-sans">
                                                Faturamento: <strong className="text-emerald-700">R$ {plt.faturamento.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</strong>
                                              </div>
                                            </div>
                                            <div className="text-right space-y-1">
                                              <span className={`text-[9.5px] font-black px-1.5 py-0.5 rounded block text-center ${
                                                plt.statusMeta === 'Dentro da Meta' ? 'bg-[#6cf8bb]/20 text-[#00714d]' : 'bg-rose-50 text-rose-600'
                                              }`}>
                                                {plt.statusMeta === 'Dentro da Meta' ? '🟢 COBERTO' : '🔴 PENDENTE'}
                                              </span>
                                              <div className="text-[9px] text-slate-500 font-bold block">
                                                {plt.viagens} viagens
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                        {sortedAndFilteredAllSupervisors.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-5 py-10 text-center text-[#737686] font-medium animate-fade-in">
                              Nenhum supervisor encontrado correspondente aos critérios de filtragem.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'perfil' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-6 max-w-4xl mx-auto font-sans"
              >
                {/* Header Section */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
                  <div>
                    <h2 className="text-[10px] font-extrabold text-[#737686] uppercase tracking-widest leading-none">
                      Painel de Ajustes Pessoais
                    </h2>
                    <h3 className="text-xl font-black mt-1 text-[#0b1c30]">Minhas Configurações de Perfil</h3>
                  </div>
                  
                  {currentUser && (
                    <div className="flex items-center gap-2 bg-[#004ac6]/10 px-3 py-1.5 rounded-xl border border-[#004ac6]/15">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-[#004ac6] uppercase tracking-wide">Perfil Sincronizado do Google Cloud</span>
                    </div>
                  )}
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column - Card Avatar Display */}
                  <div className="col-span-12 md:col-span-4 bg-white border border-[#c3c6d7]/30 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-between text-center min-h-[380px]">
                    <div className="w-full flex flex-col items-center">
                      {/* Avatar preview */}
                      <div className={`w-24 h-24 rounded-full ${personalProfile.avatarColor || 'bg-[#004ac6]'} text-white font-extrabold text-3xl flex items-center justify-center shadow-lg relative group transition-transform duration-300 hover:scale-105 mb-4`}>
                        {personalProfile.nome ? personalProfile.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'GM'}
                        <div className="absolute inset-0 bg-black/45 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Sparkles className="w-5 h-5 text-yellow-300 animate-bounce" />
                        </div>
                      </div>

                      <h4 className="text-sm font-black text-[#0b1c30] tracking-tight">{personalProfile.nome || 'Sem Nome'}</h4>
                      <p className="text-[11px] text-[#737686] font-bold uppercase mt-1 tracking-wider">{personalProfile.cargo || 'Sem Cargo'}</p>
                      
                      <div className="w-full mt-6 space-y-2 text-left bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-[10px] font-semibold text-[#434655]">
                          <span className="text-[#a0a5c0] font-bold">Email:</span>
                          <span className="truncate max-w-full text-[#0b1c30] font-bold" title={currentUser?.email || 'Nenhum'}>
                            {currentUser?.email || 'Apenas Cache Local'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-semibold text-[#434655]">
                          <span className="text-[#a0a5c0] font-bold">Acesso:</span>
                          <span className="text-[#004ac6] font-black uppercase">{userProfile}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-semibold text-[#434655]">
                          <span className="text-[#a0a5c0] font-bold">Estado:</span>
                          <span>{currentUser ? 'Nuvem Conectada' : 'Modo Offline'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Gradient Selector */}
                    <div className="w-full pt-6 border-t border-slate-100 text-left">
                      <label className="text-[9px] font-extrabold uppercase text-[#737686] tracking-wider block mb-2">Tema de Gradiente do Avatar</label>
                      <div className="grid grid-cols-6 gap-1.5 justify-items-center">
                        {[
                          { key: 'bg-[#004ac6]', class: 'bg-[#004ac6]', label: 'Azul Mateus' },
                          { key: 'bg-emerald-600', class: 'bg-emerald-600', label: 'Verde Floresta' },
                          { key: 'bg-rose-600', class: 'bg-rose-600', label: 'Vermelho Rubi' },
                          { key: 'bg-amber-600', class: 'bg-amber-600', label: 'Laranja Solar' },
                          { key: 'bg-[#5b21b6]', class: 'bg-[#5b21b6]', label: 'Roxo Imperial' },
                          { key: 'bg-slate-700', class: 'bg-slate-700', label: 'Cinza Grafite' },
                        ].map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => {
                              setPersonalProfile(prev => ({ ...prev, avatarColor: item.class }));
                              triggerToast(`🎨 Gradiente alterado: ${item.label}`);
                            }}
                            className={`w-6 h-6 rounded-full ${item.class} border-2 transition-all hover:scale-110 cursor-pointer ${
                              (personalProfile.avatarColor || 'bg-[#004ac6]') === item.class ? 'border-amber-400 scale-110 ring-2 ring-amber-400/20' : 'border-transparent'
                            }`}
                            title={item.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Form Preferences */}
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        // Persist offline first
                        localStorage.setItem('personal_profile', JSON.stringify(personalProfile));
                        
                        // Persist in Firestore if online
                        if (currentUser) {
                          await saveUserProfileToFirestore(currentUser.uid, personalProfile);
                          triggerToast("💾 Configurações de perfil enviadas e salvas na nuvem com segurança!");
                        } else {
                          triggerToast("💾 Ajustes salvos no cache do navegador local com sucesso!");
                        }
                      } catch (err) {
                        console.error(err);
                        triggerToast("❌ Erro ao salvar as configurações.");
                      }
                    }}
                    className="col-span-12 md:col-span-8 bg-white border border-[#c3c6d7]/30 rounded-2xl p-6 shadow-xs space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-[#737686] tracking-wider block">Nome Completo</label>
                        <input
                          type="text"
                          required
                          value={personalProfile.nome}
                          onChange={(e) => setPersonalProfile(prev => ({ ...prev, nome: e.target.value }))}
                          className="w-full bg-[#f8f9ff] text-xs font-bold text-[#0b1c30] px-4 py-3 rounded-xl border border-[#c3c6d7]/35 focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                        />
                      </div>

                      {/* Cargo input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-[#737686] tracking-wider block">Cargo / Função</label>
                        <input
                          type="text"
                          required
                          value={personalProfile.cargo}
                          onChange={(e) => setPersonalProfile(prev => ({ ...prev, cargo: e.target.value }))}
                          className="w-full bg-[#f8f9ff] text-xs font-bold text-[#0b1c30] px-4 py-3 rounded-xl border border-[#c3c6d7]/35 focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                        />
                      </div>

                      {/* Whatsapp contact */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-[#737686] tracking-wider block">WhatsApp de Contato</label>
                        <input
                          type="text"
                          value={personalProfile.whatsapp}
                          onChange={(e) => setPersonalProfile(prev => ({ ...prev, whatsapp: e.target.value }))}
                          className="w-full bg-[#f8f9ff] text-xs font-bold text-[#0b1c30] px-4 py-3 rounded-xl border border-[#c3c6d7]/35 focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                        />
                      </div>

                      {/* Trip Limit Meta threshold */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-[#737686] tracking-wider block">Limite de Carga Placa (Meta)</label>
                        <input
                          type="number"
                          value={personalProfile.limiteViagensPlaca}
                          onChange={(e) => setPersonalProfile(prev => ({ ...prev, limiteViagensPlaca: Number(e.target.value) }))}
                          className="w-full bg-[#f8f9ff] text-xs font-bold text-[#0b1c30] px-4 py-3 rounded-xl border border-[#c3c6d7]/35 focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                        />
                      </div>
                    </div>

                    <div className="border-t border-dashed border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Favorite branch (Filial preferida) */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-[#737686] tracking-wider block">Filial de Foco Preferida</label>
                        <select
                          value={personalProfile.filialPreferida || 'ALL'}
                          onChange={(e) => setPersonalProfile(prev => ({ ...prev, filialPreferida: e.target.value }))}
                          className="w-full bg-[#f8f9ff] text-xs font-bold text-[#0b1c30] px-4 py-3 rounded-xl border border-[#c3c6d7]/35 focus:outline-none focus:ring-1 focus:ring-[#004ac6] cursor-pointer"
                        >
                          <option value="ALL">Nenhuma (Mostrar Todas)</option>
                          {filiaisDrop.map((fKey) => (
                            <option key={fKey} value={fKey}>
                              {fKey}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Favorite supervisor (Supervisor preferido) */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-[#737686] tracking-wider block">Supervisor Integrado Padrão</label>
                        <select
                          value={personalProfile.supervisorPreferido || 'ALL'}
                          onChange={(e) => setPersonalProfile(prev => ({ ...prev, supervisorPreferido: e.target.value }))}
                          className="w-full bg-[#f8f9ff] text-xs font-bold text-[#0b1c30] px-4 py-3 rounded-xl border border-[#c3c6d7]/35 focus:outline-none focus:ring-1 focus:ring-[#004ac6] cursor-pointer"
                        >
                          <option value="ALL">Nenhum (Mostrar Todos)</option>
                          {supervisoresDrop.map((supKey) => (
                            <option key={supKey} value={supKey}>
                              {supKey}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Checkboxes Settings Section */}
                    <div className="border-t border-dashed border-slate-100 pt-4 space-y-3">
                      <h4 className="text-[10px] font-black uppercase text-[#737686] tracking-wider block">Preferências de Notificação & Som</h4>
                      
                      <div className="flex items-start gap-4">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            id="notificacoesEmail"
                            checked={personalProfile.notificacoesEmail}
                            onChange={(e) => setPersonalProfile(prev => ({ ...prev, notificacoesEmail: e.target.checked }))}
                            className="w-4 h-4 rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6] cursor-pointer"
                          />
                        </div>
                        <div className="text-xs">
                          <label htmlFor="notificacoesEmail" className="font-extrabold text-[#0b1c30] cursor-pointer select-none">Alertas por E-mail</label>
                          <p className="text-[10px] text-gray-500 font-semibold leading-tight">Enviar relatórios de fechamento de faturamento mensal para o e-mail cadastrado.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            id="alertasAudivel"
                            checked={personalProfile.alertasAudivel}
                            onChange={(e) => setPersonalProfile(prev => ({ ...prev, alertasAudivel: e.target.checked }))}
                            className="w-4 h-4 rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6] cursor-pointer"
                          />
                        </div>
                        <div className="text-xs">
                          <label htmlFor="alertasAudivel" className="font-extrabold text-[#0b1c30] cursor-pointer select-none">Som de Alerta no Painel</label>
                          <p className="text-[10px] text-gray-500 font-semibold leading-tight">Emitir avisos sonoros ao detectar veículos que atingirem valores fora da meta estipulada.</p>
                        </div>
                      </div>
                    </div>

                    {/* Save section buttons */}
                    <div className="border-t border-gray-100 pt-5 flex justify-end gap-3 font-sans">
                      <button
                        type="button"
                        onClick={() => { updateActiveTab('dashboard'); triggerToast("⚙️ Saída do Perfil concluída."); }}
                        className="px-5 py-3 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 text-[#434655] cursor-pointer transition-colors uppercase tracking-wider"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 rounded-xl text-xs font-black bg-[#004ac6] hover:bg-opacity-95 text-white flex items-center gap-2 shadow-md cursor-pointer transition-colors uppercase tracking-wider"
                      >
                        <Save className="w-4 h-4" />
                        Salvar Informações
                      </button>
                    </div>
                  </form>
                </div>
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

      {/* Placas Detail Modal Component */}
      <PlacasDetailModal
        categoryLabel={selectedTripCategory}
        rankings={rankings}
        onClose={() => setSelectedTripCategory(null)}
      />

      {/* Potential Revenue Detail Modal Component */}
      <PotentialRevenueDetailModal
        mesSelected={selectedPotentialMonth}
        preFilteredViagens={preFilteredViagens}
        onClose={() => setSelectedPotentialMonth(null)}
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
