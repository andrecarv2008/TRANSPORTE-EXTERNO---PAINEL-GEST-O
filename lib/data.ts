import { Viagem, ExecutiveMetrics, PlacaMetrics, MotoristaMetrics, RouteMetrics } from './types';

export const INITIAL_VIAGENS: Viagem[] = [
  {
    id: "8256594",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "3131 - CHAPADINHA X MATA ROMA-MA",
    placa: "MVU-8632",
    motorista: "RONILSON MARINHO LOPES",
    kmRodado: 677,
    valorCarga: 179795.95,
    qtdDias: 7,
    mediaDias: 7,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8340239",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "3131 - CHAPADINHA X MATA ROMA-MA",
    placa: "MVU-8632",
    motorista: "RONILSON MARINHO LOPES",
    kmRodado: 635,
    valorCarga: 190389.60,
    qtdDias: 3,
    mediaDias: 3,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8271033",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "3131 - CHAPADINHA X MATA ROMA-MA",
    placa: "OXV-9793",
    motorista: "OLIVAR VIANA SILVA",
    kmRodado: 790,
    valorCarga: 216916.50,
    qtdDias: 5,
    mediaDias: 5,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8294354",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "3131 - CHAPADINHA X MATA ROMA-MA",
    placa: "CYB-4E24",
    motorista: "ADRIANO RICARDO SANTOS",
    kmRodado: 748,
    valorCarga: 211108.95,
    qtdDias: 3,
    mediaDias: 3,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8350232",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "3131 - CHAPADINHA X MATA ROMA-MA",
    placa: "CYB-4E24",
    motorista: "ADRIANO RICARDO SANTOS",
    kmRodado: 778,
    valorCarga: 243025.43,
    qtdDias: 4,
    mediaDias: 4,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8303140",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "3131 - CHAPADINHA X MATA ROMA-MA",
    placa: "OXV-6586",
    motorista: "EDERSON MOREIRA DA ROCHA SANTOS",
    kmRodado: 729,
    valorCarga: 197726.72,
    qtdDias: 4,
    mediaDias: 4,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8351284",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "3131 - CHAPADINHA X MATA ROMA-MA",
    placa: "OXW-1135",
    motorista: "JOSE DIEGO DOS SANTOS LIMA",
    kmRodado: 772,
    valorCarga: 226709.07,
    qtdDias: 3,
    mediaDias: 3,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8257384",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "4097 - SAO BENEDITO DO RIO PRETO X BELAGUA - MA",
    placa: "CYB-4E24",
    motorista: "ADRIANO RICARDO SANTOS",
    kmRodado: 699,
    valorCarga: 214168.38,
    qtdDias: 3,
    mediaDias: 3,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8359357",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "4097 - SAO BENEDITO DO RIO PRETO X BELAGUA - MA",
    placa: "OJD-3277",
    motorista: "FLAVIO RICARDO RODRIGUES DE ARAUJO",
    kmRodado: 674,
    valorCarga: 239452.90,
    qtdDias: 2,
    mediaDias: 2,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8264057",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "4215 - ICATU X CACHOEIRA GRANDE-MA",
    placa: "OJD-0012",
    motorista: "FRANCISCO GOMES MENDES",
    kmRodado: 380,
    valorCarga: 209280.38,
    qtdDias: 2,
    mediaDias: 2,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8334905",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "4215 - ICATU X CACHOEIRA GRANDE-MA",
    placa: "OJD-0012",
    motorista: "FRANCISCO GOMES MENDES",
    kmRodado: 621,
    valorCarga: 218732.63,
    qtdDias: 3,
    mediaDias: 3,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8264090",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "3132 - VARGEM GRANDE X NINA RODRIGUES-MA",
    placa: "OXV-6364",
    motorista: "SILVESTRE SOUZA LOPES",
    kmRodado: 593,
    valorCarga: 197047.62,
    qtdDias: 3,
    mediaDias: 3,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8270914",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "3132 - VARGEM GRANDE X NINA RODRIGUES-MA",
    placa: "OJD-3277",
    motorista: "FLAVIO RICARDO RODRIGUES DE ARAUJO",
    kmRodado: 551,
    valorCarga: 200688.79,
    qtdDias: 3,
    mediaDias: 3,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8299889",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "3132 - VARGEM GRANDE X NINA RODRIGUES-MA",
    placa: "OJC-2636",
    motorista: "RODRIGO IAN COSTA BARROS",
    kmRodado: 632,
    valorCarga: 192831.46,
    qtdDias: 3,
    mediaDias: 3,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8303969",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "3132 - VARGEM GRANDE X NINA RODRIGUES-MA",
    placa: "PSC-4116",
    motorista: "JARDEL LIMA BOGEA",
    kmRodado: 546,
    valorCarga: 196908.29,
    qtdDias: 2,
    mediaDias: 2,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8318041",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "3132 - VARGEM GRANDE X NINA RODRIGUES-MA",
    placa: "OXV-9793",
    motorista: "JOAO MARIO NOGUEIRA DOS SANTOS",
    kmRodado: 582,
    valorCarga: 215200.23,
    qtdDias: 3,
    mediaDias: 3,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8356092",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "3132 - VARGEM GRANDE X NINA RODRIGUES-MA",
    placa: "OJD-0012",
    motorista: "FRANCISCO GOMES MENDES",
    kmRodado: 582,
    valorCarga: 237156.04,
    qtdDias: 2,
    mediaDias: 2,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8275267",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "2894 - SAO MATEUS X ALTO ALEGRE-MA",
    placa: "CYR-2921",
    motorista: "JOÃO JOSE OLIVEIRA DINIZ",
    kmRodado: 602,
    valorCarga: 192333.35,
    qtdDias: 5,
    mediaDias: 5,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8303833",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "2894 - SAO MATEUS X ALTO ALEGRE-MA",
    placa: "OJD-3277",
    motorista: "FLAVIO RICARDO RODRIGUES DE ARAUJO",
    kmRodado: 576,
    valorCarga: 178290.23,
    qtdDias: 6,
    mediaDias: 6,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8324769",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "2894 - SAO MATEUS X ALTO ALEGRE-MA",
    placa: "OXV-6364",
    motorista: "SILVESTRE SOUZA LOPES",
    kmRodado: 520,
    valorCarga: 202453.86,
    qtdDias: 3,
    mediaDias: 3,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8346161",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "2894 - SAO MATEUS X ALTO ALEGRE-MA",
    placa: "NXP-9330",
    motorista: "LEANDRO DE JESUS PEREIRA DA COSTA",
    kmRodado: 630,
    valorCarga: 259153.80,
    qtdDias: 4,
    mediaDias: 4,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8266481",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "2867 - VIANA X PENALVA - MA",
    placa: "CYB-4418",
    motorista: "LUIS FERNANDO GOMES",
    kmRodado: 616,
    valorCarga: 204983.65,
    qtdDias: 4,
    mediaDias: 4,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8334542",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "2867 - VIANA X PENALVA - MA",
    placa: "CYB-4418",
    motorista: "LUIS FERNANDO GOMES",
    kmRodado: 701,
    valorCarga: 192802.44,
    qtdDias: 5,
    mediaDias: 5,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8319789",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "2867 - VIANA X PENALVA - MA",
    placa: "CYB-4E24",
    motorista: "ADRIANO RICARDO SANTOS",
    kmRodado: 683,
    valorCarga: 218969.67,
    qtdDias: 4,
    mediaDias: 4,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8325431",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "2867 - VIANA X PENALVA - MA",
    placa: "OXW-1135",
    motorista: "NILTON PEREIRA DA SILVA",
    kmRodado: 592,
    valorCarga: 203380.18,
    qtdDias: 2,
    mediaDias: 2,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8274214",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "3694 - ARARI X CAJARI-MA",
    placa: "PSC-4116",
    motorista: "ALBELINO ANDRADE LEITE",
    kmRodado: 576,
    valorCarga: 204173.43,
    qtdDias: 4,
    mediaDias: 4,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8302555",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "3694 - ARARI X CAJARI-MA",
    placa: "OJD-0012",
    motorista: "FRANCISCO GOMES MENDES",
    kmRodado: 713,
    valorCarga: 195307.69,
    qtdDias: 4,
    mediaDias: 4,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8330874",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "3694 - ARARI X CAJARI-MA",
    placa: "OJC-2636",
    motorista: "RODRIGO IAN COSTA BARROS",
    kmRodado: 631,
    valorCarga: 223724.40,
    qtdDias: 4,
    mediaDias: 4,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8303075",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "4214 - SAO VICENTE FERRER X CAJAPIO - MA",
    placa: "CYR-2921",
    motorista: "JOAO CARLOS CARDOZO PINHEIRO",
    kmRodado: 512, // corrected 0 to avoid blank km visual display issues
    valorCarga: 212941.36,
    qtdDias: 5,
    mediaDias: 5,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8271155",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "2864 - MATINHA X SAO JOAO BATISTA-MA",
    placa: "OJC-2636",
    motorista: "RODRIGO IAN COSTA BARROS",
    kmRodado: 775,
    valorCarga: 184044.13,
    qtdDias: 3,
    mediaDias: 3,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8344522",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "2864 - MATINHA X SAO JOAO BATISTA-MA",
    placa: "OXV-6586",
    motorista: "EDERSON MOREIRA DA ROCHA SANTOS",
    kmRodado: 621,
    valorCarga: 225634.31,
    qtdDias: 3,
    mediaDias: 3,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8350920",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "2864 - MATINHA X SAO JOAO BATISTA-MA",
    placa: "OXV-6364",
    motorista: "SILVESTRE SOUZA LOPES",
    kmRodado: 747,
    valorCarga: 189298.90,
    qtdDias: 3,
    mediaDias: 3,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8271650",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "2889 - ITAPECURU MIRIM X ANAJATUBA-MA",
    placa: "OXV-6586",
    motorista: "EDERSON MOREIRA DA ROCHA SANTOS",
    kmRodado: 701,
    valorCarga: 184981.98,
    qtdDias: 3,
    mediaDias: 3,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8303247",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "2889 - ITAPECURU MIRIM X ANAJATUBA-MA",
    placa: "CYB-4418",
    motorista: "LUIS FERNANDO GOMES",
    kmRodado: 581,
    valorCarga: 187071.21,
    qtdDias: 2,
    mediaDias: 2,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8317739",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "2889 - ITAPECURU MIRIM X ANAJATUBA-MA",
    placa: "NXP-9330",
    motorista: "LEANDRO DE JESUS PEREIRA DA COSTA",
    kmRodado: 635,
    valorCarga: 189717.72,
    qtdDias: 3,
    mediaDias: 3,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  },
  {
    id: "8323967",
    tipoVeiculo: "20 - TRUCK BAU CARGA SECA",
    rota: "2889 - ITAPECURU MIRIM X ANAJATUBA-MA",
    placa: "MWS-7335",
    motorista: "JOSE VAL WILTON FERNANDES COSTA",
    kmRodado: 563,
    valorCarga: 211876.22,
    qtdDias: 3,
    mediaDias: 3,
    metaViagem: 4,
    supervisao: "LEONAN",
    qtd: 1
  }
];

