import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { StockQuote, ThemeConfig } from '../../types';
import {
  LayoutGrid,
  Layers,
  Filter,
  X,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  DollarSign,
  Activity,
  BarChart2,
  PieChart,
  TrendingUp,
  ChevronRight,
  FolderOpen,
  Eye,
} from 'lucide-react';
import { formatCurrency, formatLargeNumber } from '../../utils/marketEngine';

interface SectorTreemapD3Props {
  stocks: StockQuote[];
  currentTheme: ThemeConfig;
  selectedStock?: StockQuote | null;
  onSelectStock?: (stock: StockQuote) => void;
  selectedSectorFilter: string | null;
  onSelectSectorFilter: (sector: string | null) => void;
}

interface TreemapDatum {
  name: string;
  type: 'root' | 'sector' | 'industry' | 'stock';
  symbol?: string;
  price?: number;
  currency?: string;
  change?: number;
  changePercent?: number;
  marketCap?: number;
  marketCapFormatted?: string;
  volume?: number;
  peRatio?: number;
  sector?: string;
  industry?: string;
  constituentCount?: number;
  advancers?: number;
  decliners?: number;
  avgReturn?: number;
  stock?: StockQuote;
  children?: TreemapDatum[];
}

interface HoveredNodeInfo {
  type: 'stock' | 'sector' | 'industry';
  title: string;
  subtitle: string;
  sector?: string;
  industry?: string;
  marketCap: number;
  marketCapFormatted: string;
  marketSharePct?: number;
  changePercent?: number;
  price?: number;
  currency?: string;
  volume?: number;
  peRatio?: number;
  week52High?: number;
  week52Low?: number;
  constituentCount?: number;
  advancers?: number;
  decliners?: number;
  topTickers?: string[];
  x: number;
  y: number;
}

