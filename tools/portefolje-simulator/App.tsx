import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  X,
  Plus,
  Minus,
  Settings2,
  ShieldCheck,
  Briefcase,
  Calendar,
  Wallet,
  Clock,
  SendHorizontal,
  History,
  Lock,
  Sparkles,
  Bot,
  MessageSquare,
  Loader2,
  Newspaper,
  ArrowRightLeft,
  TrendingUp,
  AlertCircle,
  CreditCard,
  Building,
  Users,
  Scissors
} from 'lucide-react';

const START_DATE = new Date(2010, 0, 1);
const TODAY_DATE = new Date();
const TOTAL_MAX_DAYS = Math.max(1, Math.floor((TODAY_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)));
const USD_DKK_RATE = 6.95;
const ASK_LEGAL_CAP = 174200; // 2026 ASK indskudsloft simuleret som fast ramme
const DEPOT_PROGRESSION_BASE_2026 = 79400; // Fast 2026 progressionsgrænse (27% op til 79.400 kr., 42% derefter)

// Progressionsgrænse i Danmark: 27% op til 79.400 kr. (158.800 kr. for gifte) og 42% derefter
export const getDanishTaxProgressionLimit = (_year, isMarried = false) => {
  return isMarried ? DEPOT_PROGRESSION_BASE_2026 * 2 : DEPOT_PROGRESSION_BASE_2026;
};

// Beregn dansk aktieindkomstskat (27% op til 79.400 kr., 42% over)
const calculateDanishShareTax = (taxableAmount, year, isMarried) => {
  if (taxableAmount <= 0) return 0;
  const limit = getDanishTaxProgressionLimit(year, isMarried);
  if (taxableAmount <= limit) {
    return taxableAmount * 0.27;
  }
  return limit * 0.27 + (taxableAmount - limit) * 0.42;
};

// Udspecificer skat i 27%-del og 42%-del til visning i brugerfladen
const getDanishShareTaxBreakdown = (taxableAmount, year, isMarried) => {
  const limit = getDanishTaxProgressionLimit(year, isMarried);
  if (taxableAmount <= 0) {
    return { limit, taxedAt27Base: 0, tax27Dkk: 0, taxedAt42Base: 0, tax42Dkk: 0, totalTaxDkk: 0 };
  }
  const taxedAt27Base = Math.min(taxableAmount, limit);
  const taxedAt42Base = Math.max(0, taxableAmount - limit);
  const tax27Dkk = taxedAt27Base * 0.27;
  const tax42Dkk = taxedAt42Base * 0.42;
  return {
    limit,
    taxedAt27Base,
    tax27Dkk,
    taxedAt42Base,
    tax42Dkk,
    totalTaxDkk: tax27Dkk + tax42Dkk
  };
};

// Historisk CPI inflationsfaktor for Danmark (2010 -> dags dato)
const getHistoricalInflationFactor = (dayIndex) => {
  const years = dayIndex / 365.25;
  if (years <= 0) return 1.0;
  if (years <= 11) {
    return Math.pow(1.015, years);
  } else if (years <= 14) {
    const baseTo2021 = Math.pow(1.015, 11);
    return baseTo2021 * Math.pow(1.06, years - 11);
  } else {
    const baseTo2024 = Math.pow(1.015, 11) * Math.pow(1.06, 3);
    return baseTo2024 * Math.pow(1.022, years - 14);
  }
};

// Udvidet instrumentliste med sondring mellem:
// - 'stock' (Enkeltaktie: Realisationsbeskattet på depot, 17% lagerskat på ASK)
// - 'etf' (Udenlandsk ETF på Skats positivliste: LAGERBESKATTET på BÅDE depot (27/42%) og ASK (17%))
// - 'dk_fund' (Dansk udbyttebetalende investeringsforening: REALISATIONSBESKATTET på depot, 17% lagerskat på ASK)
const INSTRUMENTS_DATA = [
  { id: 'GOOGL', name: 'Alphabet (Google)', type: 'stock', market: 'US', basePrice2010: 15.5, trend: 0.165, divYield: 0.005, profile: 'tech', ipoDate: '2004-08-19' },
  { id: 'AMZN', name: 'Amazon', type: 'stock', market: 'US', basePrice2010: 6.7, trend: 0.19, divYield: 0.0, profile: 'tech', ipoDate: '1997-05-15' },
  { id: 'AMBU', name: 'Ambu', type: 'stock', market: 'DK', basePrice2010: 16.0, trend: 0.07, divYield: 0.004, profile: 'boom_bust_2021', ipoDate: '1992-11-20' },
  { id: 'AAPL', name: 'Apple', type: 'stock', market: 'US', basePrice2010: 7.5, trend: 0.21, divYield: 0.006, profile: 'tech', ipoDate: '1980-12-12' },
  { id: 'ASML', name: 'ASML Holding', type: 'stock', market: 'US', basePrice2010: 32.0, trend: 0.205, divYield: 0.008, profile: 'tech', ipoDate: '1995-03-15' },
  { id: 'BAVA', name: 'Bavarian Nordic', type: 'stock', market: 'DK', basePrice2010: 95.0, trend: 0.04, divYield: 0.0, profile: 'volatile_bio', ipoDate: '1998-12-10' },
  { id: 'BKNG', name: 'Booking Holdings', type: 'stock', market: 'US', basePrice2010: 110.0, trend: 0.165, divYield: 0.008, profile: 'cyclical', ipoDate: '1999-04-01' },
  { id: 'CARL', name: 'Carlsberg B', type: 'stock', market: 'DK', basePrice2010: 380.0, trend: 0.05, divYield: 0.028, profile: 'defensive', ipoDate: '1970-01-01' },
  { id: 'COLO', name: 'Coloplast B', type: 'stock', market: 'DK', basePrice2010: 210.0, trend: 0.085, divYield: 0.022, profile: 'defensive', ipoDate: '1983-09-01' },
  { id: 'COST', name: 'Costco Wholesale', type: 'stock', market: 'US', basePrice2010: 59.0, trend: 0.14, divYield: 0.007, profile: 'defensive', ipoDate: '1985-12-05' },
  { id: 'DANSKE', name: 'Danske Bank', type: 'stock', market: 'DK', basePrice2010: 130.0, trend: 0.035, divYield: 0.055, profile: 'danske_bank', ipoDate: '1970-01-01' },
  { id: 'DKIGI', name: 'Danske Inv Global Indeks KL', type: 'dk_fund', market: 'DK', basePrice2010: 100.0, trend: 0.075, divYield: 0.042, profile: 'broad_index', ipoDate: '2000-01-01' },
  { id: 'DEMANT', name: 'Demant', type: 'stock', market: 'DK', basePrice2010: 88.0, trend: 0.075, divYield: 0.0, profile: 'cyclical', ipoDate: '1995-05-22' },
  { id: 'DSV', name: 'DSV', type: 'stock', market: 'DK', basePrice2010: 92.0, trend: 0.17, divYield: 0.005, profile: 'cyclical', ipoDate: '1987-04-29' },
  { id: 'GENMAB', name: 'Genmab', type: 'stock', market: 'DK', basePrice2010: 72.0, trend: 0.165, divYield: 0.0, profile: 'volatile_bio', ipoDate: '2000-10-24' },
  { id: 'INTC', name: 'Intel', type: 'stock', market: 'US', basePrice2010: 20.0, trend: 0.01, divYield: 0.025, profile: 'stagnant_2021_drop', ipoDate: '1971-10-13' },
  { id: 'SEMI', name: 'iShares Semiconductor ETF (Lager)', type: 'etf', market: 'US', basePrice2010: 28.0, trend: 0.175, divYield: 0.008, profile: 'tech', ipoDate: '2001-07-10' },
  { id: 'JYSK', name: 'Jyske Bank', type: 'stock', market: 'DK', basePrice2010: 190.0, trend: 0.06, divYield: 0.03, profile: 'danske_bank', ipoDate: '1970-01-01' },
  { id: 'META', name: 'Meta Platforms', type: 'stock', market: 'US', basePrice2010: 38.0, trend: 0.195, divYield: 0.004, profile: 'tech', ipoDate: '2012-05-18' },
  { id: 'MSFT', name: 'Microsoft', type: 'stock', market: 'US', basePrice2010: 30.5, trend: 0.17, divYield: 0.008, profile: 'tech', ipoDate: '1986-03-13' },
  { id: 'SSAC', name: 'iShares MSCI ACWI ETF (Lager)', type: 'etf', market: 'US', basePrice2010: 31.0, trend: 0.095, divYield: 0.0, profile: 'broad_index', ipoDate: '2011-10-21' },
  { id: 'MAERSK', name: 'Mærsk B', type: 'stock', market: 'DK', basePrice2010: 8200.0, trend: 0.025, divYield: 0.065, profile: 'freight_cycle', ipoDate: '1970-01-01' },
  { id: 'NFLX', name: 'Netflix', type: 'stock', market: 'US', basePrice2010: 7.8, trend: 0.22, divYield: 0.0, profile: 'tech', ipoDate: '2002-05-23' },
  { id: 'NKT', name: 'NKT', type: 'stock', market: 'DK', basePrice2010: 185.0, trend: 0.08, divYield: 0.0, profile: 'cyclical', ipoDate: '1970-01-01' },
  { id: 'NOVO', name: 'Novo Nordisk B', type: 'stock', market: 'DK', basePrice2010: 45.0, trend: 0.185, divYield: 0.015, profile: 'novo_curve', ipoDate: '1974-01-01' },
  { id: 'NZYM', name: 'Novonesis (Novozymes)', type: 'stock', market: 'DK', basePrice2010: 115.0, trend: 0.075, divYield: 0.016, profile: 'defensive', ipoDate: '2000-11-17' },
  { id: 'NVDA', name: 'Nvidia', type: 'stock', market: 'US', basePrice2010: 4.5, trend: 0.30, divYield: 0.001, profile: 'tech', ipoDate: '1999-01-22' },
  { id: 'PNDORA', name: 'Pandora', type: 'stock', market: 'DK', basePrice2010: 210.0, trend: 0.095, divYield: 0.028, profile: 'cyclical', ipoDate: '2010-10-05' },
  { id: 'QCOM', name: 'Qualcomm', type: 'stock', market: 'US', basePrice2010: 46.0, trend: 0.08, divYield: 0.022, profile: 'tech', ipoDate: '1991-12-09' },
  { id: 'QQQ', name: 'Invesco Nasdaq-100 ETF (Lager)', type: 'etf', market: 'US', basePrice2010: 46.0, trend: 0.145, divYield: 0.006, profile: 'tech', ipoDate: '1999-03-10' },
  { id: 'SPVIGAKL', name: 'Sparindex Globale Aktier KL', type: 'dk_fund', market: 'DK', basePrice2010: 100.0, trend: 0.072, divYield: 0.038, profile: 'broad_index', ipoDate: '2005-01-01' },
  { id: 'TSLA', name: 'Tesla', type: 'stock', market: 'US', basePrice2010: 1.6, trend: 0.25, divYield: 0.0, profile: 'boom_bust_2021', ipoDate: '2010-06-29' },
  { id: 'TRYG', name: 'Tryg', type: 'stock', market: 'DK', basePrice2010: 70.0, trend: 0.06, divYield: 0.045, profile: 'defensive', ipoDate: '2005-10-14' },
  { id: 'VWS', name: 'Vestas Wind Systems', type: 'stock', market: 'DK', basePrice2010: 65.0, trend: 0.06, divYield: 0.005, profile: 'boom_bust_2021', ipoDate: '1998-04-28' },
  { id: 'ORSTED', name: 'Ørsted', type: 'stock', market: 'DK', basePrice2010: 260.0, trend: 0.02, divYield: 0.02, profile: 'orsted_crash', ipoDate: '2016-06-09' }
];

const ALPHABETICAL_INSTRUMENTS = [...INSTRUMENTS_DATA].sort((a, b) =>
  a.name.localeCompare(b.name, 'da', { sensitivity: 'base' })
);

