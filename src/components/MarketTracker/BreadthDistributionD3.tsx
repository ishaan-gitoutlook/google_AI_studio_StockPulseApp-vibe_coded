import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { MarketBreadth, StockQuote, ThemeConfig } from '../../types';
import { BarChart3, PieChart, CircleDot, Layers, TrendingUp, TrendingDown, Percent, DollarSign, Activity } from 'lucide-react';
import { formatCurrency, formatLargeNumber } from '../../utils/marketEngine';

interface BreadthDistributionD3Props {
  stocks: StockQuote[];
  breadth: MarketBreadth;
  currentTheme: ThemeConfig;
  onSelectStock?: (stock: StockQuote) => void;
  selectedSymbol?: string;
}

type VizMode = 'histogram' | 'donut' | 'bubbles';

interface BucketData {
  label: string;
  range: [number, number];
  count: number;
  percentage: number;
  avgChange: number;
  stocks: StockQuote[];
  type: 'gain' | 'loss' | 'neutral';
}

interface TooltipInfo {
  title: string;
  badge?: string;
  badgeType?: 'gain' | 'loss' | 'neutral' | 'info';
  percentageValue: string;
  subtitle: string;
  metricLabel?: string;
  metricValue?: string;
  details: { label: string; value: string; isGain?: boolean; isLoss?: boolean }[];
  x: number;
  y: number;
}