export const SectorTreemapD3: React.FC<SectorTreemapD3Props> = ({
  stocks,
  currentTheme,
  selectedStock,
  onSelectStock,
  selectedSectorFilter,
  onSelectSectorFilter,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const prevLayoutKeyRef = useRef<string>('');

  // Researcher state controls
  const [hoveredNode, setHoveredNode] = useState<HoveredNodeInfo | null>(null);
  const [colorCoding, setColorCoding] = useState<'performance' | 'categorical'>('performance');
  const [sizeMetric, setSizeMetric] = useState<'marketCap' | 'volume'>('marketCap');
  const [selectedIndustryFilter, setSelectedIndustryFilter] = useState<string | null>(null);
  const [groupByIndustry, setGroupByIndustry] = useState<boolean>(true);
  const [overviewMode, setOverviewMode] = useState<'sectors' | 'all-nested'>('sectors');

  // Reset industry filter whenever sector changes
  useEffect(() => {
    setSelectedIndustryFilter(null);
  }, [selectedSectorFilter]);

  // Keyboard shortcut: Press Escape to collapse back to Universe overview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedIndustryFilter) {
          setSelectedIndustryFilter(null);
        } else if (selectedSectorFilter) {
          onSelectSectorFilter(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSectorFilter, selectedIndustryFilter, onSelectSectorFilter]);

  // Compute sector summaries across the whole active universe
  const sectorSummaries = useMemo(() => {
    const map = new Map<
      string,
      {
        totalCap: number;
        totalVolume: number;
        count: number;
        advancers: number;
        decliners: number;
        stocks: StockQuote[];
      }
    >();

    stocks.forEach((s) => {
      const sec = s.sector || 'Other';
      const existing = map.get(sec) || {
        totalCap: 0,
        totalVolume: 0,
        count: 0,
        advancers: 0,
        decliners: 0,
        stocks: [],
      };
      existing.totalCap += s.marketCap || 1;
      existing.totalVolume += s.volume || 0;
      existing.count += 1;
      if (s.changePercent > 0) existing.advancers += 1;
      else if (s.changePercent < 0) existing.decliners += 1;
      existing.stocks.push(s);
      map.set(sec, existing);
    });

    const totalUniverseCap = Array.from(map.values()).reduce((acc, v) => acc + v.totalCap, 0) || 1;

    const list = Array.from(map.entries()).map(([sec, val]) => {
      const avgChg =
        val.stocks.reduce((acc, s) => acc + s.changePercent, 0) / (val.stocks.length || 1);
      const sortedStocks = [...val.stocks].sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

      return {
        sector: sec,
        totalCap: val.totalCap,
        totalCapFormatted: formatLargeNumber(val.totalCap),
        totalVolume: val.totalVolume,
        count: val.count,
        advancers: val.advancers,
        decliners: val.decliners,
        avgReturn: Number(avgChg.toFixed(2)),
        sharePct: Number(((val.totalCap / totalUniverseCap) * 100).toFixed(1)),
        topTickers: sortedStocks.slice(0, 3).map((s) => s.symbol),
        stocks: val.stocks,
      };
    });

    return list.sort((a, b) => b.totalCap - a.totalCap);
  }, [stocks]);

  // Active expanded sector metrics for researchers
  const activeSectorMetrics = useMemo(() => {
    if (!selectedSectorFilter) return null;
    const summary = sectorSummaries.find((s) => s.sector === selectedSectorFilter);
    if (!summary) return null;

    const sectorStocks = summary.stocks;
    const sortedByReturn = [...sectorStocks].sort((a, b) => b.changePercent - a.changePercent);
    const topGainer = sortedByReturn[0];
    const topLoser = sortedByReturn[sortedByReturn.length - 1];

    // Compute average P/E of sector (excluding non-positive or missing)
    const validPes = sectorStocks.map((s) => s.peRatio).filter((pe) => pe && pe > 0);
    const avgPe = validPes.length > 0 ? (validPes.reduce((a, b) => a + b, 0) / validPes.length).toFixed(1) : 'N/A';

    // Industry breakdown within this sector
    const indMap = new Map<string, { count: number; totalCap: number; avgReturn: number; stocks: StockQuote[] }>();
    sectorStocks.forEach((s) => {
      const ind = s.industry || 'General';
      const cur = indMap.get(ind) || { count: 0, totalCap: 0, avgReturn: 0, stocks: [] };
      cur.count += 1;
      cur.totalCap += s.marketCap || 0;
      cur.stocks.push(s);
      indMap.set(ind, cur);
    });

    const industries = Array.from(indMap.entries())
      .map(([industry, data]) => {
        const avg = data.stocks.reduce((a, s) => a + s.changePercent, 0) / (data.stocks.length || 1);
        return {
          industry,
          count: data.count,
          totalCap: data.totalCap,
          avgReturn: Number(avg.toFixed(2)),
        };
      })
      .sort((a, b) => b.totalCap - a.totalCap);

    return {
      ...summary,
      topGainer,
      topLoser,
      avgPe,
      industries,
    };
  }, [selectedSectorFilter, sectorSummaries]);

  // Build Treemap Data based on current mode and expansion
  const rootData: TreemapDatum = useMemo(() => {
    // 1. EXPANDED SECTOR VIEW: Deep dive into individual stocks within the chosen sector
    if (selectedSectorFilter) {
      const sectorStocks = stocks.filter((s) => {
        if (s.sector !== selectedSectorFilter) return false;
        if (selectedIndustryFilter && s.industry !== selectedIndustryFilter) return false;
        return true;
      });

      if (groupByIndustry) {
        // Group by Industry nodes
        const indMap = new Map<string, StockQuote[]>();
        sectorStocks.forEach((stk) => {
          const ind = stk.industry || 'General';
          const list = indMap.get(ind) || [];
          list.push(stk);
          indMap.set(ind, list);
        });

        const industryChildren: TreemapDatum[] = [];
        indMap.forEach((indStocks, indName) => {
          const stockChildren: TreemapDatum[] = indStocks.map((stk) => ({
            name: stk.symbol,
            type: 'stock',
            symbol: stk.symbol,
            price: stk.price,
            currency: stk.currency,
            change: stk.change,
            changePercent: stk.changePercent,
            marketCap: stk.marketCap || 1e9,
            marketCapFormatted: stk.marketCapFormatted,
            volume: stk.volume || 0,
            peRatio: stk.peRatio,
            sector: stk.sector,
            industry: stk.industry,
            stock: stk,
          }));

          industryChildren.push({
            name: indName,
            type: 'industry',
            industry: indName,
            sector: selectedSectorFilter,
            children: stockChildren,
          });
        });

        return {
          name: selectedSectorFilter,
          type: 'sector',
          sector: selectedSectorFilter,
          children: industryChildren,
        };
      }

      // Flat stock tiles for this sector
      const stockChildren: TreemapDatum[] = sectorStocks.map((stk) => ({
        name: stk.symbol,
        type: 'stock',
        symbol: stk.symbol,
        price: stk.price,
        currency: stk.currency,
        change: stk.change,
        changePercent: stk.changePercent,
        marketCap: stk.marketCap || 1e9,
        marketCapFormatted: stk.marketCapFormatted,
        volume: stk.volume || 0,
        peRatio: stk.peRatio,
        sector: stk.sector,
        industry: stk.industry,
        stock: stk,
      }));

      return {
        name: selectedSectorFilter,
        type: 'sector',
        sector: selectedSectorFilter,
        children: stockChildren,
      };
    }

    // 2. UNIVERSE OVERVIEW: SECTOR NODES (Click on sector node expands individual stocks)
    if (overviewMode === 'sectors') {
      const sectorNodes: TreemapDatum[] = sectorSummaries.map((sec) => ({
        name: sec.sector,
        type: 'sector',
        sector: sec.sector,
        marketCap: sec.totalCap,
        marketCapFormatted: sec.totalCapFormatted,
        volume: sec.totalVolume,
        constituentCount: sec.count,
        advancers: sec.advancers,
        decliners: sec.decliners,
        avgReturn: sec.avgReturn,
      }));

      return {
        name: 'Universe Overview',
        type: 'root',
        children: sectorNodes,
      };
    }

    // 3. UNIVERSE OVERVIEW: ALL STOCKS NESTED
    const sectorMap = new Map<string, StockQuote[]>();
    stocks.forEach((s) => {
      const sec = s.sector || 'Other';
      const list = sectorMap.get(sec) || [];
      list.push(s);
      sectorMap.set(sec, list);
    });

    const children: TreemapDatum[] = [];
    sectorMap.forEach((sectorStocks, sectorName) => {
      const stockNodes: TreemapDatum[] = sectorStocks.map((stk) => ({
        name: stk.symbol,
        type: 'stock',
        symbol: stk.symbol,
        price: stk.price,
        currency: stk.currency,
        change: stk.change,
        changePercent: stk.changePercent,
        marketCap: stk.marketCap || 1e9,
        marketCapFormatted: stk.marketCapFormatted,
        volume: stk.volume || 0,
        peRatio: stk.peRatio,
        sector: stk.sector,
        industry: stk.industry,
        stock: stk,
      }));

      children.push({
        name: sectorName,
        type: 'sector',
        sector: sectorName,
        children: stockNodes,
      });
    });

    return {
      name: 'Universe Overview',
      type: 'root',
      children,
    };
  }, [
    stocks,
    selectedSectorFilter,
    selectedIndustryFilter,
    sectorSummaries,
    overviewMode,
    groupByIndustry,
  ]);

  // D3 Rendering with High-Performance In-Place Updates
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    // Provide generous height for researchers, especially when expanded
    const height = selectedSectorFilter ? Math.max(420, Math.round(width * 0.46)) : Math.max(360, Math.round(width * 0.42));

    const layoutKey = `${selectedSectorFilter || 'all'}_${selectedIndustryFilter || 'all'}_${overviewMode}_${sizeMetric}_${groupByIndustry}_${stocks.length}_${currentTheme.id}_${width}_${height}`;
    const svg = d3.select(svgRef.current);

    // High-performance in-place update for streaming price ticks (bypasses full SVG teardown)
    const existingTiles = svg.selectAll<SVGGElement, d3.HierarchyRectangularNode<TreemapDatum>>('.treemap-tile');
    if (!existingTiles.empty() && prevLayoutKeyRef.current === layoutKey) {
      existingTiles.each(function (d) {
        const datum = d.data;
        if (datum.symbol) {
          const fresh = stocks.find((s) => s.symbol === datum.symbol);
          if (fresh) {
            datum.price = fresh.price;
            datum.change = fresh.change;
            datum.changePercent = fresh.changePercent;
            datum.stock = fresh;
          }
        }
        const cell = d3.select(this);
        const chg = datum.type === 'stock' ? (datum.changePercent || 0) : (datum.avgReturn || 0);

        if (colorCoding !== 'categorical') {
          let targetColor = currentTheme.gainColor;
          if (chg >= 2.0) targetColor = currentTheme.gainColor;
          else if (chg > 0) targetColor = d3.color(currentTheme.gainColor)?.copy({ opacity: 0.85 }).toString() || currentTheme.gainColor;
          else if (chg === 0) targetColor = '#475569';
          else if (chg > -2.0) targetColor = d3.color(currentTheme.lossColor)?.copy({ opacity: 0.85 }).toString() || currentTheme.lossColor;
          else targetColor = currentTheme.lossColor;

          cell.select('.tile-rect')
            .transition()
            .duration(300)
            .attr('fill', targetColor);
        }

        cell.select('.tile-change')
          .text(`${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%`);
      });
      return;
    }

    prevLayoutKeyRef.current = layoutKey;
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('font-family', 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif');

    // Hierarchy based on chosen metric (Market Cap or Volume)
    const root = d3
      .hierarchy<TreemapDatum>(rootData)
      .sum((d) => (sizeMetric === 'marketCap' ? d.marketCap || 0 : d.volume || 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Construct Treemap
    const isShowingSectorNodes = !selectedSectorFilter && overviewMode === 'sectors';
    const isShowingIndustryGrouping = Boolean(selectedSectorFilter && groupByIndustry);

    d3
      .treemap<TreemapDatum>()
      .tile(d3.treemapBinary)
      .size([width, height])
      .paddingOuter(isShowingSectorNodes ? 5 : 4)
      .paddingTop((d) => {
        if (d.depth === 1 && isShowingIndustryGrouping) return 19; // Industry banner
        if (d.depth === 1 && !selectedSectorFilter && overviewMode === 'all-nested') return 20; // Sector banner
        return 2;
      })
      .paddingInner(3)
      .round(true)(root);

    // Qualitative categorical palette
    const colorPalette = d3
      .scaleOrdinal<string>()
      .range([
        '#3b82f6', // blue
        '#10b981', // emerald
        '#8b5cf6', // violet
        '#f59e0b', // amber
        '#06b6d4', // cyan
        '#ec4899', // pink
        '#6366f1', // indigo
        '#14b8a6', // teal
        '#f97316', // orange
        '#84cc16', // lime
      ]);

    // Group containers (e.g. Industry headers when grouped inside expanded sector, or Sector banners in all-nested)
    if (isShowingIndustryGrouping || (!selectedSectorFilter && overviewMode === 'all-nested')) {
      const intermediateNodes = root.descendants().filter((d) => d.depth === 1 && d.children);

      const groupG = svg
        .selectAll('.group-header')
        .data(intermediateNodes)
        .enter()
        .append('g')
        .attr('class', 'group-header');

      groupG
        .append('rect')
        .attr('x', (d: any) => d.x0)
        .attr('y', (d: any) => d.y0)
        .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
        .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
        .attr('fill', currentTheme.cardBg)
        .attr('stroke', currentTheme.cardBorder)
        .attr('stroke-width', 1.2)
        .attr('rx', 5);

      groupG
        .append('text')
        .attr('x', (d: any) => d.x0 + 7)
        .attr('y', (d: any) => d.y0 + 13)
        .attr('fill', currentTheme.textSecondary)
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .attr('letter-spacing', '0.04em')
        .text((d) => {
          const w = (d as any).x1 - (d as any).x0;
          if (w < 80) return '';
          const name = d.data.name;
          const valFormatted =
            sizeMetric === 'marketCap'
              ? formatLargeNumber(d.value || 0)
              : `${((d.value || 0) / 1e6).toFixed(1)}M vol`;
          return w > 160 ? `${name.toUpperCase()} (${valFormatted})` : name.toUpperCase();
        })
        .style('cursor', (d) => (d.data.type === 'sector' ? 'pointer' : 'default'))
        .on('click', (_, d) => {
          if (d.data.type === 'sector' && !selectedSectorFilter) {
            onSelectSectorFilter(d.data.name);
          }
        });
    }

    // Leaf Nodes (Either Sector Nodes in overview OR Individual Stock Nodes in expanded view)
    const leaves = root.leaves();

    const cellG = svg
      .selectAll('.treemap-tile')
      .data(leaves)
      .enter()
      .append('g')
      .attr('class', 'treemap-tile')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    // Rectangles
    cellG
      .append('rect')
      .attr('class', 'tile-rect')
      .attr('id', (d) => `treemap-tile-${d.data.symbol || d.data.name.replace(/\s+/g, '-')}`)
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('rx', isShowingSectorNodes ? 6 : 4)
      .attr('stroke', (d) => {
        if (d.data.type === 'stock' && selectedStock?.symbol === d.data.symbol) {
          return '#ffffff';
        }
        return currentTheme.cardBorder;
      })
      .attr('stroke-width', (d) => {
        if (d.data.type === 'stock' && selectedStock?.symbol === d.data.symbol) return 2.5;
        if (d.data.type === 'sector') return 1.5;
        return 1;
      })
      .attr('fill', (d) => {
        // Mode 1: Sector Nodes Treemap
        if (d.data.type === 'sector') {
          if (colorCoding === 'categorical') {
            return colorPalette(d.data.name);
          }
          const avgRet = d.data.avgReturn || 0;
          if (avgRet >= 1.5) return currentTheme.gainColor;
          if (avgRet > 0) return d3.color(currentTheme.gainColor)?.copy({ opacity: 0.85 }).toString() || currentTheme.gainColor;
          if (avgRet === 0) return '#475569';
          if (avgRet > -1.5) return d3.color(currentTheme.lossColor)?.copy({ opacity: 0.85 }).toString() || currentTheme.lossColor;
          return currentTheme.lossColor;
        }

        // Mode 2: Stock Nodes Treemap
        if (colorCoding === 'categorical') {
          const cat = d.data.industry || d.data.sector || 'Other';
          const base = colorPalette(cat);
          return (d.data.changePercent || 0) >= 0 ? base : d3.color(base)?.darker(0.75)?.toString() || base;
        }

        const chg = d.data.changePercent || 0;
        if (chg >= 2.5) return currentTheme.gainColor;
        if (chg > 0) return d3.color(currentTheme.gainColor)?.copy({ opacity: 0.8 }).toString() || currentTheme.gainColor;
        if (chg === 0) return '#475569';
        if (chg > -2.5) return d3.color(currentTheme.lossColor)?.copy({ opacity: 0.8 }).toString() || currentTheme.lossColor;
        return currentTheme.lossColor;
      })
      .attr('opacity', 0.92)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d: any) {
        d3.select(this).attr('opacity', 1).attr('stroke', '#ffffff').attr('stroke-width', 2);
        const [mx, my] = d3.pointer(event, svg.node());

        // SECTOR NODE HOVER
        if (d.data.type === 'sector') {
          const secSummary = sectorSummaries.find((s) => s.sector === d.data.name);
          setHoveredNode({
            type: 'sector',
            title: d.data.name,
            subtitle: `${d.data.constituentCount || 0} Universe Constituents`,
            sector: d.data.name,
            marketCap: d.data.marketCap || 0,
            marketCapFormatted: d.data.marketCapFormatted || formatLargeNumber(d.data.marketCap || 0),
            marketSharePct: secSummary?.sharePct,
            changePercent: d.data.avgReturn,
            constituentCount: d.data.constituentCount,
            advancers: d.data.advancers,
            decliners: d.data.decliners,
            topTickers: secSummary?.topTickers,
            x: mx,
            y: my,
          });
          return;
        }

        // STOCK NODE HOVER
        if (d.data.type === 'stock') {
          const s = d.data.stock;
          setHoveredNode({
            type: 'stock',
            title: d.data.symbol || d.data.name,
            subtitle: s?.name || d.data.industry || '',
            sector: d.data.sector,
            industry: d.data.industry,
            marketCap: d.data.marketCap || 0,
            marketCapFormatted: d.data.marketCapFormatted || formatLargeNumber(d.data.marketCap || 0),
            changePercent: d.data.changePercent,
            price: d.data.price,
            currency: d.data.currency,
            volume: d.data.volume,
            peRatio: s?.peRatio,
            week52High: s?.week52High,
            week52Low: s?.week52Low,
            x: mx,
            y: my,
          });
        }
      })
      .on('mouseleave', function (_, d: any) {
        d3.select(this)
          .attr('opacity', 0.92)
          .attr('stroke', () => {
            if (d.data.type === 'stock' && selectedStock?.symbol === d.data.symbol) return '#ffffff';
            return currentTheme.cardBorder;
          })
          .attr('stroke-width', () => {
            if (d.data.type === 'stock' && selectedStock?.symbol === d.data.symbol) return 2.5;
            return 1;
          });
        setHoveredNode(null);
      })
      .on('click', (_, d: any) => {
        // CLICK ON SECTOR NODE -> EXPAND TO INDIVIDUAL STOCKS WITHIN THAT SECTOR
        if (d.data.type === 'sector') {
          onSelectSectorFilter(d.data.name);
          return;
        }

        // CLICK ON STOCK NODE -> SELECT STOCK FOR DEEP DIVE
        if (d.data.type === 'stock' && d.data.stock && onSelectStock) {
          onSelectStock(d.data.stock);
        }
      });

    // ============================================
    // LABELS FOR SECTOR NODES (Overview Level)
    // ============================================
    if (isShowingSectorNodes) {
      // Sector Name
      cellG
        .append('text')
        .attr('x', 9)
        .attr('y', 20)
        .attr('fill', '#ffffff')
        .attr('font-size', (d: any) => {
          const w = d.x1 - d.x0;
          const h = d.y1 - d.y0;
          if (w < 60 || h < 40) return '0px';
          if (w < 110 || h < 60) return '11px';
          return '14px';
        })
        .attr('font-weight', '800')
        .attr('letter-spacing', '0.02em')
        .text((d) => d.data.name)
        .style('pointer-events', 'none');

      // Valuation & Share %
      cellG
        .append('text')
        .attr('x', 9)
        .attr('y', 38)
        .attr('fill', '#ffffff')
        .attr('opacity', 0.95)
        .attr('font-size', (d: any) => {
          const w = d.x1 - d.x0;
          const h = d.y1 - d.y0;
          if (w < 85 || h < 55) return '0px';
          return '11px';
        })
        .attr('font-family', 'monospace')
        .attr('font-weight', '700')
        .text((d) => {
          const summary = sectorSummaries.find((s) => s.sector === d.data.name);
          return `${d.data.marketCapFormatted} (${summary?.sharePct}% share)`;
        })
        .style('pointer-events', 'none');

      // Return & Constituent Count
      cellG
        .append('text')
        .attr('x', 9)
        .attr('y', 55)
        .attr('fill', '#ffffff')
        .attr('font-size', (d: any) => {
          const w = d.x1 - d.x0;
          const h = d.y1 - d.y0;
          if (w < 100 || h < 75) return '0px';
          return '10.5px';
        })
        .attr('font-family', 'monospace')
        .attr('font-weight', '700')
        .text((d) => {
          const ret = d.data.avgReturn || 0;
          return `${ret >= 0 ? '+' : ''}${ret.toFixed(2)}% avg • ${d.data.constituentCount} stocks`;
        })
        .style('pointer-events', 'none');

      // Prompt to Expand (Visible on sufficiently sized tiles)
      cellG
        .append('text')
        .attr('x', 9)
        .attr('y', (d: any) => (d.y1 - d.y0) - 10)
        .attr('fill', '#ffffff')
        .attr('opacity', 0.75)
        .attr('font-size', (d: any) => {
          const w = d.x1 - d.x0;
          const h = d.y1 - d.y0;
          if (w < 120 || h < 95) return '0px';
          return '9.5px';
        })
        .attr('font-weight', '600')
        .text('Click to expand individual stocks ↗')
        .style('pointer-events', 'none');
    }

    // ============================================
    // LABELS FOR STOCK NODES (Expanded Sector Level)
    // ============================================
    if (!isShowingSectorNodes) {
      // Stock Symbol (bold primary)
      cellG
        .append('text')
        .attr('x', 6)
        .attr('y', 16)
        .attr('fill', '#ffffff')
        .attr('font-size', (d: any) => {
          const w = d.x1 - d.x0;
          const h = d.y1 - d.y0;
          if (w < 38 || h < 24) return '0px';
          if (w < 60 || h < 38) return '10px';
          if (w < 100 || h < 60) return '12.5px';
          return '14px';
        })
        .attr('font-weight', '900')
        .attr('font-family', 'monospace')
        .text((d) => d.data.symbol || d.data.name)
        .style('pointer-events', 'none');

      // Price Change %
      cellG
        .append('text')
        .attr('class', 'tile-change')
        .attr('x', 6)
        .attr('y', (d: any) => {
          const h = d.y1 - d.y0;
          return h > 50 ? 32 : 28;
        })
        .attr('fill', '#ffffff')
        .attr('opacity', 0.95)
        .attr('font-size', (d: any) => {
          const w = d.x1 - d.x0;
          const h = d.y1 - d.y0;
          if (w < 44 || h < 34) return '0px';
          return '10.5px';
        })
        .attr('font-weight', '700')
        .attr('font-family', 'monospace')
        .text((d) => {
          const pct = d.data.changePercent ?? 0;
          return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
        })
        .style('pointer-events', 'none');

      // Company Name (when expanded and tile is spacious)
      cellG
        .append('text')
        .attr('x', 6)
        .attr('y', 46)
        .attr('fill', '#ffffff')
        .attr('opacity', 0.85)
        .attr('font-size', (d: any) => {
          const w = d.x1 - d.x0;
          const h = d.y1 - d.y0;
          if (w < 90 || h < 65) return '0px';
          return '9.5px';
        })
        .attr('font-weight', '500')
        .text((d) => {
          const name = d.data.stock?.name || '';
          return name.length > 18 ? `${name.substring(0, 16)}...` : name;
        })
        .style('pointer-events', 'none');

      // Market Cap / Sizing Metric Label
      cellG
        .append('text')
        .attr('x', 6)
        .attr('y', (d: any) => {
          const h = d.y1 - d.y0;
          return h > 75 ? 60 : 45;
        })
        .attr('fill', '#ffffff')
        .attr('opacity', 0.75)
        .attr('font-size', (d: any) => {
          const w = d.x1 - d.x0;
          const h = d.y1 - d.y0;
          if (w < 70 || h < 50) return '0px';
          return '9px';
        })
        .attr('font-family', 'monospace')
        .text((d) => {
          if (sizeMetric === 'volume') {
            return `${((d.data.volume || 0) / 1e6).toFixed(1)}M vol`;
          }
          return d.data.marketCapFormatted || '';
        })
        .style('pointer-events', 'none');
    }
  }, [
    rootData,
    currentTheme,
    colorCoding,
    sizeMetric,
    selectedStock,
    selectedSectorFilter,
    overviewMode,
    groupByIndustry,
    sectorSummaries,
    onSelectStock,
    onSelectSectorFilter,
  ]);

  return (
    <div id="sector-treemap-widget-container" className="space-y-3">
      {/* ========================================================================= */}
      {/* 1. COMPACT TOOLBAR & STATUS */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: View State / Sector Context */}
        <div className="flex items-center gap-2">
          {selectedSectorFilter ? (
            <div className="flex items-center gap-1.5">
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                  borderColor: `${currentTheme.accent}40`,
                  color: currentTheme.accent,
                }}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>{selectedSectorFilter}</span>
              </span>

              {selectedIndustryFilter && (
                <span
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono border"
                  style={{
                    backgroundColor: `${currentTheme.bg}70`,
                    borderColor: currentTheme.cardBorder,
                    color: currentTheme.textSecondary,
                  }}
                >
                  {selectedIndustryFilter}
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  onSelectSectorFilter(null);
                  setSelectedIndustryFilter(null);
                }}
                className="px-2 py-1 rounded-lg border text-xs font-mono transition-colors opacity-70 hover:opacity-100 flex items-center gap-1"
                style={{
                  borderColor: currentTheme.cardBorder,
                  color: currentTheme.textSecondary,
                }}
                title="Return to all sectors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>All Sectors</span>
              </button>
            </div>
          ) : (
            <span className="text-xs font-mono" style={{ color: currentTheme.textMuted }}>
              Click any sector tile to expand constituents
            </span>
          )}
        </div>

        {/* Right: Sizing & Display Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Size Metric Selector (Market Cap vs Volume) */}
          <div
            className="flex items-center p-0.5 rounded-lg border text-[11px]"
            style={{
              backgroundColor: `${currentTheme.bg}80`,
              borderColor: currentTheme.cardBorder,
            }}
          >
            <button
              type="button"
              onClick={() => setSizeMetric('marketCap')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                sizeMetric === 'marketCap' ? 'font-semibold' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: sizeMetric === 'marketCap' ? currentTheme.accent : 'transparent',
                color: sizeMetric === 'marketCap' ? '#ffffff' : currentTheme.textSecondary,
              }}
              title="Size tiles by Market Capitalization"
            >
              Cap
            </button>
            <button
              type="button"
              onClick={() => setSizeMetric('volume')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                sizeMetric === 'volume' ? 'font-semibold' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: sizeMetric === 'volume' ? currentTheme.accent : 'transparent',
                color: sizeMetric === 'volume' ? '#ffffff' : currentTheme.textSecondary,
              }}
              title="Size tiles by Volume"
            >
              Vol
            </button>
          </div>

          {/* Color Mode Toggle */}
          <div
            className="flex items-center p-0.5 rounded-lg border text-[11px]"
            style={{
              backgroundColor: `${currentTheme.bg}80`,
              borderColor: currentTheme.cardBorder,
            }}
          >
            <button
              type="button"
              onClick={() => setColorCoding('performance')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                colorCoding === 'performance' ? 'font-semibold' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: colorCoding === 'performance' ? currentTheme.accent : 'transparent',
                color: colorCoding === 'performance' ? '#ffffff' : currentTheme.textSecondary,
              }}
            >
              Heatmap
            </button>
            <button
              type="button"
              onClick={() => setColorCoding('categorical')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                colorCoding === 'categorical' ? 'font-semibold' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: colorCoding === 'categorical' ? currentTheme.accent : 'transparent',
                color: colorCoding === 'categorical' ? '#ffffff' : currentTheme.textSecondary,
              }}
            >
              Category
            </button>
          </div>

          {/* Sizing / Nesting or Industry Grouping */}
          {!selectedSectorFilter ? (
            <button
              type="button"
              onClick={() => setOverviewMode(overviewMode === 'sectors' ? 'all-nested' : 'sectors')}
              className="px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all opacity-70 hover:opacity-100"
              style={{
                borderColor: currentTheme.cardBorder,
                color: currentTheme.textSecondary,
              }}
              title="Toggle between Sector Nodes vs All Constituent Tiles"
            >
              {overviewMode === 'sectors' ? 'View All Stocks' : 'Group by Sector'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setGroupByIndustry(!groupByIndustry)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all flex items-center gap-1 ${
                groupByIndustry ? 'font-semibold' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: groupByIndustry ? `${currentTheme.accent}15` : 'transparent',
                borderColor: groupByIndustry ? currentTheme.accent : currentTheme.cardBorder,
                color: groupByIndustry ? currentTheme.accent : currentTheme.textSecondary,
              }}
              title="Toggle grouping stocks by sub-industry within this sector"
            >
              <Layers className="w-3 h-3" />
              <span>Industries</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RESEARCHER INTELLIGENCE BAR (Visible when a sector is expanded) */}
      {/* ========================================================================= */}
      {activeSectorMetrics && (
        <div
          className="px-3 py-1.5 rounded-lg border flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
          style={{
            backgroundColor: `${currentTheme.cardBg}60`,
            borderColor: currentTheme.cardBorder,
          }}
        >
          {/* Metrics summary */}
          <div className="flex items-center gap-3 flex-wrap text-[11px]">
            <div>
              <span style={{ color: currentTheme.textMuted }}>Valuation: </span>
              <span className="font-semibold" style={{ color: currentTheme.textPrimary }}>
                {activeSectorMetrics.totalCapFormatted} ({activeSectorMetrics.sharePct}%)
              </span>
            </div>

            <div className="h-3 w-px bg-slate-700/50 hidden sm:block" />

            <div>
              <span style={{ color: currentTheme.textMuted }}>Count: </span>
              <span className="font-semibold" style={{ color: currentTheme.textPrimary }}>
                {activeSectorMetrics.count} stocks
              </span>
            </div>

            <div className="h-3 w-px bg-slate-700/50 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <span style={{ color: currentTheme.textMuted }}>Breadth: </span>
              <span className="font-semibold" style={{ color: currentTheme.gainColor }}>
                {activeSectorMetrics.advancers}▲
              </span>
              <span className="opacity-40">/</span>
              <span className="font-semibold" style={{ color: currentTheme.lossColor }}>
                {activeSectorMetrics.decliners}▼
              </span>
            </div>

            <div className="h-3 w-px bg-slate-700/50 hidden sm:block" />

            <div>
              <span style={{ color: currentTheme.textMuted }}>Avg P/E: </span>
              <span className="font-semibold" style={{ color: currentTheme.textPrimary }}>
                {activeSectorMetrics.avgPe}x
              </span>
            </div>
          </div>

          {/* Leaders */}
          <div className="flex items-center gap-3 text-[11px]">
            {activeSectorMetrics.topGainer && (
              <div className="flex items-center gap-1">
                <span style={{ color: currentTheme.textMuted }}>Top: </span>
                <span className="font-semibold" style={{ color: currentTheme.gainColor }}>
                  {activeSectorMetrics.topGainer.symbol} (+{activeSectorMetrics.topGainer.changePercent.toFixed(1)}%)
                </span>
              </div>
            )}
            {activeSectorMetrics.topLoser && (
              <div className="flex items-center gap-1">
                <span style={{ color: currentTheme.textMuted }}>Laggard: </span>
                <span className="font-semibold" style={{ color: currentTheme.lossColor }}>
                  {activeSectorMetrics.topLoser.symbol} ({activeSectorMetrics.topLoser.changePercent.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-INDUSTRY PILLS (When expanded) */}
      {/* ========================================================================= */}
      {selectedSectorFilter && activeSectorMetrics && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-mono shrink-0 mr-1" style={{ color: currentTheme.textMuted }}>
            Filter Industry:
          </span>
          <button
            type="button"
            onClick={() => setSelectedIndustryFilter(null)}
            className={`px-2.5 py-1 rounded-lg border shrink-0 transition-all font-mono text-[11px] ${
              selectedIndustryFilter === null ? 'shadow-xs font-bold' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor:
                selectedIndustryFilter === null ? `${currentTheme.accent}25` : `${currentTheme.bg}60`,
              borderColor: selectedIndustryFilter === null ? currentTheme.accent : currentTheme.cardBorder,
              color: selectedIndustryFilter === null ? currentTheme.accent : currentTheme.textSecondary,
            }}
          >
            All Industries ({activeSectorMetrics.count})
          </button>

          {activeSectorMetrics.industries.map((ind) => {
            const isSelected = selectedIndustryFilter === ind.industry;
            return (
              <button
                key={ind.industry}
                type="button"
                onClick={() => setSelectedIndustryFilter(isSelected ? null : ind.industry)}
                className={`px-2.5 py-1 rounded-lg border shrink-0 transition-all text-[11px] font-mono flex items-center gap-1.5 ${
                  isSelected ? 'shadow-xs font-bold' : 'opacity-75 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isSelected ? `${currentTheme.accent}25` : `${currentTheme.bg}60`,
                  borderColor: isSelected ? currentTheme.accent : currentTheme.cardBorder,
                  color: isSelected ? currentTheme.accent : currentTheme.textPrimary,
                }}
              >
                <span>{ind.industry}</span>
                <span className="opacity-60 text-[10px]">({ind.count})</span>
                <span
                  className="font-bold text-[10px]"
                  style={{ color: ind.avgReturn >= 0 ? currentTheme.gainColor : currentTheme.lossColor }}
                >
                  {ind.avgReturn >= 0 ? '+' : ''}
                  {ind.avgReturn}%
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. D3 TREEMAP SVG CANVAS */}
      {/* ========================================================================= */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden border p-2 bg-slate-950/25 shadow-inner select-none transition-all"
        style={{
          borderColor: currentTheme.cardBorder,
        }}
      >
        <svg ref={svgRef} className="w-full h-auto block" />

        {/* Hover Tooltip Overlay with Financial Details */}
        {hoveredNode && (
          <div
            className="absolute pointer-events-none z-30 px-3 py-2.5 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-75 text-xs max-w-xs"
            style={{
              left: Math.max(
                12,
                Math.min(hoveredNode.x + 16, (containerRef.current?.clientWidth || 500) - 260)
              ),
              top: Math.max(12, Math.min(hoveredNode.y + 16, 360)),
              backgroundColor: `${currentTheme.cardBg}fa`,
              borderColor: currentTheme.accent,
              color: currentTheme.textPrimary,
              boxShadow: `0 10px 25px -5px ${currentTheme.cardBorder}, 0 0 12px ${currentTheme.accent}30`,
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="font-black text-sm font-mono tracking-wide" style={{ color: currentTheme.textPrimary }}>
                {hoveredNode.title}
              </span>
              {hoveredNode.changePercent !== undefined && (
                <span
                  className="px-1.5 py-0.5 rounded text-[10.5px] font-mono font-bold shrink-0"
                  style={{
                    backgroundColor:
                      hoveredNode.changePercent >= 0
                        ? `${currentTheme.gainColor}25`
                        : `${currentTheme.lossColor}25`,
                    color:
                      hoveredNode.changePercent >= 0
                        ? currentTheme.gainColor
                        : currentTheme.lossColor,
                  }}
                >
                  {hoveredNode.changePercent >= 0 ? '+' : ''}
                  {hoveredNode.changePercent.toFixed(2)}%
                </span>
              )}
            </div>

            <div className="text-[11px] truncate opacity-85 mb-2 font-medium" style={{ color: currentTheme.textSecondary }}>
              {hoveredNode.subtitle}
            </div>

            {/* SECTOR NODE DETAILS */}
            {hoveredNode.type === 'sector' && (
              <div className="space-y-1 pt-1.5 border-t text-[11px] font-mono" style={{ borderColor: currentTheme.cardBorder }}>
                <div className="flex items-center justify-between">
                  <span style={{ color: currentTheme.textMuted }}>Total Market Cap:</span>
                  <span className="font-bold" style={{ color: currentTheme.accent }}>
                    {hoveredNode.marketCapFormatted}
                  </span>
                </div>
                {hoveredNode.marketSharePct !== undefined && (
                  <div className="flex items-center justify-between">
                    <span style={{ color: currentTheme.textMuted }}>Universe Weight:</span>
                    <span className="font-semibold">{hoveredNode.marketSharePct}%</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span style={{ color: currentTheme.textMuted }}>Breadth Ratio:</span>
                  <span className="font-semibold">
                    <span style={{ color: currentTheme.gainColor }}>{hoveredNode.advancers} Adv</span> /{' '}
                    <span style={{ color: currentTheme.lossColor }}>{hoveredNode.decliners} Dec</span>
                  </span>
                </div>
                {hoveredNode.topTickers && hoveredNode.topTickers.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span style={{ color: currentTheme.textMuted }}>Top Holdings:</span>
                    <span className="font-semibold">{hoveredNode.topTickers.join(', ')}</span>
                  </div>
                )}
                <div className="mt-2 pt-1 border-t text-[10px] font-semibold text-center" style={{ color: currentTheme.accent }}>
                  Click sector to expand {hoveredNode.constituentCount} individual stocks ↗
                </div>
              </div>
            )}

            {/* STOCK NODE DETAILS */}
            {hoveredNode.type === 'stock' && (
              <div className="space-y-1 pt-1.5 border-t text-[11px] font-mono" style={{ borderColor: currentTheme.cardBorder }}>
                <div className="flex items-center justify-between">
                  <span style={{ color: currentTheme.textMuted }}>Sector / Industry:</span>
                  <span className="font-semibold truncate max-w-[140px] text-right">
                    {hoveredNode.industry || hoveredNode.sector}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: currentTheme.textMuted }}>Market Cap:</span>
                  <span className="font-bold" style={{ color: currentTheme.accent }}>
                    {hoveredNode.marketCapFormatted}
                  </span>
                </div>
                {hoveredNode.price !== undefined && (
                  <div className="flex items-center justify-between">
                    <span style={{ color: currentTheme.textMuted }}>Price:</span>
                    <span className="font-semibold">
                      {formatCurrency(hoveredNode.price, hoveredNode.currency || 'USD')}
                    </span>
                  </div>
                )}
                {hoveredNode.volume !== undefined && (
                  <div className="flex items-center justify-between">
                    <span style={{ color: currentTheme.textMuted }}>Volume:</span>
                    <span className="font-semibold">
                      {formatLargeNumber(hoveredNode.volume)}
                    </span>
                  </div>
                )}
                {hoveredNode.peRatio !== undefined && hoveredNode.peRatio > 0 && (
                  <div className="flex items-center justify-between">
                    <span style={{ color: currentTheme.textMuted }}>P/E Ratio:</span>
                    <span className="font-semibold">{hoveredNode.peRatio.toFixed(1)}x</span>
                  </div>
                )}
                {hoveredNode.week52High !== undefined && hoveredNode.week52Low !== undefined && (
                  <div className="flex items-center justify-between">
                    <span style={{ color: currentTheme.textMuted }}>52W Range:</span>
                    <span className="text-[10px]">
                      ${hoveredNode.week52Low.toFixed(0)} - ${hoveredNode.week52High.toFixed(0)}
                    </span>
                  </div>
                )}
                <div className="mt-2 pt-1 border-t text-[9.5px] opacity-75 text-center" style={{ borderColor: currentTheme.cardBorder }}>
                  Click tile to open interactive deep-dive chart
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. LEGEND & RESEARCHER STATUS FOOTER */}
      {/* ========================================================================= */}
      <div
        className="flex flex-wrap items-center justify-between text-xs font-mono pt-1 border-t gap-2"
        style={{ borderColor: currentTheme.cardBorder, color: currentTheme.textSecondary }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[11px]" style={{ color: currentTheme.textMuted }}>
            Shading:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: currentTheme.gainColor }} />
            <span className="text-[11px]">Advancing (&gt;0%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#475569' }} />
            <span className="text-[11px]">Unchanged (0%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: currentTheme.lossColor }} />
            <span className="text-[11px]">Declining (&lt;0%)</span>
          </div>
        </div>

        <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>
          {selectedSectorFilter ? (
            <span>Viewing individual constituents • Press <strong>Esc</strong> to collapse back to all sectors</span>
          ) : (
            <span>Sized by {sizeMetric === 'marketCap' ? 'Market Capitalization' : 'Volume'} • Click any sector tile to expand individual stocks</span>
          )}
        </div>
      </div>
    </div>
  );
};