function getHistoricalMarketPrice(asset, dayIndex) {
  const clampedDay = Math.min(dayIndex, TOTAL_MAX_DAYS);
  const years = clampedDay / 365.25;

  // Overordnet markedscyklus (2010 -> 2026) med COVID-krak (2020.2) og rentechok (2022)
  let macroCycle = 1.0;
  if (years < 10.15) {
    macroCycle = 1.0 + Math.pow(years / 10.15, 1.15) * 1.4;
  } else if (years < 10.35) {
    // COVID-19 marts 2020 dyk
    macroCycle = 2.4 * 0.72;
  } else if (years < 11.9) {
    // 2020-2021 stimulus boom
    macroCycle = 1.73 + ((years - 10.35) / 1.55) * 1.45;
  } else if (years < 12.9) {
    // 2022 inflations- og rentekrak
    macroCycle = 3.18 * (1 - ((years - 11.9) / 1.0) * 0.25);
  } else {
    // 2023-2026 genopretning og AI-bølge
    const p = Math.min(1.0, (years - 12.9) / 3.8);
    macroCycle = 2.38 + p * 1.25;
  }

  // Virksomhedsspecifik profil så aktier IKKE har 100% korrelation og viser reelle krak (f.eks. Ørsted, Ambu, Danske Bank)
  let profileMultiplier = 1.0;
  if (asset.profile === 'orsted_crash') {
    // Ørsted: Stærk stigning frem til 2020/2021 (kurs ~1350), derefter kollaps på ~70% i 2022-2025
    if (years <= 11.0) {
      profileMultiplier = 1.0 + Math.max(0, (years - 6.4) / 4.6) * 2.1;
    } else {
      const crashProgress = Math.min(1, (years - 11.0) / 3.5);
      profileMultiplier = 3.1 * (1 - crashProgress * 0.74);
    }
  } else if (asset.profile === 'boom_bust_2021') {
    // Grønne/medtech vækstaktier (Ambu, Vestas, Tesla): Eksplosion i 2020-21, hård nedtur i 2022-24
    if (years >= 10.2 && years <= 11.8) {
      profileMultiplier = 1.0 + Math.sin(((years - 10.2) / 1.6) * Math.PI) * 1.35;
    } else if (years > 11.8) {
      profileMultiplier = 0.62 + 0.15 * Math.sin(years * 1.7);
    }
  } else if (asset.profile === 'danske_bank') {
    // Danske Bank: Nedtur i 2018-2020 (hvidvasksag), stærk comeback i 2023-2026 pga. højere renter
    if (years >= 8.0 && years <= 11.5) {
      profileMultiplier = 0.52;
    } else if (years > 12.5) {
      profileMultiplier = 1.18 + Math.min(0.6, (years - 12.5) * 0.18);
    }
  } else if (asset.profile === 'stagnant_2021_drop') {
    // Intel: Stagnation og fald efter 2021
    if (years > 11.5) {
      profileMultiplier = Math.max(0.38, 1.0 - (years - 11.5) * 0.15);
    }
  } else if (asset.profile === 'freight_cycle') {
    // Mærsk: Enorm fragtboble i 2021-2022, normalisering derefter
    if (years >= 10.8 && years <= 12.6) {
      profileMultiplier = 1.85;
    } else if (years > 12.6) {
      profileMultiplier = 0.95;
    }
  } else if (asset.profile === 'novo_curve') {
    // Novo Nordisk: Stærk vækst frem til medio 2024, efterfulgt af korrektion i 2024/2025
    if (years >= 12.0 && years <= 14.5) {
      profileMultiplier = 1.45;
    } else if (years > 14.5) {
      profileMultiplier = 1.05;
    }
  }

  const drift = Math.exp(asset.trend * years);
  const individualWave = 1.0 + 0.09 * Math.sin(years * 2.7 + asset.basePrice2010 * 0.17);
  const nativePrice = Math.max(0.5, asset.basePrice2010 * drift * (macroCycle * 0.55) * profileMultiplier * individualWave);
  const dkkPrice = asset.market === 'US' ? nativePrice * USD_DKK_RATE : nativePrice;

  return {
    nativePrice,
    dkkPrice,
    currency: asset.market === 'US' ? 'USD' : 'DKK'
  };
}