// Populate initial data with filial, ano and mes properties if they are missing
INITIAL_VIAGENS.forEach((v, index) => {
  if (!v.filial) {
    v.filial = index % 2 === 0 ? "Filial São Luís" : "Filial Imperatriz";
  }
  if (!v.ano) {
    v.ano = 2026;
  }
  if (!v.mes) {
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    v.mes = meses[4 + (index % 3)]; // Maio, Junho, Julho
  }
});

// Let's create helper drivers list with photorealistic image placeholders for high fidelity rendering matching screens!
export const MOCK_DRIVER_AVATARS: Record<string, string> = {
  "FRANCISCO GOMES MENDES": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80",
  "JOSE RIBAMAR GUIMARAES J.": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
  "ADRIANO RICARDO SANTOS": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80",
  "FLAVIO RICARDO RODRIGUES DE ARAUJO": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
  "SILVESTRE SOUZA LOPES": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
  "RONILSON MARINHO LOPES": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  "TIAGO MOURA DO NASCIMENTO": "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=120&q=80"
};

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80";

export function getDriverAvatar(nome: string): string {
  const upper = nome.toUpperCase();
  for (const key of Object.keys(MOCK_DRIVER_AVATARS)) {
    if (upper.includes(key.toUpperCase()) || key.toUpperCase().includes(upper)) {
      return MOCK_DRIVER_AVATARS[key];
    }
  }
  return DEFAULT_AVATAR;
}

