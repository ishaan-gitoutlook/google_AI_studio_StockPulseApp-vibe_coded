import { MarketBreadth, StockFundamentals, StockQuote } from '../types';
import { STOCK_FUNDAMENTALS } from '../data/universes';

export function calculateBreadth(stocks: StockQuote[]): MarketBreadth {
  if (!stocks || stocks.length === 0) {
    const fallbackQuote: StockQuote = {
      symbol: 'N/A',
      name: 'N/A',
      exchange: '',
      currency: 'USD',
      price: 0,
      change: 0,
      changePercent: 0,
      open: 0,
      high: 0,
      low: 0,
      previousClose: 0,
      volume: 0,
      avgVolume: 0,
      marketCap: 0,
      marketCapFormatted: '0',
      peRatio: 0,
      eps: 0,
      dividendYield: 0,
      week52High: 0,
      week52Low: 0,
      sparkline: [],
      sector: '',
      industry: '',
      lastUpdated: '',
    };
    return {
      total: 0,
      advancers: 0,
      decliners: 0,
      unchanged: 0,
      advanceDeclineRatio: 1.0,
      avgChangePercent: 0,
      totalVolume: 0,
      topGainer: fallbackQuote,
      topLoser: fallbackQuote,
    };
  }

  let advancers = 0;
  let decliners = 0;
  let unchanged = 0;
  let totalVolume = 0;
  let totalPercentChange = 0;

  let topGainer = stocks[0];
  let topLoser = stocks[0];

  stocks.forEach((s) => {
    totalVolume += s.volume;
    totalPercentChange += s.changePercent;

    if (s.changePercent > 0.05) {
      advancers++;
    } else if (s.changePercent < -0.05) {
      decliners++;
    } else {
      unchanged++;
    }

    if (s.changePercent > topGainer.changePercent) {
      topGainer = s;
    }
    if (s.changePercent < topLoser.changePercent) {
      topLoser = s;
    }
  });

  const adRatio = decliners === 0 ? advancers : Number((advancers / decliners).toFixed(2));
  const avgChangePercent = Number((totalPercentChange / stocks.length).toFixed(2));

  return {
    total: stocks.length,
    advancers,
    decliners,
    unchanged,
    advanceDeclineRatio: adRatio,
    avgChangePercent,
    totalVolume,
    topGainer,
    topLoser,
  };
}

export function simulateTickUpdate(stock: StockQuote): StockQuote {
  const variance = (Math.random() - 0.48) * 0.008;
  const oldPrice = stock.price;
  const newPrice = Number(Math.max(1, oldPrice * (1 + variance)).toFixed(2));
  const totalChange = Number((newPrice - stock.previousClose).toFixed(2));
  const totalChangePct = Number(((totalChange / (stock.previousClose || 1)) * 100).toFixed(2));

  const newHigh = Math.max(stock.high, newPrice);
  const newLow = Math.min(stock.low, newPrice);
  const newVolume = stock.volume + Math.floor(Math.random() * 8500 + 500);
  const updatedSparkline = [...stock.sparkline.slice(-14), newPrice];

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  return {
    ...stock,
    price: newPrice,
    change: totalChange,
    changePercent: totalChangePct,
    high: newHigh,
    low: newLow,
    volume: newVolume,
    sparkline: updatedSparkline,
    lastUpdated: `Live Tick ${timeStr}`,
  };
}

export function simulateMarketTick(stocks: StockQuote[]): {
  updatedStocks: StockQuote[];
  changedSymbol: string;
  isGain: boolean;
} {
  if (!stocks || stocks.length === 0) {
    return { updatedStocks: stocks, changedSymbol: '', isGain: true };
  }

  // pick a random stock to simulate a live trade
  const targetIndex = Math.floor(Math.random() * stocks.length);
  const stock = stocks[targetIndex];

  // small price fluctuation (-0.4% to +0.4%)
  const variance = (Math.random() - 0.48) * 0.008;
  const oldPrice = stock.price;
  const newPrice = Number(Math.max(1, oldPrice * (1 + variance)).toFixed(2));
  const priceDiff = newPrice - oldPrice;
  const isGain = priceDiff >= 0;

  const totalChange = Number((newPrice - stock.previousClose).toFixed(2));
  const totalChangePct = Number(((totalChange / stock.previousClose) * 100).toFixed(2));

  const newHigh = Math.max(stock.high, newPrice);
  const newLow = Math.min(stock.low, newPrice);
  const newVolume = stock.volume + Math.floor(Math.random() * 8500 + 500);

  const updatedSparkline = [...stock.sparkline.slice(-14), newPrice];

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  const updatedStock: StockQuote = {
    ...stock,
    price: newPrice,
    change: totalChange,
    changePercent: totalChangePct,
    high: newHigh,
    low: newLow,
    volume: newVolume,
    sparkline: updatedSparkline,
    lastUpdated: `Live Tick ${timeStr}`,
  };

  const updatedStocks = [...stocks];
  updatedStocks[targetIndex] = updatedStock;

  return {
    updatedStocks,
    changedSymbol: stock.symbol,
    isGain,
  };
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'GBP') {
    return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'EUR') {
    return `€${amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)} T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)} B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)} M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)} K`;
  return num.toString();
}

export interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma20?: number;
  ma50?: number;
}