const InstrumentMiniChart = React.memo(({ asset, currentSimDayIndex, isAvailable }) => {
  if (!isAvailable) {
    return (
      <div className="w-[68px] h-7 rounded bg-slate-950/60 border border-slate-900 flex items-center justify-center shrink-0">
        <span className="text-[9px] text-slate-600 font-mono">Før IPO</span>
      </div>
    );
  }

  const ipoDateObj = new Date(asset.ipoDate);
  const ipoDay = Math.max(0, Math.floor((ipoDateObj.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)));
  const lookbackDays = 3652;
  const startDay = Math.max(ipoDay, currentSimDayIndex - lookbackDays);
  const pointsCount = 18;
  const step = Math.max(1, (currentSimDayIndex - startDay) / (pointsCount - 1));

  const prices = [];
  for (let i = 0; i < pointsCount; i++) {
    const d = Math.min(currentSimDayIndex, startDay + i * step);
    prices.push(getHistoricalMarketPrice(asset, d).nativePrice);
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 68;
  const h = 26;
  const pad = 2;

  const polyPoints = prices.map((p, idx) => {
    const x = pad + (idx / (prices.length - 1)) * (w - pad * 2);
    const y = h - pad - ((p - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const isUp = prices[prices.length - 1] >= prices[0];
  const strokeColor = isUp ? '#10b981' : '#f43f5e';
  const fillColor = isUp ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)';
  const areaPoints = `M ${polyPoints[0]} L ${polyPoints.join(' L ')} L ${w - pad},${h} L ${pad},${h} Z`;

  return (
    <div
      className="w-[68px] h-7 bg-slate-950/90 rounded border border-slate-800/80 p-0.5 overflow-hidden flex flex-col justify-end shrink-0 shadow-inner relative"
      title={`Op til 10 års kursudvikling (${isUp ? '+' : ''}${(((prices[prices.length - 1] - prices[0]) / prices[0]) * 100).toFixed(0)}%)`}
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <path d={areaPoints} fill={fillColor} />
        <path
          d={`M ${polyPoints.join(' L ')}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="absolute top-0.5 right-1 text-[8px] font-mono text-slate-500 leading-none pointer-events-none">
        10å
      </div>
    </div>
  );
});

async function callGeminiApi(prompt, systemPrompt = '') {
  const apiKey = '';
  if (!apiKey) {
    throw new Error('AI-funktionerne er endnu ikke tilsluttet på denne hjemmeside. Simulatoren kan bruges uden AI.');
  }
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    ...(systemPrompt ? { systemInstruction: { parts: [{ text: systemPrompt }] } } : {})
  };

  let delay = 1000;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0];
        if (candidate?.content?.parts?.[0]?.text) {
          return candidate.content.parts[0].text;
        }
      }
    } catch {
      // Retry with backoff
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    delay *= 2;
  }
  throw new Error('Kunne ikke hente svar fra AI efter flere forsøg.');
}

const PortfolioSparkline = React.memo(({ history, baseline = 100000, adjustInflation = false }) => {
  if (!history || history.length < 2) {
    return (
      <div className="h-24 w-full bg-slate-950/80 rounded-lg border border-slate-800/80 flex items-center justify-center text-[11px] text-slate-500 font-mono">
        Afventer simulering...
      </div>
    );
  }

  const values = history.map((d) => {
    if (!adjustInflation) return d.val;
    const infl = getHistoricalInflationFactor(d.day);
    return d.val / infl;
  });

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const marginY = Math.max((maxVal - minVal) * 0.1, 1500);
  const effectiveMin = Math.max(0, minVal - marginY);
  const effectiveMax = maxVal + marginY;
  const range = effectiveMax - effectiveMin || 1;

  const width = 340;
  const height = 90;
  const pad = 6;

  const points = values.map((val, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((val - effectiveMin) / range) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathStr = `M ${points.join(' L ')}`;
  const latest = values[values.length - 1];
  const isUp = latest >= baseline;
  const strokeColor = isUp ? '#10b981' : '#f43f5e';
  const fillColor = isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';
  const areaStr = `M ${points[0]} L ${points.join(' L ')} L ${width - pad},${height} L ${pad},${height} Z`;

  return (
    <div className="relative w-full h-24 bg-slate-950 rounded-lg border border-slate-800/90 p-1.5 overflow-hidden flex flex-col justify-end shadow-inner">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <path d={areaStr} fill={fillColor} />
        <path d={pathStr} fill="none" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="absolute top-1.5 left-2 flex items-center gap-1.5">
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
            isUp
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
              : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
          }`}
        >
          {baseline > 0 ? `${isUp ? '+' : ''}${(((latest - baseline) / baseline) * 100).toFixed(1)}%` : `${Math.round(latest).toLocaleString('da-DK')} kr`}
        </span>
      </div>
      <div className="absolute top-1.5 right-2 text-[10px] text-slate-400 font-mono">
        Maks: {Math.round(maxVal).toLocaleString('da-DK')} kr
      </div>
    </div>
  );
});

export default function App() {
  const [dayIndex, setDayIndex] = useState(0);
  const [jumpDateInput, setJumpDateInput] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [activeSettingsCol, setActiveSettingsCol] = useState(null);
  const [isInflationAdjusted, setIsInflationAdjusted] = useState(false);
  const [isMarried, setIsMarried] = useState(false); // Ægtefælle dobbelt progressionsgrænse (1x vs 2x)
  const [taxAuditLogs, setTaxAuditLogs] = useState([]);
  const [showTaxLogModal, setShowTaxLogModal] = useState(false);
  const [isCappedAtToday, setIsCappedAtToday] = useState(false);
  const [tradeMode, setTradeMode] = useState('DKK');
  const [statusToast, setStatusToast] = useState('');

  // Overførsel til ASK modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmountInput, setTransferAmountInput] = useState('');
  const [transferFeedback, setTransferFeedback] = useState({ error: '', success: '' });

  // Årlig Skattedialog modal ("Hvordan vil du betale skatten?")
  const [pendingTaxSettlement, setPendingTaxSettlement] = useState(null);

  // AI-modal state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiActiveTab, setAiActiveTab] = useState('portfolio');
  const [aiPortfolioAnalysis, setAiPortfolioAnalysis] = useState('');
  const [aiMacroReport, setAiMacroReport] = useState('');
  const [aiChatMessages, setAiChatMessages] = useState([]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const speedOptions = [
    { label: '1 dag/s', daysPerSec: 1 },
    { label: '7 dage/s', daysPerSec: 7 },
    { label: '1 mdr/s', daysPerSec: 30 },
    { label: '3 mdr/s', daysPerSec: 90 },
    { label: '6 mdr/s', daysPerSec: 182 }
  ];

  const [columns, setColumns] = useState([
    {
      id: 0,
      title: 'KOLONNE 1 (KUN DEPOT)',
      accountType: 'REGULAR',
      cash: 100000,
      brokerageDkk: 29,
      fxFeePct: 0.0015, // 0,15% valutaveksling på almindeligt depot
      holdings: {},
      draftOrders: {},
      yearRealizedGainDkk: 0,
      yearDividendsReceivedDkk: 0,
      taxLossCarryforwardDkk: 0,
      totalTaxPaidDkk: 0,
      totalDividendsDkk: 0,
      totalCommissionPaidDkk: 0,
      externalCashInjectedDkk: 0,
      history: [{ day: 0, val: 100000 }]
    },
    {
      id: 1,
      title: 'KOLONNE 2 (DEPOT - DEL A)',
      accountType: 'REGULAR',
      cash: 100000,
      brokerageDkk: 29,
      fxFeePct: 0.0015,
      holdings: {},
      draftOrders: {},
      yearRealizedGainDkk: 0,
      yearDividendsReceivedDkk: 0,
      taxLossCarryforwardDkk: 0,
      totalTaxPaidDkk: 0,
      totalDividendsDkk: 0,
      totalCommissionPaidDkk: 0,
      externalCashInjectedDkk: 0,
      history: [{ day: 0, val: 100000 }]
    },
    {
      id: 2,
      title: 'KOLONNE 3 (AKTIESPAREKONTO - DEL B)',
      accountType: 'ASK',
      cash: 0,
      brokerageDkk: 29,
      fxFeePct: 0.0025, // 0,25% lovpligtig DKK-veksling på ASK ved US-handel
      holdings: {},
      draftOrders: {},
      cumulativeNetDepositDkk: 0,
      askNavPrimoDkk: 0,
      askNegativeTaxCarryforwardDkk: 0,
      yearDividendsReceivedDkk: 0,
      totalTaxPaidDkk: 0,
      totalDividendsDkk: 0,
      totalCommissionPaidDkk: 0,
      externalCashInjectedDkk: 0,
      history: [{ day: 0, val: 0 }]
    }
  ]);

  const currentSimDate = useMemo(() => {
    const targetMs = START_DATE.getTime() + Math.floor(dayIndex) * 24 * 60 * 60 * 1000;
    const clampedMs = Math.min(targetMs, TODAY_DATE.getTime());
    return new Date(clampedMs);
  }, [dayIndex]);

  const currentDateISO = useMemo(() => {
    const y = currentSimDate.getFullYear();
    const m = String(currentSimDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentSimDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [currentSimDate]);

  const todayISO = useMemo(() => {
    const y = TODAY_DATE.getFullYear();
    const m = String(TODAY_DATE.getMonth() + 1).padStart(2, '0');
    const d = String(TODAY_DATE.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const currentDateFormatted = useMemo(() => {
    return currentSimDate.toLocaleDateString('da-DK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [currentSimDate]);

  const currentInflationFactor = useMemo(() => {
    return getHistoricalInflationFactor(dayIndex);
  }, [dayIndex]);

  const currentYear = useMemo(() => {
    return currentSimDate.getFullYear();
  }, [currentSimDate]);

  const currentProgressionLimit = useMemo(() => {
    return getDanishTaxProgressionLimit(currentYear, isMarried);
  }, [currentYear, isMarried]);

  const currentPrices = useMemo(() => {
    const curDay = Math.min(Math.floor(dayIndex), TOTAL_MAX_DAYS);
    const map = {};
    ALPHABETICAL_INSTRUMENTS.forEach((asset) => {
      map[asset.id] = getHistoricalMarketPrice(asset, curDay);
    });
    return map;
  }, [dayIndex]);

  const lastProcessedYearRef = useRef(2010);
  const lastHistorySnapshotRef = useRef(0);

  const computeColumnMetrics = useCallback((col) => {
    let currentStockValueDkk = 0;
    let shortLiabilityDkk = 0;
    let totalUnrealizedGainLossDkk = 0;
    let etfAnnualUnrealizedGainLossDkk = 0;
    let realisableStockUnrealizedGainLossDkk = 0;

    Object.entries(col.holdings).forEach(([sym, pos]) => {
      if (!pos || Math.abs(pos.shares) < 0.00001) return;
      const priceObj = currentPrices[sym];
      const assetMeta = INSTRUMENTS_DATA.find((a) => a.id === sym);
      if (!priceObj || !assetMeta) return;

      const priceDkk = priceObj.dkkPrice;
      const gakDkk = pos.gakDkk;

      if (pos.shares > 0) {
        const marketVal = pos.shares * priceDkk;
        const totalCost = pos.shares * gakDkk;
        currentStockValueDkk += marketVal;
        const ureal = marketVal - totalCost;
        totalUnrealizedGainLossDkk += ureal;

        if (assetMeta.type === 'etf') {
          etfAnnualUnrealizedGainLossDkk += ureal;
        } else {
          realisableStockUnrealizedGainLossDkk += ureal;
        }
      } else {
        const absShares = Math.abs(pos.shares);
        const currentLiability = absShares * priceDkk;
        const initialBorrowValue = absShares * gakDkk;
        shortLiabilityDkk += currentLiability;
        const ureal = initialBorrowValue - currentLiability;
        totalUnrealizedGainLossDkk += ureal;
        realisableStockUnrealizedGainLossDkk += ureal;
      }
    });

    const nominalNAV = col.cash + currentStockValueDkk - shortLiabilityDkk;

    let curYearOwedTaxDkk = 0;
    let latentTaxDkk = 0;
    let totalTaxIfLiquidatedTodayDkk = 0;
    let rawNetWealthAfterTaxDkk = nominalNAV;
    let liquidationTaxBreakdown = null;

    if (col.accountType === 'ASK') {
      const annualReturn = nominalNAV - col.askNavPrimoDkk;
      if (annualReturn > 0) {
        const grossTax = annualReturn * 0.17;
        const netOwed = Math.max(0, grossTax - (col.askNegativeTaxCarryforwardDkk || 0));
        curYearOwedTaxDkk = netOwed;
        totalTaxIfLiquidatedTodayDkk = netOwed;
      }
      rawNetWealthAfterTaxDkk = Math.max(0, nominalNAV - totalTaxIfLiquidatedTodayDkk);
    } else {
      const lossPool = col.taxLossCarryforwardDkk || 0;
      // På almindeligt depot beskattes: Realiseret gevinst + Udbytter + Lagerbeskattede ETF'ers årlige værdistigning
      const mandatoryAnnualIncome = (col.yearRealizedGainDkk || 0) + etfAnnualUnrealizedGainLossDkk;

      const taxableMandatory = Math.max(0, mandatoryAnnualIncome - lossPool);
      curYearOwedTaxDkk = calculateDanishShareTax(taxableMandatory, currentYear, isMarried);

      // Ved total likvidering i dag realiseres også enkeltaktier og danske fonde (27% op til 79.400 kr., 42% derefter)
      const totalYearGainAtFullLiquidation = (col.yearRealizedGainDkk || 0) + totalUnrealizedGainLossDkk;
      const totalTaxableAtFullLiquidation = Math.max(0, totalYearGainAtFullLiquidation - lossPool);
      liquidationTaxBreakdown = getDanishShareTaxBreakdown(totalTaxableAtFullLiquidation, currentYear, isMarried);
      totalTaxIfLiquidatedTodayDkk = liquidationTaxBreakdown.totalTaxDkk;

      latentTaxDkk = Math.max(0, totalTaxIfLiquidatedTodayDkk - curYearOwedTaxDkk);
      rawNetWealthAfterTaxDkk = Math.max(0, nominalNAV - totalTaxIfLiquidatedTodayDkk);
    }

    // VIGTIG BUGFIX (Fra Revisionsrapport Punkt 1A):
    // Hvis brugeren har indskudt ekstra penge fra sin private lønkonto til at betale ASK-skat,
    // trækkes dette eksterne tilskud fra "Selvfinansieret Rå Netto", så sammenligningen med Kolonne 1 er 100% fair!
    const externalInjected = col.externalCashInjectedDkk || 0;
    const selfFundedNetWealthAfterTaxDkk = rawNetWealthAfterTaxDkk - externalInjected;

    const deflator = isInflationAdjusted ? currentInflationFactor : 1.0;
    const rawNetRealDkk = rawNetWealthAfterTaxDkk / deflator;
    const selfFundedNetRealDkk = selfFundedNetWealthAfterTaxDkk / deflator;
    const nominalNavRealDkk = nominalNAV / deflator;
    const displayedCashDkk = col.cash / deflator;

    return {
      nominalNAV,
      nominalNavRealDkk,
      rawNetWealthAfterTaxDkk,
      rawNetRealDkk,
      selfFundedNetWealthAfterTaxDkk,
      selfFundedNetRealDkk,
      displayedCashDkk,
      currentStockValueDkk,
      shortLiabilityDkk,
      unrealizedGainLossDkk: totalUnrealizedGainLossDkk,
      etfAnnualUnrealizedGainLossDkk,
      realisableStockUnrealizedGainLossDkk,
      curYearOwedTaxDkk,
      latentTaxDkk,
      totalTaxIfLiquidatedTodayDkk,
      liquidationTaxBreakdown,
      totalTaxPaidDkk: col.totalTaxPaidDkk,
      totalDividendsDkk: col.totalDividendsDkk || 0,
      externalCashInjectedDkk: externalInjected
    };
  }, [currentPrices, isInflationAdjusted, currentInflationFactor, currentYear, isMarried]);

  // Samlet selvfinansieret nettoformue for Blanding (Kolonne 2 + Kolonne 3) fratrukket eksterne lønkonto-indskud
  const combinedStrategyNetWealth = useMemo(() => {
    const col2 = columns[1];
    const col3 = columns[2];
    if (!col2 || !col3) return 0;

    const m2 = computeColumnMetrics(col2);
    const m3 = computeColumnMetrics(col3);

    const totalSelfFundedNominal = m2.selfFundedNetWealthAfterTaxDkk + m3.selfFundedNetWealthAfterTaxDkk;
    const deflator = isInflationAdjusted ? currentInflationFactor : 1.0;
    return totalSelfFundedNominal / deflator;
  }, [columns, computeColumnMetrics, isInflationAdjusted, currentInflationFactor]);

  const col1NetWealth = useMemo(() => {
    const col1 = columns[0];
    if (!col1) return 0;
    const m1 = computeColumnMetrics(col1);
    return isInflationAdjusted ? m1.selfFundedNetRealDkk : m1.selfFundedNetWealthAfterTaxDkk;
  }, [columns, computeColumnMetrics, isInflationAdjusted]);

  const strategyDiffDkk = useMemo(() => {
    return combinedStrategyNetWealth - col1NetWealth;
  }, [combinedStrategyNetWealth, col1NetWealth]);

  const handleHarvest27PercentBracket = (colId) => {
    const col = columns.find((c) => c.id === colId);
    if (!col || col.accountType === 'ASK') return;

    const limit = getDanishTaxProgressionLimit(currentYear, isMarried);
    const lossPool = col.taxLossCarryforwardDkk || 0;

    // Hvor meget af årets 27%-grænse er allerede brugt (inkl. lagerbeskattede ETF'er)?
    const metrics = computeColumnMetrics(col);
    const alreadyUsedTaxable = Math.max(0, (col.yearRealizedGainDkk || 0) + metrics.etfAnnualUnrealizedGainLossDkk - lossPool);
    const remaining27Capacity = Math.max(0, limit - alreadyUsedTaxable);

    if (remaining27Capacity <= 100) {
      setStatusToast(`27%-grænsen (${formatDkk(limit)}) er allerede fuldt udnyttet i år på ${col.title}.`);
      setTimeout(() => setStatusToast(''), 4000);
      return;
    }

    // Find realisationsbeskattede positioner (aktier og danske fonde) med urealiseret gevinst
    let remainingToHarvest = remaining27Capacity;
    let totalHarvestedGain = 0;
    let totalCommission = 0;
    const nextHoldings = { ...col.holdings };

    Object.entries(nextHoldings).forEach(([sym, pos]) => {
      if (remainingToHarvest <= 0 || !pos || pos.shares <= 0) return;
      const assetMeta = INSTRUMENTS_DATA.find((a) => a.id === sym);
      if (!assetMeta || assetMeta.type === 'etf') return; // ETF'er er allerede lagerbeskattede

      const curPrice = currentPrices[sym]?.dkkPrice || 0;
      const gainPerShare = curPrice - pos.gakDkk;
      if (gainPerShare <= 0.01) return;

      const totalPosGain = pos.shares * gainPerShare;
      const gainToRealizeHere = Math.min(totalPosGain, remainingToHarvest);
      const fractionOfPosition = gainToRealizeHere / totalPosGain;

      // Ved "wash-sale / straks-genkøb" hæves GAK på den solgte og genkøbte del til dagskurs
      const newWeightedGak = pos.gakDkk + fractionOfPosition * (curPrice - pos.gakDkk);
      nextHoldings[sym] = {
        shares: pos.shares,
        gakDkk: parseFloat(newWeightedGak.toFixed(2))
      };

      remainingToHarvest -= gainToRealizeHere;
      totalHarvestedGain += gainToRealizeHere;
      totalCommission += col.brokerageDkk * 2; // Salg + genkøb kurtage
    });

    if (totalHarvestedGain <= 0) {
      setStatusToast('Ingen realisationsbeskattede aktier med urealiseret gevinst at høste.');
      setTimeout(() => setStatusToast(''), 4000);
      return;
    }

    setColumns((prev) =>
      prev.map((c) => {
        if (c.id !== colId) return c;
        return {
          ...c,
          cash: Math.max(0, c.cash - totalCommission),
          holdings: nextHoldings,
          yearRealizedGainDkk: (c.yearRealizedGainDkk || 0) + totalHarvestedGain,
          totalCommissionPaidDkk: c.totalCommissionPaidDkk + totalCommission
        };
      })
    );

    setStatusToast(`Høstede ${formatDkk(totalHarvestedGain)} i gevinst til 27% skat og hævede GAK på ${col.title}!`);
    setTimeout(() => setStatusToast(''), 4500);
  };

  const checkYearEndTax = useCallback((taxYear, latestPrices, currentColsState = columns) => {
    // 1. Beregn årlige udbytter (dividends) for alle 3 kolonner inden skatteopgørelse
    const colsWithDividends = currentColsState.map((col) => {
      let divTotalDkk = 0;
      Object.entries(col.holdings).forEach(([sym, pos]) => {
        if (!pos || pos.shares <= 0) return;
        const assetMeta = INSTRUMENTS_DATA.find((a) => a.id === sym);
        const priceDkk = latestPrices[sym]?.dkkPrice || 0;
        if (assetMeta && assetMeta.divYield > 0) {
          divTotalDkk += pos.shares * priceDkk * assetMeta.divYield;
        }
      });

      if (col.accountType === 'ASK') {
        return {
          ...col,
          cash: col.cash + divTotalDkk,
          yearDividendsReceivedDkk: divTotalDkk,
          totalDividendsDkk: (col.totalDividendsDkk || 0) + divTotalDkk
        };
      } else {
        return {
          ...col,
          cash: col.cash + divTotalDkk,
          yearRealizedGainDkk: (col.yearRealizedGainDkk || 0) + divTotalDkk,
          yearDividendsReceivedDkk: divTotalDkk,
          totalDividendsDkk: (col.totalDividendsDkk || 0) + divTotalDkk
        };
      }
    });

    const askCol = colsWithDividends[2];
    let stockVal = 0;
    Object.entries(askCol.holdings).forEach(([sym, pos]) => {
      if (!pos || pos.shares <= 0) return;
      const p = latestPrices[sym]?.dkkPrice || 0;
      stockVal += pos.shares * p;
    });

    const navUltimo = askCol.cash + stockVal;
    const annualReturnDkk = navUltimo - askCol.askNavPrimoDkk;

    let askTaxDue = 0;
    let newAskNegativeTaxPool = askCol.askNegativeTaxCarryforwardDkk || 0;

    // BUGFIX 1B & 1C: Korrekt håndtering af både positiv og negativ lagerskat på ASK!
    if (annualReturnDkk > 0) {
      const grossTax = annualReturnDkk * 0.17;
      if (newAskNegativeTaxPool >= grossTax) {
        newAskNegativeTaxPool -= grossTax;
        askTaxDue = 0;
      } else {
        askTaxDue = grossTax - newAskNegativeTaxPool;
        newAskNegativeTaxPool = 0;
      }
    } else if (annualReturnDkk < 0) {
      // Negativt afkast giver 17% skattefradrag til fremførsel i kommende år
      newAskNegativeTaxPool += Math.abs(annualReturnDkk) * 0.17;
      askTaxDue = 0;
    }

    // 2. Opgør skat for aktiedepoterne (Kolonne 1 & 2) inkl. lagerbeskatning af ETF'er!
    const depotCols = [colsWithDividends[0], colsWithDividends[1]].map((col) => {
      let etfUnrealizedGainDkk = 0;
      const updatedDepotHoldings = { ...col.holdings };

      Object.entries(updatedDepotHoldings).forEach(([sym, pos]) => {
        if (!pos || pos.shares <= 0) return;
        const assetMeta = INSTRUMENTS_DATA.find((a) => a.id === sym);
        if (assetMeta && assetMeta.type === 'etf') {
          const ultimoPrice = latestPrices[sym]?.dkkPrice || pos.gakDkk;
          etfUnrealizedGainDkk += (ultimoPrice - pos.gakDkk) * pos.shares;
          // Lagerbeskatning: ETF'ens GAK nulstilles til ultimo-kursen ved årsskiftet
          updatedDepotHoldings[sym] = {
            ...pos,
            gakDkk: parseFloat(ultimoPrice.toFixed(2))
          };
        }
      });

      const netRealizedAndEtf = (col.yearRealizedGainDkk || 0) + etfUnrealizedGainDkk;
      let tax = 0;
      let newLoss = col.taxLossCarryforwardDkk || 0;

      if (netRealizedAndEtf > 0) {
        let taxable = netRealizedAndEtf;
        if (newLoss >= taxable) {
          newLoss -= taxable;
          taxable = 0;
        } else {
          taxable -= newLoss;
          newLoss = 0;
        }
        tax = calculateDanishShareTax(taxable, taxYear, isMarried);
      } else if (netRealizedAndEtf < 0) {
        newLoss += Math.abs(netRealizedAndEtf);
      }

      return {
        colId: col.id,
        tax,
        newLoss,
        netRealized: netRealizedAndEtf,
        dividendsDkk: col.yearDividendsReceivedDkk || 0,
        updatedDepotHoldings,
        cashWithDividends: col.cash,
        totalDividendsDkk: col.totalDividendsDkk
      };
    });

    const askCashShortfall = Math.max(0, askTaxDue - askCol.cash);

    if (askTaxDue > 0 && askCashShortfall > 1) {
      setIsPlaying(false);
      setPendingTaxSettlement({
        year: taxYear,
        askTaxDue: Math.round(askTaxDue),
        askAvailableCash: Math.round(askCol.cash),
        askShortfall: Math.round(askCashShortfall),
        annualReturnDkk: Math.round(annualReturnDkk),
        askDividendsDkk: Math.round(askCol.yearDividendsReceivedDkk || 0),
        newAskNegativeTaxPool,
        col2CashAvailable: Math.round(depotCols[1].cashWithDividends - depotCols[1].tax),
        depotCols,
        latestPrices
      });
      return true;
    } else {
      finalizeTaxSettlement({
        year: taxYear,
        askTaxMethod: 'ACCOUNT_CASH',
        askTaxDue,
        annualReturnDkk,
        askDividendsDkk: askCol.yearDividendsReceivedDkk || 0,
        newAskNegativeTaxPool,
        latestPrices,
        depotCols
      });
      return false;
    }
  }, [columns, isMarried]);

  const finalizeTaxSettlement = useCallback(({
    year,
    askTaxMethod,
    askTaxDue,
    annualReturnDkk = 0,
    askDividendsDkk = 0,
    newAskNegativeTaxPool = 0,
    latestPrices,
    depotCols
  }) => {
    const logs = [];

    setColumns((prevCols) => {
      const askCol = prevCols[2];
      const askCashWithDiv = askCol.cash + askDividendsDkk;
      let updatedCash = askCashWithDiv;
      let updatedExternalInjected = askCol.externalCashInjectedDkk || 0;
      let updatedHoldings = { ...askCol.holdings };
      let updatedCommission = askCol.totalCommissionPaidDkk;
      const askShortfall = Math.max(0, askTaxDue - askCashWithDiv);

      if (askTaxDue > 0) {
        if (askTaxMethod === 'SALARY' || askTaxMethod === 'SALARY_MATCHED') {
          updatedExternalInjected += askShortfall;
          updatedCash = 0;
        } else if (askTaxMethod === 'COL2_CASH') {
          updatedCash = 0;
        } else if (askTaxMethod === 'SELL_SHARES') {
          let remainingToCover = askShortfall + askCol.brokerageDkk;
          updatedCommission += askCol.brokerageDkk;

          const activeHoldings = Object.entries(updatedHoldings).filter(([, p]) => p && p.shares > 0);
          const totalStockVal = activeHoldings.reduce((sum, [sym, p]) => {
            return sum + p.shares * (latestPrices[sym]?.dkkPrice || 1);
          }, 0);

          if (totalStockVal > 0) {
            activeHoldings.forEach(([sym, p]) => {
              const curPrice = latestPrices[sym]?.dkkPrice || 1;
              const weight = (p.shares * curPrice) / totalStockVal;
              const sellAmountDkk = Math.min(p.shares * curPrice, remainingToCover * weight);
              const sharesToSell = sellAmountDkk / curPrice;

              const remainingShares = p.shares - sharesToSell;
              if (remainingShares < 0.0001) {
                delete updatedHoldings[sym];
              } else {
                updatedHoldings[sym] = {
                  shares: parseFloat(remainingShares.toFixed(4)),
                  gakDkk: p.gakDkk
                };
              }
            });
          }
          updatedCash = 0;
        } else {
          updatedCash = Math.max(0, askCashWithDiv - askTaxDue);
        }
      }

      let stockValAfter = 0;
      Object.entries(updatedHoldings).forEach(([sym, p]) => {
        if (!p || p.shares <= 0) return;
        stockValAfter += p.shares * (latestPrices[sym]?.dkkPrice || 0);
      });
      const navUltimoAfter = updatedCash + stockValAfter;

      logs.push({
        year,
        colTitle: 'Kolonne 3 (ASK)',
        type: `ASK 17% (${
          askTaxMethod === 'SALARY_MATCHED'
            ? 'Lønkonto + Match i Kol. 1'
            : askTaxMethod === 'SALARY'
            ? 'Lønkonto'
            : askTaxMethod === 'SELL_SHARES'
            ? 'Tvangssalg'
            : 'Kontant'
        })`,
        returnDkk: Math.round(annualReturnDkk),
        taxPaidDkk: Math.round(askTaxDue),
        poolInfo: `Neg. skat fremført: ${Math.round(newAskNegativeTaxPool)} kr. | Udbytte: ${Math.round(askDividendsDkk)} kr.`,
        cashAfter: Math.round(updatedCash)
      });

      const updatedAsk = {
        ...askCol,
        cash: updatedCash,
        holdings: updatedHoldings,
        externalCashInjectedDkk: updatedExternalInjected,
        totalTaxPaidDkk: askCol.totalTaxPaidDkk + askTaxDue,
        totalDividendsDkk: (askCol.totalDividendsDkk || 0) + askDividendsDkk,
        totalCommissionPaidDkk: updatedCommission,
        askNavPrimoDkk: navUltimoAfter,
        askNegativeTaxCarryforwardDkk: newAskNegativeTaxPool,
        yearDividendsReceivedDkk: 0
      };

      const updatedCols = prevCols.map((c) => {
        if (c.id === 2) return updatedAsk;

        const info = depotCols.find((d) => d.colId === c.id);
        const taxPaid = info ? info.tax : 0;
        let cCash = (info ? info.cashWithDividends : c.cash) - taxPaid;
        let cExternalInjected = c.externalCashInjectedDkk || 0;

        if (c.id === 1 && askTaxMethod === 'COL2_CASH') {
          cCash -= askShortfall;
        }

        // Hvis brugeren valgte at tilføre samme lønkonto-beløb til Kolonne 1, så begge strategier har fået præcis samme indskud
        if (c.id === 0 && askTaxMethod === 'SALARY_MATCHED') {
          cCash += askShortfall;
          cExternalInjected += askShortfall;
        }

        logs.push({
          year,
          colTitle: c.title,
          type: `Depot (27/42% - Grænse: ${getDanishTaxProgressionLimit(year, isMarried).toLocaleString('da-DK')} kr)`,
          returnDkk: Math.round(info ? info.netRealized : 0),
          taxPaidDkk: Math.round(taxPaid),
          poolInfo: `Fremført tab: ${Math.round(info ? info.newLoss : 0)} kr | Udbytte: ${Math.round(info ? info.dividendsDkk : 0)} kr`,
          cashAfter: Math.round(cCash)
        });

        return {
          ...c,
          cash: cCash,
          holdings: info ? info.updatedDepotHoldings : c.holdings,
          totalTaxPaidDkk: c.totalTaxPaidDkk + taxPaid,
          totalDividendsDkk: info ? info.totalDividendsDkk : c.totalDividendsDkk,
          externalCashInjectedDkk: cExternalInjected,
          yearRealizedGainDkk: 0,
          yearDividendsReceivedDkk: 0,
          taxLossCarryforwardDkk: info ? info.newLoss : 0
        };
      });

      return updatedCols;
    });

    setTaxAuditLogs((prev) => [...logs, ...prev].slice(0, 60));
    setPendingTaxSettlement(null);
  }, [isMarried]);

  useEffect(() => {
    if (!isPlaying || pendingTaxSettlement) return;

    const frameRateMs = 50;
    const daysPerSec = speedOptions[speedIndex].daysPerSec;
    const deltaDays = daysPerSec * (frameRateMs / 1000);

    const interval = setInterval(() => {
      setDayIndex((prev) => {
        const next = prev + deltaDays;

        if (next >= TOTAL_MAX_DAYS) {
          setIsPlaying(false);
          setIsCappedAtToday(true);
          return TOTAL_MAX_DAYS;
        }

        const oldYear = new Date(2010, 0, 1 + Math.floor(prev)).getFullYear();
        const newYear = new Date(2010, 0, 1 + Math.floor(next)).getFullYear();

        if (newYear > oldYear && oldYear >= lastProcessedYearRef.current) {
          lastProcessedYearRef.current = newYear;
          const stoppedForTax = checkYearEndTax(oldYear, currentPrices);
          if (stoppedForTax) {
            return Math.floor((new Date(newYear, 0, 1).getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24));
          }
        }

        return next;
      });
    }, frameRateMs);

    return () => clearInterval(interval);
  }, [isPlaying, speedIndex, currentPrices, checkYearEndTax, pendingTaxSettlement]);

  useEffect(() => {
    if (dayIndex - lastHistorySnapshotRef.current >= 15 || dayIndex === 0) {
      lastHistorySnapshotRef.current = dayIndex;
      setColumns((prevCols) =>
        prevCols.map((c) => {
          const m = computeColumnMetrics(c);
          const nextHist = [...(c.history || [])];
          if (nextHist.length > 80) nextHist.shift();
          nextHist.push({ day: Math.floor(dayIndex), val: Math.round(m.selfFundedNetWealthAfterTaxDkk) });
          return { ...c, history: nextHist };
        })
      );
    }
  }, [dayIndex, computeColumnMetrics]);

  // BUGFIX 1D: "Hop frem i tid" stopper ved første årsskifte, der kræver skattevalg på ASK
  const handleJumpToDate = (targetDateString) => {
    if (!targetDateString || pendingTaxSettlement) return;
    const target = new Date(targetDateString);
    if (isNaN(target.getTime())) return;
    if (target.getTime() <= currentSimDate.getTime()) return;

    const clampedTargetMs = Math.min(target.getTime(), TODAY_DATE.getTime());
    const targetDays = Math.max(0, Math.floor((clampedTargetMs - START_DATE.getTime()) / (1000 * 60 * 60 * 24)));

    setIsPlaying(false);
    const startYear = currentSimDate.getFullYear();
    const endYear = new Date(clampedTargetMs).getFullYear();

    for (let yr = startYear; yr < endYear; yr++) {
      if (yr >= lastProcessedYearRef.current) {
        lastProcessedYearRef.current = yr + 1;
        const yearEndDay = Math.floor((new Date(yr, 11, 31).getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24));
        const yearEndPrices = {};
        ALPHABETICAL_INSTRUMENTS.forEach((asset) => {
          yearEndPrices[asset.id] = getHistoricalMarketPrice(asset, yearEndDay);
        });
        const pausedForUserDecision = checkYearEndTax(yr, yearEndPrices);
        if (pausedForUserDecision) {
          // Stop ved 1. januar i det nye år, så brugeren kan træffe sit skattevalg først
          const jan1Day = Math.floor((new Date(yr + 1, 0, 1).getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24));
          setDayIndex(jan1Day);
          return;
        }
      }
    }

    setDayIndex(targetDays);
    if (clampedTargetMs >= TODAY_DATE.getTime()) {
      setIsCappedAtToday(true);
    }
  };

  const askCapRemaining = useMemo(() => {
    const askCol = columns[2];
    const askNAV = computeColumnMetrics(askCol).nominalNAV;
    const maxPossibleTransfer = Math.max(0, ASK_LEGAL_CAP - askNAV);
    const col2AvailableCash = Math.max(0, columns[1].cash);
    return Math.min(maxPossibleTransfer, col2AvailableCash);
  }, [columns, computeColumnMetrics]);

  const handleExecuteTransfer = (e) => {
    e?.preventDefault();
    setTransferFeedback({ error: '', success: '' });

    const amount = parseFloat(transferAmountInput);
    if (!amount || isNaN(amount) || amount <= 0) {
      setTransferFeedback({ error: 'Indtast venligst et gyldigt beløb større end 0 kr.', success: '' });
      return;
    }

    const col2Cash = columns[1].cash;
    if (amount > col2Cash) {
      setTransferFeedback({ error: `Du har kun ${formatDkk(col2Cash)} i frie kontanter på Kolonne 2. Likvidér evt. aktier først.`, success: '' });
      return;
    }

    const askNAV = computeColumnMetrics(columns[2]).nominalNAV;
    const remainingLegal = ASK_LEGAL_CAP - askNAV;

    if (amount > remainingLegal) {
      setTransferFeedback({
        error: `Overførslen overskrider indskudsloftet på ${formatDkk(ASK_LEGAL_CAP)}. Du må højst overføre ${formatDkk(remainingLegal)}.`,
        success: ''
      });
      return;
    }

    setColumns((prev) =>
      prev.map((c) => {
        if (c.id === 1) {
          return { ...c, cash: c.cash - amount };
        }
        if (c.id === 2) {
          return {
            ...c,
            cash: c.cash + amount,
            askNavPrimoDkk: c.askNavPrimoDkk + amount,
            cumulativeNetDepositDkk: (c.cumulativeNetDepositDkk || 0) + amount
          };
        }
        return c;
      })
    );

    setTransferFeedback({
      error: '',
      success: `Overførte ${formatDkk(amount)} fra Kolonne 2 (Depot) til Kolonne 3 (ASK).`
    });
    setTransferAmountInput('');
  };

  const adjustDraftOrder = (colId, assetId, delta) => {
    setColumns((prevCols) =>
      prevCols.map((col) => {
        if (col.id !== colId) return col;
        const curDraft = parseFloat(col.draftOrders[assetId]) || 0;
        const newDraft = curDraft + delta;
        const nextDrafts = { ...col.draftOrders };
        if (Math.abs(newDraft) < 0.00001) {
          delete nextDrafts[assetId];
        } else {
          nextDrafts[assetId] = tradeMode === 'DKK' ? Math.round(newDraft) : parseFloat(newDraft.toFixed(2));
        }
        return { ...col, draftOrders: nextDrafts };
      })
    );
  };

  const handleDraftInputChange = (colId, assetId, rawValue) => {
    setColumns((prevCols) =>
      prevCols.map((col) => {
        if (col.id !== colId) return col;
        const nextDrafts = { ...col.draftOrders };
        const cleanVal = rawValue.replace(/[^0-9.-]/g, '');
        nextDrafts[assetId] = cleanVal;
        return { ...col, draftOrders: nextDrafts };
      })
    );
  };

  const handleDraftInputBlur = (colId, assetId) => {
    setColumns((prevCols) =>
      prevCols.map((col) => {
        if (col.id !== colId) return col;
        const val = parseFloat(col.draftOrders[assetId]);
        const nextDrafts = { ...col.draftOrders };
        if (isNaN(val) || Math.abs(val) < 0.00001) {
          delete nextDrafts[assetId];
        } else {
          nextDrafts[assetId] = tradeMode === 'DKK' ? Math.round(val) : parseFloat(val.toFixed(2));
        }
        return { ...col, draftOrders: nextDrafts };
      })
    );
  };

  const cancelDraftOrder = (colId, assetId) => {
    setColumns((prevCols) =>
      prevCols.map((col) => {
        if (col.id !== colId) return col;
        const nextDrafts = { ...col.draftOrders };
        delete nextDrafts[assetId];
        return { ...col, draftOrders: nextDrafts };
      })
    );
  };

  const executeDraftOrder = (colId, assetId) => {
    const col = columns.find((c) => c.id === colId);
    if (!col) return;
    const rawDraft = col.draftOrders[assetId];
    const draftVal = parseFloat(rawDraft);
    if (!draftVal || isNaN(draftVal) || Math.abs(draftVal) < 0.00001) return;

    const priceObj = currentPrices[assetId];
    const assetMeta = INSTRUMENTS_DATA.find((a) => a.id === assetId);
    if (!priceObj || !assetMeta) return;

    const priceDkk = priceObj.dkkPrice;
    const brokerage = col.brokerageDkk;
    const existingHolding = col.holdings[assetId] || { shares: 0, gakDkk: 0 };
    const curShares = existingHolding.shares;

    let draftAmountDkk = 0;
    let sharesDelta = 0;

    if (tradeMode === 'DKK') {
      draftAmountDkk = draftVal;
      sharesDelta = draftAmountDkk / priceDkk;
    } else {
      sharesDelta = draftVal;
      draftAmountDkk = sharesDelta * priceDkk;
    }

    // Valutavekslingsgebyr (FX fee) ved handel i USD (0,25% på ASK, 0,15% på Depot)
    const fxFeeDkk = assetMeta.market === 'US' ? Math.abs(draftAmountDkk) * (col.fxFeePct || 0.0015) : 0;
    const totalTransactionFee = brokerage + fxFeeDkk;

    if (draftAmountDkk > 0) {
      const totalCost = draftAmountDkk + totalTransactionFee;
      if (col.cash < totalCost) return;

      const boughtShares = sharesDelta;
      let newShares = curShares + boughtShares;
      let newRealizedGain = col.yearRealizedGainDkk;
      let newGakDkk = existingHolding.gakDkk;

      if (curShares < -0.0001) {
        const coveredShares = Math.min(Math.abs(curShares), boughtShares);
        newRealizedGain += (existingHolding.gakDkk - priceDkk) * coveredShares;
        if (newShares > 0.0001) newGakDkk = priceDkk;
      } else {
        const prevTotalInvested = Math.max(0, curShares) * existingHolding.gakDkk;
        newGakDkk = (prevTotalInvested + draftAmountDkk) / newShares;
      }

      setColumns((prevCols) =>
        prevCols.map((c) => {
          if (c.id !== colId) return c;
          const nextHoldings = { ...c.holdings };
          if (Math.abs(newShares) < 0.0001) delete nextHoldings[assetId];
          else {
            nextHoldings[assetId] = {
              shares: parseFloat(newShares.toFixed(4)),
              gakDkk: parseFloat(newGakDkk.toFixed(2))
            };
          }
          const nextDrafts = { ...c.draftOrders };
          delete nextDrafts[assetId];

          return {
            ...c,
            cash: c.cash - totalCost,
            yearRealizedGainDkk: newRealizedGain,
            totalCommissionPaidDkk: c.totalCommissionPaidDkk + totalTransactionFee,
            holdings: nextHoldings,
            draftOrders: nextDrafts
          };
        })
      );
    } else {
      const absAmountDkk = Math.abs(draftAmountDkk);
      const soldShares = Math.abs(sharesDelta);

      if (col.accountType === 'ASK' && soldShares > curShares + 0.0001) {
        return; // Shorting forbudt på ASK
      }

      let newShares = curShares - soldShares;
      let newRealizedGain = col.yearRealizedGainDkk;
      let newGakDkk = existingHolding.gakDkk;

      if (curShares > 0.0001) {
        const soldPortion = Math.min(curShares, soldShares);
        newRealizedGain += (priceDkk - existingHolding.gakDkk) * soldPortion;
        if (newShares < -0.0001) newGakDkk = priceDkk;
      } else {
        const prevShortVal = Math.abs(curShares) * existingHolding.gakDkk;
        newGakDkk = (prevShortVal + absAmountDkk) / Math.abs(newShares);
      }

      const cashInflow = absAmountDkk - totalTransactionFee;

      setColumns((prevCols) =>
        prevCols.map((c) => {
          if (c.id !== colId) return c;
          const nextHoldings = { ...c.holdings };
          if (Math.abs(newShares) < 0.0001) delete nextHoldings[assetId];
          else {
            nextHoldings[assetId] = {
              shares: parseFloat(newShares.toFixed(4)),
              gakDkk: parseFloat(newGakDkk.toFixed(2))
            };
          }
          const nextDrafts = { ...c.draftOrders };
          delete nextDrafts[assetId];

          return {
            ...c,
            cash: c.cash + cashInflow,
            yearRealizedGainDkk: newRealizedGain,
            totalCommissionPaidDkk: c.totalCommissionPaidDkk + totalTransactionFee,
            holdings: nextHoldings,
            draftOrders: nextDrafts
          };
        })
      );
    }
  };

  const executeAllColumnDrafts = (colId) => {
    const col = columns.find((c) => c.id === colId);
    if (!col) return;
    const assetIds = Object.keys(col.draftOrders);
    assetIds.forEach((sym) => {
      executeDraftOrder(colId, sym);
    });
  };

  const executeLiquidateHolding = (colId, assetId) => {
    const col = columns.find((c) => c.id === colId);
    if (!col) return;
    const pos = col.holdings[assetId];
    if (!pos || Math.abs(pos.shares) < 0.0001) return;

    const priceObj = currentPrices[assetId];
    const assetMeta = INSTRUMENTS_DATA.find((a) => a.id === assetId);
    if (!priceObj || !assetMeta) return;
    const priceDkk = priceObj.dkkPrice;
    const curShares = pos.shares;
    const gakDkk = pos.gakDkk;

    const tradeValDkk = Math.abs(curShares) * priceDkk;
    const fxFeeDkk = assetMeta.market === 'US' ? tradeValDkk * (col.fxFeePct || 0.0015) : 0;
    const totalFee = col.brokerageDkk + fxFeeDkk;

    let newRealizedGain = col.yearRealizedGainDkk;
    let cashDelta = 0;

    if (curShares > 0) {
      newRealizedGain += (priceDkk - gakDkk) * curShares;
      cashDelta = tradeValDkk - totalFee;
    } else if (curShares < -0.0001) {
      const absShares = Math.abs(curShares);
      newRealizedGain += (gakDkk - priceDkk) * absShares;
      cashDelta = -tradeValDkk - totalFee;
      if (col.cash + cashDelta < 0) return;
    } else {
      return;
    }

    setColumns((prevCols) =>
      prevCols.map((c) => {
        if (c.id !== colId) return c;
        const nextHoldings = { ...c.holdings };
        delete nextHoldings[assetId];
        const nextDrafts = { ...c.draftOrders };
        delete nextDrafts[assetId];

        return {
          ...c,
          cash: c.cash + cashDelta,
          yearRealizedGainDkk: newRealizedGain,
          totalCommissionPaidDkk: c.totalCommissionPaidDkk + totalFee,
          holdings: nextHoldings,
          draftOrders: nextDrafts
        };
      })
    );
  };

  const handleReset = () => {
    setIsPlaying(false);
    setIsCappedAtToday(false);
    setDayIndex(0);
    setJumpDateInput('');
    setPendingTaxSettlement(null);
    lastProcessedYearRef.current = 2010;
    lastHistorySnapshotRef.current = 0;
    setTaxAuditLogs([]);
    setColumns([
      {
        id: 0,
        title: 'KOLONNE 1 (KUN DEPOT)',
        accountType: 'REGULAR',
        cash: 100000,
        brokerageDkk: 29,
        fxFeePct: 0.0015,
        holdings: {},
        draftOrders: {},
        yearRealizedGainDkk: 0,
        yearDividendsReceivedDkk: 0,
        taxLossCarryforwardDkk: 0,
        totalTaxPaidDkk: 0,
        totalDividendsDkk: 0,
        totalCommissionPaidDkk: 0,
        externalCashInjectedDkk: 0,
        history: [{ day: 0, val: 100000 }]
      },
      {
        id: 1,
        title: 'KOLONNE 2 (DEPOT - DEL A)',
        accountType: 'REGULAR',
        cash: 100000,
        brokerageDkk: 29,
        fxFeePct: 0.0015,
        holdings: {},
        draftOrders: {},
        yearRealizedGainDkk: 0,
        yearDividendsReceivedDkk: 0,
        taxLossCarryforwardDkk: 0,
        totalTaxPaidDkk: 0,
        totalDividendsDkk: 0,
        totalCommissionPaidDkk: 0,
        externalCashInjectedDkk: 0,
        history: [{ day: 0, val: 100000 }]
      },
      {
        id: 2,
        title: 'KOLONNE 3 (AKTIESPAREKONTO - DEL B)',
        accountType: 'ASK',
        cash: 0,
        brokerageDkk: 29,
        fxFeePct: 0.0025,
        holdings: {},
        draftOrders: {},
        cumulativeNetDepositDkk: 0,
        askNavPrimoDkk: 0,
        askNegativeTaxCarryforwardDkk: 0,
        yearDividendsReceivedDkk: 0,
        totalTaxPaidDkk: 0,
        totalDividendsDkk: 0,
        totalCommissionPaidDkk: 0,
        externalCashInjectedDkk: 0,
        history: [{ day: 0, val: 0 }]
      }
    ]);
  };

  const formatDkk = (val) => {
    return Math.round(val || 0).toLocaleString('da-DK') + ' kr.';
  };

  const buildPortfolioContextSummary = useCallback(() => {
    const summary = columns.map((col) => {
      const metrics = computeColumnMetrics(col);
      const holdingsList = Object.entries(col.holdings)
        .filter(([, pos]) => pos && Math.abs(pos.shares) > 0.001)
        .map(([sym, pos]) => {
          const p = currentPrices[sym]?.dkkPrice || 0;
          const val = Math.round(pos.shares * p);
          return `${sym}: ${pos.shares.toFixed(1)} stk (GAK: ${pos.gakDkk} kr, kurs: ${Math.round(p)} kr, værdi: ${val} kr)`;
        });

      return {
        kolonne: col.title,
        kontotype: col.accountType === 'ASK' ? 'Aktiesparekonto (17% lagerskat)' : 'Almindeligt Aktiedepot (27%/42%)',
        totalNAV: Math.round(metrics.nominalNAV),
        raaNettoEfterSkat: Math.round(metrics.rawNetWealthAfterTaxDkk),
        selvfinansieretNetto: Math.round(metrics.selfFundedNetWealthAfterTaxDkk),
        kontant: Math.round(metrics.displayedCashDkk),
        urealiseretGevinst: Math.round(metrics.unrealizedGainLossDkk),
        betaltSkat: Math.round(metrics.totalTaxPaidDkk),
        modtagetUdbytteIAlt: Math.round(metrics.totalDividendsDkk),
        latentSkat: Math.round(metrics.latentTaxDkk),
        skyldigSkatIAar: Math.round(metrics.curYearOwedTaxDkk),
        eksterntTilfoertSkattebetaling: Math.round(metrics.externalCashInjectedDkk),
        positioner: holdingsList.length > 0 ? holdingsList.join('; ') : 'Ingen åbne positioner (100% kontant)'
      };
    });

    return {
      dato: currentDateFormatted,
      civilstand: isMarried ? 'Gift (Dobbelt 27%-grænse)' : 'Enlig (1x 27%-grænse)',
      aktuel27ProcentGraense: formatDkk(currentProgressionLimit),
      samletSelvfinansieretKunDepot: Math.round(col1NetWealth),
      samletSelvfinansieretBlanding: Math.round(combinedStrategyNetWealth),
      forskelDkk: Math.round(strategyDiffDkk),
      kolonner: summary
    };
  }, [columns, currentPrices, currentDateFormatted, isMarried, currentProgressionLimit, col1NetWealth, combinedStrategyNetWealth, strategyDiffDkk, computeColumnMetrics]);

  const handleGeneratePortfolioAnalysis = async () => {
    setIsAiLoading(true);
    setAiError('');
    try {
      const context = buildPortfolioContextSummary();
      const systemPrompt =
        'Du er Danmarks førende uvildige ekspert i aktiebeskatning, porteføljeteori og privat formuepleje. Sammenlign Kolonne 1 (Kun Depot) med Kolonne 2 + 3 (Depot + ASK). Inddrag ETF-lagerskat vs. realisationsbeskattede danske fonde/aktier, udbytter, 27%-progressionsgrænsen og lagerskat.';
      const userPrompt = `Her er status pr. ${context.dato}:\n${JSON.stringify(
        context,
        null,
        2
      )}\n\nAnalyser specifikt:
1. Hvilken strategi har skabt den højeste selvfinansierede nettoformue efter al skat, og hvorfor?
2. Hvordan påvirker valget af ETF'er (lagerbeskattet) vs. enkeltaktier og danske investeringsforeninger (realisationsbeskattet) skattebetalingen?
3. Konkrete anbefalinger til skatteoptimering (f.eks. høst af 27%-grænsen på ${context.aktuel27ProcentGraense} og placering af aktiver mellem Depot og ASK).`;

      const result = await callGeminiApi(userPrompt, systemPrompt);
      setAiPortfolioAnalysis(result);
    } catch (err) {
      setAiError(err.message || 'Der opstod en fejl ved kontakt til AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateMacroReport = async () => {
    setIsAiLoading(true);
    setAiError('');
    try {
      const context = buildPortfolioContextSummary();
      const systemPrompt =
        'Du er en historisk markedsanalytiker og børshistoriker. Svar levende og præcist på dansk.';
      const userPrompt = `Vi befinder os i simulatoren den ${context.dato}. Hvad skete der i den globale og danske økonomi omkring dette tidspunkt (renter, inflation, kriser, C25-selskaber som Novo, Ørsted, Mærsk, Danske Bank og amerikansk tech)?`;

      const result = await callGeminiApi(userPrompt, systemPrompt);
      setAiMacroReport(result);
    } catch (err) {
      setAiError(err.message || 'Der opstod en fejl ved kontakt til AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendChatMessage = async (e) => {
    e?.preventDefault();
    if (!aiChatInput.trim() || isAiLoading) return;

    const userText = aiChatInput.trim();
    const newHistory = [...aiChatMessages, { role: 'user', text: userText }];
    setAiChatMessages(newHistory);
    setAiChatInput('');
    setIsAiLoading(true);
    setAiError('');

    try {
      const context = buildPortfolioContextSummary();
      const systemPrompt = `Du er en erfaren dansk skatte- og formuerådgiver. Du kender brugerens porteføljer pr. ${context.dato}: ${JSON.stringify(
        context
      )}. Svar præcist efter gældende danske skatteregler (ASK 17% lagerskat, ETF lagerskat på depot, realisationsskat på enkeltaktier og Sparindex/Danske Inv fonde, samt 27%/42% progressionsgrænser).`;

      const promptWithHistory = `Tidligere samtale:\n${newHistory
        .map((m) => `${m.role === 'user' ? 'Bruger' : 'Rådgiver'}: ${m.text}`)
        .join('\n')}\n\nBrugerens seneste spørgsmål: ${userText}`;

      const reply = await callGeminiApi(promptWithHistory, systemPrompt);
      setAiChatMessages([...newHistory, { role: 'assistant', text: reply }]);
    } catch (err) {
      setAiError(err.message || 'Kunne ikke hente svar.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Toast besked ved 27% høst m.m. */}
      {statusToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-mono font-bold shadow-2xl">
          {statusToast}
        </div>
      )}

      {/* Top Header */}
      <header className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <a href="/" aria-label="Til Eastwood451-forsiden" className="w-8 h-8 shrink-0 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow">
            3P
          </a>
          <div>
            <h1 className="text-sm font-bold text-slate-100 leading-tight flex items-center gap-2">
              Dansk Formue- & Skattesimulator
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950 border border-blue-800 text-blue-300">
                27% op til {formatDkk(currentProgressionLimit)} • 42% derefter
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">
              Depot: <strong className="text-slate-200 font-mono">27% op til {formatDkk(currentProgressionLimit)} / 42% over</strong> • ASK: <strong className="text-emerald-300 font-mono">17% lagerskat (loft {formatDkk(ASK_LEGAL_CAP)})</strong>
            </p>
          </div>
        </div>

        {/* Kontroller: Fast stationært layout */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setTransferFeedback({ error: '', success: '' });
              setShowTransferModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md border border-emerald-400/40 shrink-0"
            title="Overfør frie kontanter fra Kolonne 2 (Depot) til Kolonne 3 (ASK) indenfor loftet"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Overfør til ASK</span>
          </button>

          {/* Enlig / Gift (Ægtefælle dobbelt bundfradrag) */}
          <button
            onClick={() => setIsMarried(!isMarried)}
            className={`w-[138px] flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition shrink-0 ${
              isMarried
                ? 'bg-indigo-950/90 border-indigo-500/80 text-indigo-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Skift mellem Enlig (1x progressionsgrænse) og Gift (2x progressionsgrænse for ægtefæller)"
          >
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{isMarried ? 'Gift (2x)' : 'Enlig (1x)'}</span>
            </span>
            <span className="text-[10px] font-mono text-indigo-300">
              {Math.round(currentProgressionLimit / 1000)}k
            </span>
          </button>

          {/* Vælg handelsmode (DKK vs Enheder) */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setTradeMode('DKK')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                tradeMode === 'DKK' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              DKK
            </button>
            <button
              onClick={() => setTradeMode('SHARES')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                tradeMode === 'SHARES' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Stk
            </button>
          </div>

          {/* Spring frem */}
          <div className="w-[215px] flex items-center justify-between bg-slate-950 px-2 py-1.5 rounded-xl border border-slate-800 shrink-0">
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Hop:
            </span>
            <input
              type="date"
              min={currentDateISO}
              max={todayISO}
              value={jumpDateInput}
              onChange={(e) => setJumpDateInput(e.target.value)}
              disabled={dayIndex >= TOTAL_MAX_DAYS}
              className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono text-slate-200 outline-none focus:border-blue-500 disabled:opacity-40 w-[112px]"
            />
            <button
              onClick={() => {
                if (jumpDateInput) handleJumpToDate(jumpDateInput);
              }}
              disabled={!jumpDateInput || jumpDateInput <= currentDateISO || dayIndex >= TOTAL_MAX_DAYS}
              className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white font-bold text-xs transition"
            >
              OK
            </button>
          </div>

          {/* AI Rådgiver */}
          <button
            onClick={() => setShowAiModal(true)}
            className="w-[110px] flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/80 to-indigo-600/80 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-md border border-indigo-400/30 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
            <span className="whitespace-nowrap">AI Analyse</span>
          </button>

          {/* Inflation Toggle */}
          <button
            onClick={() => setIsInflationAdjusted(!isInflationAdjusted)}
            className={`w-[135px] flex items-center justify-between text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition shrink-0 ${
              isInflationAdjusted
                ? 'bg-amber-950/80 border-amber-600/70 text-amber-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="truncate">CPI Realværdi</span>
            <span className="text-[10px] font-mono text-amber-400/90 shrink-0">
              x{currentInflationFactor.toFixed(2)}
            </span>
          </button>

          {/* Skattelog */}
          <button
            onClick={() => setShowTaxLogModal(true)}
            className="w-[88px] flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 font-medium transition shrink-0"
          >
            <History className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="whitespace-nowrap">Log ({taxAuditLogs.length})</span>
          </button>

          {/* Dato & Afspil */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
            <div className="w-[140px] flex items-center gap-1.5 overflow-hidden">
              <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-xs font-semibold font-mono text-blue-200 whitespace-nowrap tabular-nums">
                {currentDateFormatted}
              </span>
            </div>

            <div className="h-4 w-px bg-slate-800 shrink-0" />

            <button
              onClick={() => {
                if (dayIndex >= TOTAL_MAX_DAYS) return;
                setIsPlaying(!isPlaying);
              }}
              disabled={dayIndex >= TOTAL_MAX_DAYS || !!pendingTaxSettlement}
              className={`w-[78px] py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm shrink-0 ${
                dayIndex >= TOTAL_MAX_DAYS
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {dayIndex >= TOTAL_MAX_DAYS ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>SLUT</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>START</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0"
              title="Nulstil til 1. jan 2010"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Benchmark Sammenligningsbar */}
      <div className="bg-slate-900/90 border-b border-indigo-900/50 px-4 py-2.5 shadow-lg">
        <div className="max-w-[1680px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block">
                Fair Nettoformue-Benchmark (Efter Fuld Likvidation, Al Skat & Fratrukket Evt. Lønkonto-Indskud)
              </span>
              <div className="flex items-center gap-4 text-xs font-mono mt-0.5">
                <span className="text-slate-300">
                  Kun Depot (Kol. 1): <strong className="text-white text-sm">{formatDkk(col1NetWealth)}</strong>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">
                  Blanding Depot + ASK (Kol. 2 + 3): <strong className="text-emerald-300 text-sm">{formatDkk(combinedStrategyNetWealth)}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-medium">
              Merafkast ved ASK + Depot:
            </span>
            <div
              className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 border shadow ${
                strategyDiffDkk >= 0
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700/80'
                  : 'bg-rose-950 text-rose-300 border-rose-700/80'
              }`}
            >
              {strategyDiffDkk >= 0 ? '+' : ''}
              {formatDkk(strategyDiffDkk)}
              <span className="text-[10px] font-normal opacity-80">
                ({(((combinedStrategyNetWealth - col1NetWealth) / (col1NetWealth || 1)) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Grid */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto p-3 sm:p-5 md:p-6 pb-36">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
          {columns.map((col) => {
            const metrics = computeColumnMetrics(col);
            const isAsk = col.accountType === 'ASK';
            const pendingOrderCount = Object.keys(col.draftOrders).length;

            return (
              <div
                key={col.id}
                className={`bg-slate-900/90 rounded-2xl border shadow-xl overflow-hidden flex flex-col ${
                  isAsk ? 'border-emerald-900/60 ring-1 ring-emerald-500/20' : 'border-slate-800'
                }`}
              >
                {/* Kolonne Header */}
                <div className="p-3.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        col.id === 0 ? 'bg-blue-500' : col.id === 1 ? 'bg-indigo-500' : 'bg-emerald-500'
                      }`}
                    />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      {col.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isAsk && (
                      <button
                        onClick={() => handleHarvest27PercentBracket(col.id)}
                        className="px-2 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-700/70 text-amber-300 text-[10px] font-bold flex items-center gap-1 transition"
                        title={`Sælg og genkøb automatisk aktier med gevinst op til årets 27%-grænse (${formatDkk(currentProgressionLimit)}) for at hæve GAK billigt`}
                      >
                        <Scissors className="w-3 h-3" />
                        <span>Høst 27%</span>
                      </button>
                    )}

                    <span
                      className={`text-[10px] px-2 py-1 rounded-lg font-medium border flex items-center gap-1 ${
                        isAsk
                          ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300'
                          : 'bg-blue-950/70 border-blue-800/80 text-blue-300'
                      }`}
                    >
                      {isAsk ? <ShieldCheck className="w-3 h-3 text-emerald-400" /> : <Briefcase className="w-3 h-3 text-blue-400" />}
                      <span>{isAsk ? 'ASK (17%)' : 'Depot (27/42%)'}</span>
                    </span>

                    <button
                      onClick={() => setActiveSettingsCol(activeSettingsCol === col.id ? null : col.id)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Indstil kurtage og valutagebyr"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isAsk && (
                  <div className="px-3.5 py-1.5 bg-emerald-950/40 border-b border-emerald-900/40 text-[11px] font-mono flex items-center justify-between">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Indskudsloft (Kun DKK-konto • 0,25% FX ved US):
                    </span>
                    <span className="font-bold text-emerald-300">
                      {formatDkk(ASK_LEGAL_CAP)}
                    </span>
                  </div>
                )}

                {activeSettingsCol === col.id && (
                  <div className="p-3 bg-slate-950 border-b border-slate-800 text-xs flex items-center justify-between gap-2">
                    <span className="text-slate-400">Kurtage (DKK) / US FX-gebyr: {(col.fxFeePct * 100).toFixed(2)}%</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={col.brokerageDkk}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setColumns((prev) =>
                            prev.map((c) => (c.id === col.id ? { ...c, brokerageDkk: val } : c))
                          );
                        }}
                        className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-right text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-400">kr.</span>
                    </div>
                  </div>
                )}

                {/* Kurvegraf */}
                <div className="p-3 bg-slate-950/50 border-b border-slate-800">
                  <PortfolioSparkline
                    history={col.history}
                    baseline={col.id === 2 ? 0 : 100000}
                    adjustInflation={isInflationAdjusted}
                  />
                </div>

                {/* RÅ NETTO OG NAV STATUS */}
                <div className="p-4 border-b border-slate-800 bg-slate-900">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-600/40 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5 text-amber-400" />
                        SELVFINANSIERET RÅ NETTO (EFTER AL SKAT)
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Fair benchmark</span>
                    </div>
                    <div className="text-2xl font-black text-amber-300 font-mono tracking-tight mt-1">
                      {formatDkk(metrics.selfFundedNetRealDkk)}
                    </div>
                    {metrics.externalCashInjectedDkk > 0 ? (
                      <div className="text-[10px] text-emerald-400 mt-1 font-mono flex justify-between">
                        <span>Kontoens rå netto inkl. lønkonto-indskud:</span>
                        <strong>{formatDkk(metrics.rawNetRealDkk)}</strong>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Beløb i hånden hvis alle positioner lukkes og al skat betales i dag.
                      </div>
                    )}
                  </div>

                  {/* Porteføljeværdi (NAV) */}
                  <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-300">
                    <span className="text-slate-400 uppercase text-[10px] font-bold">
                      Bruttoværdi (NAV):
                    </span>
                    <span className="font-bold text-white text-sm">
                      {formatDkk(metrics.nominalNavRealDkk)}
                    </span>
                  </div>

                  {/* Kontant & Urealiseret */}
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-300 font-mono">
                    <span className="flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5 text-blue-400" />
                      Kontant: <strong className="text-white">{formatDkk(metrics.displayedCashDkk)}</strong>
                    </span>
                    <span
                      className={`font-semibold ${
                        metrics.unrealizedGainLossDkk >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {metrics.unrealizedGainLossDkk >= 0 ? '+' : ''}
                      {formatDkk(metrics.unrealizedGainLossDkk)} ureal.
                    </span>
                  </div>

                  {/* Skattedetaljer */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono grid grid-cols-2 gap-y-1 gap-x-2 text-slate-400">
                    <div>
                      Betalt skat: <span className="text-rose-400 font-bold">{formatDkk(metrics.totalTaxPaidDkk)}</span>
                    </div>
                    <div className="text-right">
                      {isAsk ? (
                        <span>
                          Lagerskat i år: <strong className="text-amber-400">{formatDkk(metrics.curYearOwedTaxDkk)}</strong>
                        </span>
                      ) : (
                        <span>
                          Latent skat: <strong className="text-rose-400">{formatDkk(metrics.latentTaxDkk)}</strong>
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 flex justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Modtaget udbytte: <strong className="text-emerald-400">{formatDkk(metrics.totalDividendsDkk)}</strong></span>
                      {!isAsk ? (
                        <span>Skyldig skat i år: <strong className="text-amber-400">{formatDkk(metrics.curYearOwedTaxDkk)}</strong></span>
                      ) : (
                        <span>Fradragspulje (17%): <strong className="text-indigo-300">{formatDkk(col.askNegativeTaxCarryforwardDkk)}</strong></span>
                      )}
                    </div>
                    {!isAsk && metrics.liquidationTaxBreakdown && (
                      <div className="col-span-2 mt-1 p-1.5 rounded-lg bg-slate-950/90 border border-slate-800/90 text-[10px] text-slate-300 flex flex-col gap-0.5">
                        <div className="flex justify-between text-slate-400">
                          <span>27% skat (op til {formatDkk(metrics.liquidationTaxBreakdown.limit)}):</span>
                          <strong className="text-amber-300">{formatDkk(metrics.liquidationTaxBreakdown.tax27Dkk)}</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>42% skat (af gevinst over {formatDkk(metrics.liquidationTaxBreakdown.limit)}):</span>
                          <strong className="text-rose-400">{formatDkk(metrics.liquidationTaxBreakdown.tax42Dkk)}</strong>
                        </div>
                      </div>
                    )}
                    {metrics.externalCashInjectedDkk > 0 && (
                      <div className="col-span-2 text-[10px] text-amber-300/90 pt-0.5 flex justify-between">
                        <span>Indskudt fra privat lønkonto:</span>
                        <strong>{formatDkk(metrics.externalCashInjectedDkk)}</strong>
                      </div>
                    )}
                  </div>

                  {pendingOrderCount > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-amber-400 font-medium">
                        {pendingOrderCount} ordre{pendingOrderCount > 1 ? 'r' : ''} klar
                      </span>
                      <button
                        onClick={() => executeAllColumnDrafts(col.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 transition shadow"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Gennemfør alle</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Instrumentliste */}
                <div className="divide-y divide-slate-800/60 max-h-[580px] overflow-y-auto">
                  {ALPHABETICAL_INSTRUMENTS.map((asset) => {
                    const ipoDate = new Date(asset.ipoDate);
                    const isAvailable = currentSimDate >= ipoDate;

                    const priceObj = currentPrices[asset.id] || { nativePrice: 1, currency: 'USD', dkkPrice: 1 };
                    const pos = col.holdings[asset.id] || { shares: 0, gakDkk: 0 };
                    const shares = pos.shares || 0;
                    const deflator = isInflationAdjusted ? currentInflationFactor : 1.0;
                    const displayPriceDkk = priceObj.dkkPrice / deflator;
                    const posValueDkk = (Math.abs(shares) * priceObj.dkkPrice) / deflator;
                    const isLong = shares > 0.0001;
                    const isShort = shares < -0.0001;

                    const rawDraft = col.draftOrders[asset.id];
                    const draftDkk = parseFloat(rawDraft) || 0;
                    const draftInputValue = rawDraft !== undefined ? rawDraft : '';
                    const hasDraft = Math.abs(draftDkk) > 0.00001;

                    const maxSellableDkk = isLong ? shares * priceObj.dkkPrice : 0;
                    const disableMinusOnAsk = isAsk && (shares <= 0.0001 || Math.abs(draftDkk - 1000) > maxSellableDkk);
                    const notEnoughCashToBuy = col.cash < (tradeMode === 'DKK' ? 1000 : priceObj.dkkPrice * 10);

                    return (
                      <div
                        key={asset.id}
                        className={`min-h-[114px] px-3 py-2 grid grid-cols-[minmax(0,1fr)_68px_56px] items-center gap-x-2 gap-y-1 transition-colors overflow-hidden ${
                          !isAvailable
                            ? 'opacity-40 bg-slate-950/40 grayscale pointer-events-none'
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Navn & Beholdning */}
                        <div className="flex-1 min-w-0 pr-1 flex flex-col justify-center">
                          <div className="flex items-center gap-1.5 leading-none">
                            <span className="font-semibold text-xs text-slate-100 truncate block">
                              {asset.name}
                            </span>
                            {asset.type === 'etf' && (
                              <span
                                className="text-[9px] bg-amber-950 text-amber-300 border border-amber-700/60 px-1 py-0.2 rounded font-mono shrink-0"
                                title="ETF: Lagerbeskattes hvert år på BÅDE almindeligt depot (27/42%) og ASK (17%)"
                              >
                                ETF•Lager
                              </span>
                            )}
                            {asset.type === 'dk_fund' && (
                              <span
                                className="text-[9px] bg-blue-950 text-blue-300 border border-blue-700/60 px-1 py-0.2 rounded font-mono shrink-0"
                                title="Dansk udbyttebetalende fond: Realisationsbeskattet på almindeligt depot"
                              >
                                DK•Fond
                              </span>
                            )}
                            {!isAvailable && (
                              <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.2 rounded font-mono shrink-0">
                                IPO: {asset.ipoDate}
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap mt-1 leading-none flex items-center gap-1.5">
                            {isAvailable ? (
                              <>
                                <span>{priceObj.nativePrice.toFixed(1)} {priceObj.currency} ≈ {Math.round(displayPriceDkk)} kr.</span>
                                {asset.divYield > 0 && (
                                  <span className="text-emerald-400/90">• Udbytte {(asset.divYield * 100).toFixed(1)}%</span>
                                )}
                              </>
                            ) : (
                              <span className="text-slate-500 italic">Børsnoteret {asset.ipoDate}</span>
                            )}
                          </div>

                          <div className="h-5 mt-1 flex items-center gap-1.5 overflow-hidden">
                            {isLong ? (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/70 whitespace-nowrap shadow-sm truncate max-w-full">
                                Ejer: {shares.toLocaleString('da-DK', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} stk ({Math.round(posValueDkk).toLocaleString('da-DK')} kr.)
                              </span>
                            ) : isShort ? (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700/70 whitespace-nowrap shadow-sm truncate max-w-full">
                                Short: {Math.abs(shares).toLocaleString('da-DK', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} stk ({Math.round(posValueDkk).toLocaleString('da-DK')} kr.)
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800">
                                Ejer: 0 stk
                              </span>
                            )}
                          </div>
                        </div>

                        <InstrumentMiniChart
                          asset={asset}
                          currentSimDayIndex={Math.floor(dayIndex)}
                          isAvailable={isAvailable}
                        />

                        <div className="w-14 flex items-center justify-center shrink-0">
                          {isAvailable && (isLong || isShort) ? (
                            <button
                              onClick={() => executeLiquidateHolding(col.id, asset.id)}
                              className={`px-1.5 py-1 rounded text-[10px] font-mono font-bold transition shadow-sm border whitespace-nowrap active:scale-95 ${
                                isLong
                                  ? 'bg-rose-950/90 hover:bg-rose-900 text-rose-300 border-rose-700/80 hover:text-white'
                                  : 'bg-amber-950/90 hover:bg-amber-900 text-amber-300 border-amber-700/80 hover:text-white'
                              }`}
                              title="Likvidér hele positionen"
                            >
                              Likvidér
                            </button>
                          ) : null}
                        </div>

                        {/* Handelskontroller */}
                        <div className="col-span-3 flex items-center justify-end gap-1.5 shrink-0">
                          <button
                            onClick={() => adjustDraftOrder(col.id, asset.id, tradeMode === 'DKK' ? -1000 : -10)}
                            disabled={!isAvailable || disableMinusOnAsk}
                            className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center transition active:scale-95 ${
                              !isAvailable || disableMinusOnAsk
                                ? 'bg-slate-900/60 text-slate-600 border-slate-800 cursor-not-allowed opacity-40'
                                : 'bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 border-slate-700'
                            }`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => adjustDraftOrder(col.id, asset.id, tradeMode === 'DKK' ? 1000 : 10)}
                            disabled={!isAvailable || notEnoughCashToBuy}
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs transition active:scale-95 ${
                              !isAvailable || notEnoughCashToBuy
                                ? 'bg-slate-900/60 text-slate-600 border-slate-800 cursor-not-allowed opacity-40'
                                : 'bg-slate-800 hover:bg-emerald-900/60 border-slate-700 hover:border-emerald-600/50 text-slate-300 hover:text-emerald-300'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="text"
                            inputMode="decimal"
                            disabled={!isAvailable}
                            value={draftInputValue}
                            onChange={(e) => handleDraftInputChange(col.id, asset.id, e.target.value)}
                            onBlur={() => handleDraftInputBlur(col.id, asset.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                executeDraftOrder(col.id, asset.id);
                              }
                            }}
                            placeholder={isAvailable ? (tradeMode === 'DKK' ? '0 kr' : '0 stk') : '—'}
                            className={`w-[74px] text-center text-[11px] font-mono font-bold py-1 px-1 rounded-lg border outline-none transition ${
                              !isAvailable
                                ? 'bg-slate-950/40 border-slate-800/40 text-slate-600 cursor-not-allowed'
                                : draftDkk > 0
                                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 focus:ring-1 focus:ring-emerald-400'
                                : draftDkk < 0
                                ? 'bg-rose-950/80 border-rose-500 text-rose-300 focus:ring-1 focus:ring-rose-400'
                                : 'bg-slate-950 border-slate-800 text-slate-300 placeholder-slate-600 focus:border-blue-500'
                            }`}
                          />

                          <button
                            onClick={() => executeDraftOrder(col.id, asset.id)}
                            disabled={!isAvailable || !hasDraft}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition active:scale-90 ${
                              !isAvailable || !hasDraft
                                ? 'bg-slate-800/40 text-slate-600 border border-slate-800/50 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          </button>

                          <div className="w-5 flex justify-center">
                            {hasDraft ? (
                              <button
                                onClick={() => cancelDraftOrder(col.id, asset.id)}
                                className="text-slate-500 hover:text-slate-300 transition"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Kolonne Bundstatus */}
                <div className="p-3 bg-slate-950/90 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Kurtage & FX i alt: {Math.round(col.totalCommissionPaidDkk)} kr.</span>
                  {isAsk ? (
                    <span>Neg. skat fremført: {Math.round(col.askNegativeTaxCarryforwardDkk || 0)} kr.</span>
                  ) : (
                    <span>Tab til fremførsel: {Math.round(col.taxLossCarryforwardDkk || 0)} kr.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Årlig Skattedialog Modal */}
      {pendingTaxSettlement && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Årsskifte {pendingTaxSettlement.year}: Skatteopgørelse for ASK
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Lovpligtig 17% lagerskat pr. 31. december
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs font-sans">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Årets skattepligtige gevinst på ASK:</span>
                  <strong className="text-emerald-400">+{formatDkk(pendingTaxSettlement.annualReturnDkk)}</strong>
                </div>
                {pendingTaxSettlement.askDividendsDkk > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span>Modtagne kontante udbytter i år på ASK:</span>
                    <strong className="text-emerald-300">+{formatDkk(pendingTaxSettlement.askDividendsDkk)}</strong>
                  </div>
                )}
                <div className="flex justify-between text-slate-300">
                  <span>Skyldig 17% lagerskat (efter evt. tabsfradrag):</span>
                  <strong className="text-rose-400">{formatDkk(pendingTaxSettlement.askTaxDue)}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Frie kontanter på ASK (inkl. udbytter):</span>
                  <strong className="text-white">{formatDkk(pendingTaxSettlement.askAvailableCash)}</strong>
                </div>
                <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                  <span className="text-amber-400 font-bold">Manglende dækning til skatten:</span>
                  <strong className="text-amber-400 font-bold">{formatDkk(pendingTaxSettlement.askShortfall)}</strong>
                </div>
              </div>

              <div className="text-slate-300 space-y-1.5">
                <p className="font-semibold text-white">Hvordan vil du betale den manglende skat?</p>
                <p className="text-[11px] text-slate-400">
                  For at sammenligningen med Kolonne 1 er 100% matematisk fair, trækkes eksterne lønkonto-indskud fra i det selvfinansierede nettoafkast.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() =>
                    finalizeTaxSettlement({
                      year: pendingTaxSettlement.year,
                      askTaxMethod: 'SALARY',
                      askTaxDue: pendingTaxSettlement.askTaxDue,
                      annualReturnDkk: pendingTaxSettlement.annualReturnDkk,
                      askDividendsDkk: pendingTaxSettlement.askDividendsDkk,
                      newAskNegativeTaxPool: pendingTaxSettlement.newAskNegativeTaxPool,
                      latestPrices: pendingTaxSettlement.latestPrices,
                      depotCols: pendingTaxSettlement.depotCols
                    })
                  }
                  className="w-full p-3 rounded-xl bg-slate-950 border border-emerald-600/50 hover:bg-emerald-950/40 text-left transition flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400 shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-xs flex items-center justify-between">
                      <span>1. Indbetal {formatDkk(pendingTaxSettlement.askShortfall)} fra privat lønkonto</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Bevarer alle aktier</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Dine aktier på ASK røres ikke. Beløbet registreres som eksternt indskud og modregnes i det selvfinansierede netto-benchmark.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() =>
                    finalizeTaxSettlement({
                      year: pendingTaxSettlement.year,
                      askTaxMethod: 'SELL_SHARES',
                      askTaxDue: pendingTaxSettlement.askTaxDue,
                      annualReturnDkk: pendingTaxSettlement.annualReturnDkk,
                      askDividendsDkk: pendingTaxSettlement.askDividendsDkk,
                      newAskNegativeTaxPool: pendingTaxSettlement.newAskNegativeTaxPool,
                      latestPrices: pendingTaxSettlement.latestPrices,
                      depotCols: pendingTaxSettlement.depotCols
                    })
                  }
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:bg-rose-950/40 hover:border-rose-700/50 text-left transition flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-rose-950 border border-rose-800 text-rose-400 shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-xs flex items-center justify-between">
                      <span>2. Sælg aktier på ASK for {formatDkk(pendingTaxSettlement.askShortfall)} (+ kurtage)</span>
                      <span className="text-[10px] text-rose-400 font-mono">100% selvfinansieret</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Kontoen betaler selv sin skat ved at sælge en lille del af aktierne. Ingen penge tilføres udefra.
                    </p>
                  </div>
                </button>

                {pendingTaxSettlement.col2CashAvailable >= pendingTaxSettlement.askShortfall && (
                  <button
                    onClick={() =>
                      finalizeTaxSettlement({
                        year: pendingTaxSettlement.year,
                        askTaxMethod: 'COL2_CASH',
                        askTaxDue: pendingTaxSettlement.askTaxDue,
                        annualReturnDkk: pendingTaxSettlement.annualReturnDkk,
                        askDividendsDkk: pendingTaxSettlement.askDividendsDkk,
                        newAskNegativeTaxPool: pendingTaxSettlement.newAskNegativeTaxPool,
                        latestPrices: pendingTaxSettlement.latestPrices,
                        depotCols: pendingTaxSettlement.depotCols
                      })
                    }
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:bg-blue-950/40 hover:border-blue-700/50 text-left transition flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-blue-400 shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white text-xs">
                        3. Dæk fra Kolonne 2's frie kontanter ({formatDkk(pendingTaxSettlement.col2CashAvailable)} tilgængelig)
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Trækker skattebeløbet fra dit almindelige depots kontantkonto i Kolonne 2.
                      </p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overførselsmodal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Overførsel fra Depot (Kol. 2) til ASK (Kol. 3)</h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-sans">
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Frie kontanter i Kolonne 2 (Depot):</span>
                    <strong className="text-white">{formatDkk(columns[1].cash)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Nuværende værdi af Kolonne 3 (ASK):</span>
                    <strong className="text-emerald-300">{formatDkk(computeColumnMetrics(columns[2]).nominalNAV)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                    <span>Gældende indskudsloft:</span>
                    <strong className="text-amber-300">{formatDkk(ASK_LEGAL_CAP)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Maks. lovlig overførsel nu:</span>
                    <strong className="text-emerald-400 font-bold">{formatDkk(askCapRemaining)}</strong>
                  </div>
                </div>

                <form onSubmit={handleExecuteTransfer} className="space-y-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Beløb der skal overføres til ASK (DKK):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max={askCapRemaining}
                        value={transferAmountInput}
                        onChange={(e) => setTransferAmountInput(e.target.value)}
                        placeholder={`F.eks. ${Math.min(100000, Math.round(askCapRemaining))}`}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setTransferAmountInput(String(Math.floor(askCapRemaining)))}
                        disabled={askCapRemaining <= 0}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition disabled:opacity-40"
                      >
                        Maks
                      </button>
                    </div>
                  </div>

                  {transferFeedback.error && (
                    <div className="p-2.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 text-[11px]">
                      {transferFeedback.error}
                    </div>
                  )}

                  {transferFeedback.success && (
                    <div className="p-2.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-[11px]">
                      {transferFeedback.success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={askCapRemaining <= 0}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Gennemfør Overførsel</span>
                  </button>
                </form>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 text-right">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
              >
                Luk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skatterevisionslog Modal */}
      {showTaxLogModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Dansk Skatterevisionslog (Årsskifter 2010 → Nutid)</h3>
              </div>
              <button
                onClick={() => setShowTaxLogModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 font-mono text-xs">
              {taxAuditLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Ingen årsskifter passeret endnu. Start simuleringen for at passere 31. december.
                </div>
              ) : (
                taxAuditLogs.map((log, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-400">
                        {log.year} • {log.colTitle} ({log.type})
                      </span>
                      <span className={`font-bold ${log.taxPaidDkk > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        Trukket i skat: {log.taxPaidDkk.toLocaleString('da-DK')} kr.
                      </span>
                    </div>
                    <div className="text-slate-400 flex justify-between text-[11px]">
                      <span>Skattepligtigt resultat: {log.returnDkk.toLocaleString('da-DK')} kr.</span>
                      <span>{log.poolInfo}</span>
                      <span>Kontant efter: {log.cashAfter.toLocaleString('da-DK')} kr.</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 text-right">
              <button
                onClick={() => setShowTaxLogModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
              >
                Luk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Rådgiver Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    Gemini AI Portefølje- & Skatterådgiver
                    <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-700/60 px-1.5 py-0.2 rounded">
                      gemini-3-flash
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Sammenligning: Kun Depot vs. Blanding af Depot & ASK ({currentDateFormatted})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-4 gap-2 pt-2 text-xs font-semibold">
              <button
                onClick={() => setAiActiveTab('portfolio')}
                className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition ${
                  aiActiveTab === 'portfolio'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rå Nettoanalyse</span>
              </button>
              <button
                onClick={() => setAiActiveTab('macro')}
                className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition ${
                  aiActiveTab === 'macro'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>Historisk Markedstelegram</span>
              </button>
              <button
                onClick={() => setAiActiveTab('chat')}
                className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition ${
                  aiActiveTab === 'chat'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Spørg Skatteeksperten</span>
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {aiError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 font-mono text-xs">
                  {aiError}
                </div>
              )}

              {aiActiveTab === 'portfolio' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-200">
                        Vurdering af Selvfinansieret Nettoformue efter skat
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Evaluering af ETF-lagerskat, udbytter, 27%-grænse og ASK.
                      </p>
                    </div>
                    <button
                      onClick={handleGeneratePortfolioAnalysis}
                      disabled={isAiLoading}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 transition shadow"
                    >
                      {isAiLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Analyserer...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Kør Nettoanalyse</span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiPortfolioAnalysis ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap font-sans text-xs sm:text-sm">
                      {aiPortfolioAnalysis}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 font-mono">
                      Klik på &quot;Kør Nettoanalyse&quot; for at få AI-evaluering af strategiforskellen.
                    </div>
                  )}
                </div>
              )}

              {aiActiveTab === 'macro' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-200">
                        Hvad skete der i markedet pr. {currentDateFormatted}?
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Få det historiske overblik over C25, renter og de globale aktiemarkeder.
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateMacroReport}
                      disabled={isAiLoading}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 transition shadow"
                    >
                      {isAiLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Henter historie...</span>
                        </>
                      ) : (
                        <>
                          <Newspaper className="w-3.5 h-3.5" />
                          <span>Hent Historisk Telegram</span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiMacroReport ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap font-sans text-xs sm:text-sm">
                      {aiMacroReport}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 font-mono">
                      Klik på knappen for at hente det historiske telegram for datoen.
                    </div>
                  )}
                </div>
              )}

              {aiActiveTab === 'chat' && (
                <div className="flex flex-col h-[400px]">
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {aiChatMessages.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 space-y-2">
                        <p>Stil et spørgsmål om optimering mellem depot, ETF'er, Sparindex og ASK.</p>
                      </div>
                    ) : (
                      aiChatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs ${
                              msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none whitespace-pre-wrap'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))
                    )}
                    {isAiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-950 border border-slate-800 text-slate-400 rounded-2xl px-3 py-2 flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                          <span>Gemini tænker...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendChatMessage} className="pt-3 border-t border-slate-800 flex gap-2">
                    <input
                      type="text"
                      value={aiChatInput}
                      onChange={(e) => setAiChatInput(e.target.value)}
                      placeholder="Stil et spørgsmål om ASK-regler, ETF-lagerskat eller 27%-høst..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isAiLoading || !aiChatInput.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1 transition"
                    >
                      <SendHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Model: gemini-3-flash-preview (Google AI)</span>
              <button
                onClick={() => setShowAiModal(false)}
                className="px-3.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-sans text-xs"
              >
                Luk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Hastighedskontrol */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-800 px-4 py-3 z-40 backdrop-blur-md shadow-2xl">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Tid hastighed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400">
                Slutgrænse: {TODAY_DATE.toLocaleDateString('da-DK')}
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                {speedOptions[speedIndex].label}
              </span>
            </div>
          </div>

          <div className="relative flex items-center pt-1">
            <input
              type="range"
              min="0"
              max={speedOptions.length - 1}
              step="1"
              value={speedIndex}
              onChange={(e) => setSpeedIndex(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono px-0.5">
            {speedOptions.map((opt) => (
              <span key={opt.label}>{opt.label}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