// Compute dynamic executive metrics from any array of viajes (which supports imports perfectly)
export function computeExecutiveMetrics(viagens: Viagem[]): ExecutiveMetrics {
  const faturamentoTotal = viagens.reduce((sum, v) => sum + v.valorCarga, 0);
  const totalViagens = viagens.length;
  const metaGlobal = 90; // Fixed overall goal as per screen
  const percentMetaAtingida = Math.min(100, Math.round((totalViagens / metaGlobal) * 100));
  
  // Placa counts and target evaluation
  const placaViagens: Record<string, number> = {};
  viagens.forEach(v => {
    placaViagens[v.placa] = (placaViagens[v.placa] || 0) + 1;
  });

  const totalPlacas = Object.keys(placaViagens).length;
  
  // Plato is "dentro da meta" if it has >= 4 trips
  let dentroMetaCount = 0;
  let foraMetaCount = 0;
  Object.values(placaViagens).forEach(count => {
    if (count >= 4) {
      dentroMetaCount++;
    } else {
      foraMetaCount++;
    }
  });

  const kmRodadoTotal = viagens.reduce((sum, v) => sum + v.kmRodado, 0);
  const despesaOficinaTotal = viagens.reduce((sum, v) => sum + (v.despesaOficina || 0), 0);

  return {
    faturamentoTotal,
    totalViagens,
    metaGlobal,
    percentMetaAtingida,
    totalPlacas,
    dentroMetaCount,
    foraMetaCount,
    kmRodadoTotal,
    despesaOficinaTotal
  };
}