export function generateHistoricalChartData(
  symbol: string,
  basePrice: number,
  timeframe: '1D' | '5D' | '1M' | '6M' | '1Y' | '5Y'
): ChartDataPoint[] {
  let count = 40;
  let volatility = 0.008;

  if (timeframe === '1D') {
    count = 38; // 5-minute intervals for trading day
    volatility = 0.004;
  } else if (timeframe === '5D') {
    count = 45;
    volatility = 0.012;
  } else if (timeframe === '1M') {
    count = 30;
    volatility = 0.02;
  } else if (timeframe === '6M') {
    count = 60;
    volatility = 0.035;
  } else if (timeframe === '1Y') {
    count = 75;
    volatility = 0.05;
  } else if (timeframe === '5Y') {
    count = 90;
    volatility = 0.08;
  }

  const result: ChartDataPoint[] = [];
  let currentClose = basePrice * (1 - volatility * (count / 2) * 0.4);

  // deterministic seed based on symbol string
  let seed = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 100);

  function seededRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  const now = new Date();

  for (let i = 0; i < count; i++) {
    const isUp = seededRandom() > 0.48;
    const delta = (seededRandom() * volatility + 0.001) * currentClose;
    const open = currentClose;
    const close = Number((isUp ? open + delta : open - delta).toFixed(2));
    const high = Number((Math.max(open, close) + seededRandom() * delta * 0.8).toFixed(2));
    const low = Number((Math.min(open, close) - seededRandom() * delta * 0.8).toFixed(2));
    const volume = Math.floor(seededRandom() * 4000000 + 500000);

    let timeLabel = '';
    if (timeframe === '1D') {
      const minutes = 9.5 * 60 + i * 10;
      const h = Math.floor(minutes / 60);
      const m = Math.floor(minutes % 60);
      timeLabel = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    } else if (timeframe === '5D') {
      const d = new Date(now.getTime() - (count - i) * 2 * 3600 * 1000);
      timeLabel = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
    } else {
      const d = new Date(now.getTime() - (count - i) * 86400 * 1000 * (timeframe === '5Y' ? 20 : timeframe === '1Y' ? 4.5 : 1.5));
      timeLabel = `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
    }

    currentClose = close;
    result.push({
      time: timeLabel,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  // calculate Moving Averages MA20 and MA50
  for (let i = 0; i < result.length; i++) {
    if (i >= 19) {
      const slice20 = result.slice(i - 19, i + 1);
      const sum20 = slice20.reduce((acc, p) => acc + p.close, 0);
      result[i].ma20 = Number((sum20 / 20).toFixed(2));
    }
    if (i >= 49) {
      const slice50 = result.slice(i - 49, i + 1);
      const sum50 = slice50.reduce((acc, p) => acc + p.close, 0);
      result[i].ma50 = Number((sum50 / 50).toFixed(2));
    }
  }

  // ensure final point matches active base price
  if (result.length > 0) {
    result[result.length - 1].close = basePrice;
  }

  return result;
}

export function getOrCreateStockFundamentals(quote: StockQuote): StockFundamentals {
  if (STOCK_FUNDAMENTALS[quote.symbol]) {
    return STOCK_FUNDAMENTALS[quote.symbol];
  }

  // generate intelligent dynamic fundamentals for any custom or non-preset symbol
  const pe = quote.peRatio > 0 ? quote.peRatio : 28.5;
  const eps = quote.eps > 0 ? quote.eps : Number((quote.price / pe).toFixed(2));
  const targetMean = Number((quote.price * 1.14).toFixed(2));
  const targetHigh = Number((quote.price * 1.32).toFixed(2));
  const targetLow = Number((quote.price * 0.92).toFixed(2));

  return {
    symbol: quote.symbol,
    name: quote.name,
    sector: quote.sector || 'Financial Markets',
    industry: quote.industry || 'Multi-Asset Equity',
    country: quote.exchange.includes('NSE') || quote.exchange.includes('BSE') ? 'India' : 'United States',
    employees: 45000,
    ceo: 'Executive Management',
    description: `${quote.name} (${quote.symbol}) is a premier corporation listed on ${quote.exchange}. Operating within ${quote.sector || 'the global equity market'}, it provides key industrial and technological solutions with strong competitive moats and balance sheet stability.`,
    valuation: {
      peRatio: pe,
      forwardPe: Number((pe * 0.85).toFixed(1)),
      pegRatio: 1.35,
      priceToBook: 4.8,
      evToEbitda: 18.2,
      marketCapFormatted: quote.marketCapFormatted || '$50.0 B',
      enterpriseValueFormatted: quote.marketCapFormatted || '$52.4 B',
    },
    financials: {
      revenueFormatted: '$24.5 B',
      revenueGrowthYoy: 14.8,
      grossMargin: 52.4,
      operatingMargin: 28.2,
      netMargin: 21.5,
      roe: 22.8,
      roa: 12.4,
      debtToEquity: 0.35,
      currentRatio: 2.1,
      freeCashFlowFormatted: '$6.4 B',
    },
    stabilityScore: {
      total: 86,
      profitability: 22,
      balanceSheet: 23,
      growth: 21,
      momentum: 20,
      rating: 'Strong',
    },
    analysts: {
      consensus: 'Buy',
      targetMean,
      targetHigh,
      targetLow,
      analystCount: 28,
      upsidePercent: 14.0,
    },
    keyRisks: [
      'Macroeconomic sensitivity and interest rate fluctuations',
      'Currency exchange variance across international revenue channels',
    ],
    catalysts: [
      'Operating margin leverage through automated cloud operations',
      'Expanding addressable market share in high-growth segments',
    ],
  };
}