export const BreadthDistributionD3: React.FC<BreadthDistributionD3Props> = ({
  stocks,
  breadth,
  currentTheme,
  onSelectStock,
  selectedSymbol,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevRenderKeyRef = useRef<string>('');
  const [vizMode, setVizMode] = useState<VizMode>('histogram');
  const [hoveredInfo, setHoveredInfo] = useState<TooltipInfo | null>(null);

  // Group stocks into quantitative return bins for the histogram
  const buckets: BucketData[] = useMemo(() => {
    const totalStocks = stocks.length || 1;
    const bins: BucketData[] = [
      { label: '< -3%', range: [-Infinity, -3], count: 0, percentage: 0, avgChange: 0, stocks: [], type: 'loss' },
      { label: '-3% to -1.5%', range: [-3, -1.5], count: 0, percentage: 0, avgChange: 0, stocks: [], type: 'loss' },
      { label: '-1.5% to 0%', range: [-1.5, -0.05], count: 0, percentage: 0, avgChange: 0, stocks: [], type: 'loss' },
      { label: '0% ±0.05%', range: [-0.05, 0.05], count: 0, percentage: 0, avgChange: 0, stocks: [], type: 'neutral' },
      { label: '0% to +1.5%', range: [0.05, 1.5], count: 0, percentage: 0, avgChange: 0, stocks: [], type: 'gain' },
      { label: '+1.5% to +3%', range: [1.5, 3], count: 0, percentage: 0, avgChange: 0, stocks: [], type: 'gain' },
      { label: '> +3%', range: [3, Infinity], count: 0, percentage: 0, avgChange: 0, stocks: [], type: 'gain' },
    ];

    stocks.forEach((stock) => {
      const pct = stock.changePercent;
      for (const b of bins) {
        if (pct >= b.range[0] && pct < b.range[1]) {
          b.count++;
          b.stocks.push(stock);
          break;
        }
      }
    });

    bins.forEach((b) => {
      b.percentage = Number(((b.count / totalStocks) * 100).toFixed(1));
      if (b.stocks.length > 0) {
        const sum = b.stocks.reduce((acc, s) => acc + s.changePercent, 0);
        b.avgChange = Number((sum / b.stocks.length).toFixed(2));
      }
    });

    return bins;
  }, [stocks]);

  // Main D3 Rendering Effect with Signature Memoization
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 550;
    const height = 220;

    const bucketSignature = buckets.map((b) => `${b.label}:${b.count}`).join('|');
    const renderKey = `${vizMode}_${currentTheme.id}_${width}_${bucketSignature}_${breadth.advancers}_${breadth.decliners}_${selectedSymbol || 'none'}`;

    if (prevRenderKeyRef.current === renderKey) {
      return;
    }
    prevRenderKeyRef.current = renderKey;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // clear previous canvas

    svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g');

    if (vizMode === 'histogram') {
      renderHistogram(g, width, height, buckets, stocks.length, currentTheme, (info) => setHoveredInfo(info));
    } else if (vizMode === 'donut') {
      renderDonut(g, width, height, breadth, stocks, currentTheme, (info) => setHoveredInfo(info));
    } else if (vizMode === 'bubbles') {
      renderBubbleSpread(g, width, height, stocks, currentTheme, selectedSymbol, onSelectStock, (info) =>
        setHoveredInfo(info)
      );
    }
  }, [stocks, breadth, currentTheme, vizMode, buckets, selectedSymbol, onSelectStock]);

  return (
    <div
      id="d3-breadth-distribution-widget"
      className="rounded-2xl border p-4 sm:p-5 transition-all shadow-xs"
      style={{
        backgroundColor: currentTheme.cardBg,
        borderColor: currentTheme.cardBorder,
      }}
    >
      {/* Header with Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded-lg shadow-xs"
            style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}
          >
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight" style={{ color: currentTheme.textPrimary }}>
                Real-Time Breadth Distribution (D3.js)
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
                INTERACTIVE TOOLTIPS
              </span>
            </div>
            <p className="text-[11px]" style={{ color: currentTheme.textMuted }}>
              Hover over bars, slices, or constituent nodes to inspect exact percentages & metrics
            </p>
          </div>
        </div>

        {/* Viz Mode Selector Pills */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl border bg-black/20"
          style={{ borderColor: currentTheme.cardBorder }}
        >
          <button
            id="breadth-d3-histogram-tab"
            onClick={() => setVizMode('histogram')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              vizMode === 'histogram' ? 'shadow-sm text-white' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              backgroundColor: vizMode === 'histogram' ? currentTheme.accent : 'transparent',
              color: vizMode === 'histogram' ? '#ffffff' : currentTheme.textSecondary,
            }}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Histogram</span>
          </button>

          <button
            id="breadth-d3-donut-tab"
            onClick={() => setVizMode('donut')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              vizMode === 'donut' ? 'shadow-sm text-white' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              backgroundColor: vizMode === 'donut' ? currentTheme.accent : 'transparent',
              color: vizMode === 'donut' ? '#ffffff' : currentTheme.textSecondary,
            }}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Radial Donut</span>
          </button>

          <button
            id="breadth-d3-bubbles-tab"
            onClick={() => setVizMode('bubbles')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              vizMode === 'bubbles' ? 'shadow-sm text-white' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              backgroundColor: vizMode === 'bubbles' ? currentTheme.accent : 'transparent',
              color: vizMode === 'bubbles' ? '#ffffff' : currentTheme.textSecondary,
            }}
          >
            <CircleDot className="w-3.5 h-3.5" />
            <span>Constituent Spread</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden select-none">
        <svg ref={svgRef} className="w-full overflow-visible" />

        {/* Enhanced Interactive Tooltip Overlay with Exact Percentages */}
        {hoveredInfo && (
          <div
            id="d3-interactive-tooltip"
            className="pointer-events-none absolute z-30 rounded-xl p-3 shadow-2xl border backdrop-blur-md text-xs font-mono transition-all duration-75 min-w-[210px] max-w-[280px]"
            style={{
              left: Math.min(
                Math.max(12, hoveredInfo.x - 100),
                (containerRef.current?.clientWidth || 350) - 240
              ),
              top: Math.max(6, hoveredInfo.y - 120),
              backgroundColor: `${currentTheme.cardBg}f5`,
              borderColor: currentTheme.accent,
              color: currentTheme.textPrimary,
              boxShadow: `0 10px 25px -5px ${currentTheme.cardBorder}, 0 0 12px ${currentTheme.accent}30`,
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-bold text-xs truncate" style={{ color: currentTheme.textPrimary }}>
                {hoveredInfo.title}
              </span>
              {hoveredInfo.badge && (
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0"
                  style={{
                    backgroundColor:
                      hoveredInfo.badgeType === 'gain'
                        ? `${currentTheme.gainColor}25`
                        : hoveredInfo.badgeType === 'loss'
                        ? `${currentTheme.lossColor}25`
                        : `${currentTheme.accent}25`,
                    color:
                      hoveredInfo.badgeType === 'gain'
                        ? currentTheme.gainColor
                        : hoveredInfo.badgeType === 'loss'
                        ? currentTheme.lossColor
                        : currentTheme.accent,
                  }}
                >
                  {hoveredInfo.badge}
                </span>
              )}
            </div>

            {/* Prominent Percentage Metric */}
            <div className="flex items-baseline justify-between py-1 px-2 rounded-lg my-1.5 bg-white/5 border" style={{ borderColor: currentTheme.cardBorder }}>
              <span className="text-[11px]" style={{ color: currentTheme.textMuted }}>
                {hoveredInfo.metricLabel || 'Weight / Pct'}:
              </span>
              <span className="text-sm font-black font-mono" style={{ color: currentTheme.accent }}>
                {hoveredInfo.percentageValue}
              </span>
            </div>

            <div className="text-[11px] opacity-80 mb-2 font-sans font-medium" style={{ color: currentTheme.textSecondary }}>
              {hoveredInfo.subtitle}
            </div>

            {/* Detailed Item List / Breakdown */}
            {hoveredInfo.details.length > 0 && (
              <div className="space-y-1 pt-1.5 border-t" style={{ borderColor: currentTheme.cardBorder }}>
                {hoveredInfo.details.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-[10.5px]">
                    <span className="truncate max-w-[130px]" style={{ color: currentTheme.textMuted }}>
                      {d.label}
                    </span>
                    <span
                      className="font-bold font-mono ml-2 shrink-0"
                      style={{
                        color: d.isGain
                          ? currentTheme.gainColor
                          : d.isLoss
                          ? currentTheme.lossColor
                          : currentTheme.textPrimary,
                      }}
                    >
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Legend & Summary */}
      <div
        className="flex flex-wrap items-center justify-between text-xs font-mono pt-3 mt-2 border-t"
        style={{ borderColor: currentTheme.cardBorder, color: currentTheme.textSecondary }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: currentTheme.gainColor }} />
            <span>Advancers ({breadth.advancers})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-500" />
            <span>Unchanged ({breadth.unchanged})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: currentTheme.lossColor }} />
            <span>Decliners ({breadth.decliners})</span>
          </div>
        </div>

        <div className="text-[11px]">
          Ratio: <strong style={{ color: breadth.advanceDeclineRatio >= 1.0 ? currentTheme.gainColor : currentTheme.lossColor }}>
            {breadth.advanceDeclineRatio} : 1.0
          </strong> | Avg Return: <strong style={{ color: breadth.avgChangePercent >= 0 ? currentTheme.gainColor : currentTheme.lossColor }}>
            {breadth.avgChangePercent > 0 ? '+' : ''}{breadth.avgChangePercent}%
          </strong>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// D3 Render Helper 1: Return Histogram with Enhanced Tooltips
// -------------------------------------------------------------
function renderHistogram(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  width: number,
  height: number,
  buckets: BucketData[],
  totalStocksCount: number,
  theme: ThemeConfig,
  onHover: (info: TooltipInfo | null) => void
) {
  const margin = { top: 15, right: 15, bottom: 35, left: 35 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const chartGroup = g.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const maxCount = Math.max(3, d3.max(buckets, (d) => d.count) || 3);

  // Scales
  const xScale = d3
    .scaleBand()
    .domain(buckets.map((d) => d.label))
    .range([0, innerWidth])
    .padding(0.24);

  const yScale = d3.scaleLinear().domain([0, maxCount]).nice().range([innerHeight, 0]);

  // Subtle grid lines
  chartGroup
    .append('g')
    .attr('class', 'grid')
    .call(
      d3
        .axisLeft(yScale)
        .ticks(4)
        .tickSize(-innerWidth)
        .tickFormat(() => '')
    )
    .selectAll('line')
    .attr('stroke', theme.cardBorder)
    .attr('stroke-opacity', 0.6)
    .attr('stroke-dasharray', '2,2');

  chartGroup.selectAll('.domain').remove();

  // Draw Bars
  const bars = chartGroup
    .selectAll('.bar')
    .data(buckets)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => xScale(d.label) || 0)
    .attr('width', xScale.bandwidth())
    .attr('y', innerHeight)
    .attr('height', 0)
    .attr('rx', 4)
    .attr('fill', (d) => {
      if (d.type === 'gain') return theme.gainColor;
      if (d.type === 'loss') return theme.lossColor;
      return '#64748b';
    })
    .attr('opacity', 0.85)
    .attr('cursor', 'pointer')
    .on('mouseenter', function (event, d) {
      d3.select(this)
        .attr('opacity', 1)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);
      const [mouseX, mouseY] = d3.pointer(event, g.node());

      onHover({
        title: `Bin Range: ${d.label}`,
        badge: `${d.count} Constituents`,
        badgeType: d.type === 'gain' ? 'gain' : d.type === 'loss' ? 'loss' : 'neutral',
        percentageValue: `${d.percentage}% of Universe`,
        metricLabel: 'Universe Share',
        subtitle: d.stocks.length > 0 ? `Mean bin return: ${d.avgChange > 0 ? '+' : ''}${d.avgChange}%` : 'No constituents in this return bin',
        details: d.stocks.slice(0, 5).map((s) => ({
          label: s.symbol,
          value: `${s.changePercent > 0 ? '+' : ''}${s.changePercent.toFixed(2)}% (${formatCurrency(s.price, s.currency)})`,
          isGain: s.changePercent > 0,
          isLoss: s.changePercent < 0,
        })),
        x: mouseX + margin.left,
        y: mouseY + margin.top,
      });
    })
    .on('mouseleave', function () {
      d3.select(this).attr('opacity', 0.85).attr('stroke', 'none');
      onHover(null);
    });

  // Smooth Entry Animation
  bars
    .transition()
    .duration(550)
    .ease(d3.easeCubicOut)
    .attr('y', (d) => yScale(d.count))
    .attr('height', (d) => innerHeight - yScale(d.count));

  // Bar labels count
  chartGroup
    .selectAll('.bar-label')
    .data(buckets)
    .enter()
    .append('text')
    .attr('class', 'bar-label')
    .attr('x', (d) => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
    .attr('y', (d) => Math.min(innerHeight - 4, yScale(d.count) - 5))
    .attr('text-anchor', 'middle')
    .attr('fill', theme.textPrimary)
    .attr('font-size', '10px')
    .attr('font-family', 'monospace')
    .attr('font-weight', 'bold')
    .text((d) => (d.count > 0 ? d.count : ''));

  // X Axis
  const xAxis = chartGroup
    .append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).tickSize(0));

  xAxis.select('.domain').attr('stroke', theme.cardBorder);
  xAxis
    .selectAll('text')
    .attr('fill', theme.textSecondary)
    .attr('font-size', '9.5px')
    .attr('font-family', 'monospace')
    .attr('dy', '10px');

  // Y Axis
  const yAxis = chartGroup.append('g').call(d3.axisLeft(yScale).ticks(4).tickSize(0));
  yAxis.select('.domain').remove();
  yAxis
    .selectAll('text')
    .attr('fill', theme.textMuted)
    .attr('font-size', '9px')
    .attr('font-family', 'monospace')
    .attr('dx', '-4px');
}

// -------------------------------------------------------------
// D3 Render Helper 2: Radial Donut with Exact Percentage Tooltips
// -------------------------------------------------------------
function renderDonut(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  width: number,
  height: number,
  breadth: MarketBreadth,
  stocks: StockQuote[],
  theme: ThemeConfig,
  onHover: (info: TooltipInfo | null) => void
) {
  const radius = Math.min(width, height) / 2 - 15;
  const centerX = width / 2;
  const centerY = height / 2;

  const donutGroup = g.append('g').attr('transform', `translate(${centerX},${centerY})`);

  const total = breadth.total || stocks.length || 1;
  const advancerPct = ((breadth.advancers / total) * 100).toFixed(1);
  const declinerPct = ((breadth.decliners / total) * 100).toFixed(1);
  const unchangedPct = ((breadth.unchanged / total) * 100).toFixed(1);

  const data = [
    { key: 'Advancers', value: breadth.advancers || 0.001, pct: advancerPct, color: theme.gainColor, type: 'gain' },
    { key: 'Unchanged', value: breadth.unchanged || 0, pct: unchangedPct, color: '#64748b', type: 'neutral' },
    { key: 'Decliners', value: breadth.decliners || 0.001, pct: declinerPct, color: theme.lossColor, type: 'loss' },
  ].filter((d) => d.value > 0);

  const pie = d3
    .pie<{ key: string; value: number; pct: string; color: string; type: string }>()
    .value((d) => d.value)
    .sort(null)
    .padAngle(0.04);

  const arc = d3
    .arc<d3.PieArcDatum<{ key: string; value: number; pct: string; color: string; type: string }>>()
    .innerRadius(radius * 0.62)
    .outerRadius(radius)
    .cornerRadius(4);

  const arcs = donutGroup.selectAll('.arc').data(pie(data)).enter().append('g').attr('class', 'arc');

  arcs
    .append('path')
    .attr('d', arc as any)
    .attr('fill', (d) => d.data.color)
    .attr('opacity', 0.85)
    .attr('cursor', 'pointer')
    .on('mouseenter', function (event, d) {
      d3.select(this).attr('opacity', 1).attr('stroke', '#ffffff').attr('stroke-width', 2.5);
      const [mouseX, mouseY] = d3.pointer(event, g.node());

      const constituentSubset =
        d.data.type === 'gain'
          ? stocks.filter((s) => s.changePercent > 0)
          : d.data.type === 'loss'
          ? stocks.filter((s) => s.changePercent < 0)
          : stocks.filter((s) => s.changePercent === 0);

      const subsetAvg =
        constituentSubset.length > 0
          ? (constituentSubset.reduce((a, s) => a + s.changePercent, 0) / constituentSubset.length).toFixed(2)
          : '0.00';

      onHover({
        title: d.data.key,
        badge: `${Math.round(d.data.value)} / ${total} Stocks`,
        badgeType: d.data.type === 'gain' ? 'gain' : d.data.type === 'loss' ? 'loss' : 'neutral',
        percentageValue: `${d.data.pct}% of Market Breadth`,
        metricLabel: 'Market Share',
        subtitle: `Segment average price movement: ${Number(subsetAvg) > 0 ? '+' : ''}${subsetAvg}%`,
        details: [
          { label: 'Advancers Ratio', value: `${breadth.advanceDeclineRatio} : 1.0` },
          { label: 'Top Contributor', value: `${breadth.topGainer.symbol} (+${breadth.topGainer.changePercent.toFixed(2)}%)`, isGain: true },
          { label: 'Max Drawdown', value: `${breadth.topLoser.symbol} (${breadth.topLoser.changePercent.toFixed(2)}%)`, isLoss: true },
        ],
        x: mouseX,
        y: mouseY,
      });
    })
    .on('mouseleave', function () {
      d3.select(this).attr('opacity', 0.85).attr('stroke', 'none');
      onHover(null);
    });

  // Center Ratio Text
  donutGroup
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-4px')
    .attr('fill', breadth.advanceDeclineRatio >= 1.0 ? theme.gainColor : theme.lossColor)
    .attr('font-size', '16px')
    .attr('font-weight', 'bold')
    .attr('font-family', 'monospace')
    .text(`${breadth.advanceDeclineRatio}`);

  donutGroup
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '14px')
    .attr('fill', theme.textMuted)
    .attr('font-size', '9px')
    .attr('font-family', 'monospace')
    .text('A/D RATIO');
}