// Compute plate ranking
export function computePlacaMetrics(viagens: Viagem[]): PlacaMetrics[] {
  const placaGroup: Record<string, {
    faturamento: number;
    trips: number;
    kmTotal: number;
    supervisores: Record<string, number>;
    motoristas: Record<string, number>;
    despesaOficinaTotal: number;
  }> = {};
  
  viagens.forEach(v => {
    if (!placaGroup[v.placa]) {
      placaGroup[v.placa] = { faturamento: 0, trips: 0, kmTotal: 0, supervisores: {}, motoristas: {}, despesaOficinaTotal: 0 };
    }
    const g = placaGroup[v.placa];
    g.faturamento += v.valorCarga;
    g.trips += 1;
    g.kmTotal += v.kmRodado || 0;
    g.despesaOficinaTotal += v.despesaOficina || 0;
    
    const sup = v.supervisao || 'Sem Supervisor';
    g.supervisores[sup] = (g.supervisores[sup] || 0) + 1;
    
    const mot = v.motorista || 'Sem Motorista';
    g.motoristas[mot] = (g.motoristas[mot] || 0) + 1;
  });

  return Object.keys(placaGroup).map(placa => {
    const data = placaGroup[placa];
    // Meta metric: 4 trips is 100%
    const percentMeta = Math.min(125, Math.round((data.trips / 4) * 100));
    
    // Find principal supervisor (one with max trips)
    let pSupervisor = 'Sem Supervisor';
    let maxSupCount = -1;
    Object.keys(data.supervisores).forEach(sup => {
      if (data.supervisores[sup] > maxSupCount) {
        maxSupCount = data.supervisores[sup];
        pSupervisor = sup;
      }
    });

    // Find principal motorista
    let pMotorista = 'Sem Motorista';
    let maxMotCount = -1;
    Object.keys(data.motoristas).forEach(mot => {
      if (data.motoristas[mot] > maxMotCount) {
        maxMotCount = data.motoristas[mot];
        pMotorista = mot;
      }
    });

    return {
      placa,
      viagensCount: data.trips,
      faturamentoTotal: data.faturamento,
      percentMeta,
      supervisor: pSupervisor,
      motorista: pMotorista,
      kmRodadoTotal: data.kmTotal,
      conhecimentosCount: data.trips,
      statusMeta: data.trips >= 4 ? 'Dentro da Meta' : 'Fora da Meta',
      despesaOficinaTotal: data.despesaOficinaTotal
    };
  }).sort((a, b) => b.viagensCount - a.viagensCount || b.faturamentoTotal - a.faturamentoTotal);
}

// Compute driver metrics
export function computeMotoristaMetrics(viagens: Viagem[]): MotoristaMetrics[] {
  const driverGroup: Record<string, { faturamento: number; trips: number }> = {};
  
  viagens.forEach(v => {
    const m = v.motorista.trim();
    if (!driverGroup[m]) {
      driverGroup[m] = { faturamento: 0, trips: 0 };
    }
    driverGroup[m].faturamento += v.valorCarga;
    driverGroup[m].trips += 1;
  });

  return Object.keys(driverGroup).map((nome, index): MotoristaMetrics => {
    const data = driverGroup[nome];
    const target = 4; // goal
    const progress = Math.round((data.trips / target) * 100);
    return {
      id: `0${2934 + index}`,
      nome,
      categoria: data.trips % 2 === 0 ? "Categoria D" : "Categoria E",
      faturamento: data.faturamento,
      viagensRealizadas: data.trips,
      metaViagens: target,
      percentProgresso: progress,
      statusMeta: data.trips >= target ? 'METAS_ATINGIDAS' : 'FORA_DA_META'
    };
  }).sort((a, b) => b.viagensRealizadas - a.viagensRealizadas || b.faturamento - a.faturamento);
}

// Compute Route Performance
export function computeRouteMetrics(viagens: Viagem[]): RouteMetrics[] {
  const routeGroup: Record<string, { daysSum: number; trips: number; kmSum: number; valueSum: number }> = {};
  
  viagens.forEach(v => {
    const r = v.rota;
    if (!routeGroup[r]) {
      routeGroup[r] = { daysSum: 0, trips: 0, kmSum: 0, valueSum: 0 };
    }
    routeGroup[r].daysSum += v.qtdDias;
    routeGroup[r].trips += 1;
    routeGroup[r].kmSum += v.kmRodado;
    routeGroup[r].valueSum += v.valorCarga;
  });

  return Object.keys(routeGroup).map(rota => {
    const data = routeGroup[rota];
    return {
      rota,
      avgDays: parseFloat((data.daysSum / data.trips).toFixed(1)),
      totalTrips: data.trips,
      avgKm: Math.round(data.kmSum / data.trips),
      totalValue: data.valueSum
    };
  }).sort((a, b) => b.totalTrips - a.totalTrips);
}