// -------------------------------------------------------------
// D3 Render Helper 3: Bubble / Beeswarm Spread with Specific Percentage Tooltips
// -------------------------------------------------------------
function renderBubbleSpread(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  width: number,
  height: number,
  stocks: StockQuote[],
  theme: ThemeConfig,
  selectedSymbol?: string,
  onSelectStock?: (stock: StockQuote) => void,
  onHover?: (info: TooltipInfo | null) => void
) {
  const margin = { top: 20, right: 30, bottom: 35, left: 30 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const chartGroup = g.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // X scale bounded around +/- 4%
  const minChange = Math.min(-3.5, d3.min(stocks, (d) => d.changePercent) || -3.5);
  const maxChange = Math.max(3.5, d3.max(stocks, (d) => d.changePercent) || 3.5);
  const bound = Math.max(Math.abs(minChange), Math.abs(maxChange));

  const xScale = d3.scaleLinear().domain([-bound, bound]).range([0, innerWidth]);

  // Center vertical divider
  chartGroup
    .append('line')
    .attr('x1', xScale(0))
    .attr('x2', xScale(0))
    .attr('y1', 0)
    .attr('y2', innerHeight)
    .attr('stroke', theme.cardBorder)
    .attr('stroke-dasharray', '3,3')
    .attr('stroke-width', 1.5);

  // Background zones
  chartGroup
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', xScale(0))
    .attr('height', innerHeight)
    .attr('fill', theme.lossColor)
    .attr('opacity', 0.04);

  chartGroup
    .append('rect')
    .attr('x', xScale(0))
    .attr('y', 0)
    .attr('width', innerWidth - xScale(0))
    .attr('height', innerHeight)
    .attr('fill', theme.gainColor)
    .attr('opacity', 0.04);

  // Simulated node positions for beeswarm
  const nodes = stocks.map((s, idx) => {
    const isSelected = selectedSymbol === s.symbol;
    const r = Math.max(12, Math.min(22, 14 + (s.marketCap / 1e12) * 2));
    const targetX = xScale(s.changePercent);
    // stagger y to prevent severe overlapping
    const offsetIdx = (idx % 3) - 1;
    const y = innerHeight / 2 + offsetIdx * 28;

    return {
      stock: s,
      x: targetX,
      y,
      r,
      isSelected,
    };
  });

  const bubbles = chartGroup
    .selectAll('.bubble-node')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'bubble-node')
    .attr('transform', (d) => `translate(${d.x},${d.y})`)
    .attr('cursor', 'pointer')
    .on('click', (_, d) => {
      if (onSelectStock) onSelectStock(d.stock);
    })
    .on('mouseenter', function (event, d) {
      d3.select(this).select('circle').attr('stroke', '#ffffff').attr('stroke-width', 2.5);
      const [mouseX, mouseY] = d3.pointer(event, g.node());
      if (onHover) {
        const isGain = d.stock.changePercent >= 0;
        onHover({
          title: `${d.stock.symbol} — ${d.stock.name}`,
          badge: isGain ? 'Advancing' : 'Declining',
          badgeType: isGain ? 'gain' : 'loss',
          percentageValue: `${isGain ? '+' : ''}${d.stock.changePercent.toFixed(2)}% (24h)`,
          metricLabel: '24h Change',
          subtitle: `Current Price: ${formatCurrency(d.stock.price, d.stock.currency)} (Day Δ: ${isGain ? '+' : ''}${formatCurrency(d.stock.change, d.stock.currency)})`,
          details: [
            { label: 'Day Range', value: `$${d.stock.low.toFixed(2)} - $${d.stock.high.toFixed(2)}` },
            { label: 'Market Cap', value: d.stock.marketCapFormatted },
            { label: 'Trading Volume', value: formatLargeNumber(d.stock.volume) },
            { label: 'P/E Ratio', value: d.stock.peRatio ? `${d.stock.peRatio.toFixed(1)}x` : 'N/A' },
          ],
          x: mouseX + margin.left,
          y: mouseY + margin.top,
        });
      }
    })
    .on('mouseleave', function () {
      d3.select(this).select('circle').attr('stroke', (d: any) => (d.isSelected ? theme.accent : 'none'));
      if (onHover) onHover(null);
    });

  // Circle body
  bubbles
    .append('circle')
    .attr('r', (d) => d.r)
    .attr('fill', (d) => (d.stock.changePercent >= 0 ? theme.gainColor : theme.lossColor))
    .attr('opacity', 0.88)
    .attr('stroke', (d) => (d.isSelected ? '#ffffff' : 'none'))
    .attr('stroke-width', (d) => (d.isSelected ? 2 : 0));

  // Ticker symbol label
  bubbles
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '3.5px')
    .attr('fill', '#ffffff')
    .attr('font-size', '9.5px')
    .attr('font-weight', 'bold')
    .attr('font-family', 'monospace')
    .text((d) => d.stock.symbol);

  // X-Axis
  const xAxis = chartGroup
    .append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(
      d3
        .axisBottom(xScale)
        .ticks(7)
        .tickFormat((d) => `${Number(d) > 0 ? '+' : ''}${d}%`)
    );

  xAxis.select('.domain').attr('stroke', theme.cardBorder);
  xAxis
    .selectAll('text')
    .attr('fill', theme.textSecondary)
    .attr('font-size', '9px')
    .attr('font-family', 'monospace');
}

