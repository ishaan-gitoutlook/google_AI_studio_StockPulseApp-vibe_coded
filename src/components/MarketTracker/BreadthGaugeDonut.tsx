import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MarketBreadth, ThemeConfig } from '../../types';
import { PieChart, Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BreadthGaugeDonutProps {
  breadth: MarketBreadth;
  currentTheme: ThemeConfig;
  className?: string;
}

type ChartMode = 'gauge' | 'donut';

interface SegmentTooltip {
  label: string;
  count: number;
  pct: number;
  type: 'gain' | 'loss' | 'neutral';
  x: number;
  y: number;
}

export const BreadthGaugeDonut: React.FC<BreadthGaugeDonutProps> = ({
  breadth,
  currentTheme,
  className = '',
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>('gauge');
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<SegmentTooltip | null>(null);

  const total = breadth.total > 0 ? breadth.total : 1;
  const advancerPct = Number(((breadth.advancers / total) * 100).toFixed(1));
  const declinerPct = Number(((breadth.decliners / total) * 100).toFixed(1));
  const unchangedPct = Number(((breadth.unchanged / total) * 100).toFixed(1));

  // Determine market sentiment label & color based on A/D ratio
  const ratio = breadth.advanceDeclineRatio;
  let sentimentLabel = 'Neutral Dynamic';
  let sentimentColor = '#94a3b8';

  if (ratio >= 2.0) {
    sentimentLabel = 'Strong Bullish Expansion';
    sentimentColor = currentTheme.gainColor;
  } else if (ratio >= 1.2) {
    sentimentLabel = 'Moderate Bull Accumulation';
    sentimentColor = currentTheme.gainColor;
  } else if (ratio >= 0.85) {
    sentimentLabel = 'Balanced Consolidation';
    sentimentColor = currentTheme.accent;
  } else if (ratio >= 0.5) {
    sentimentLabel = 'Defensive Distribution';
    sentimentColor = currentTheme.lossColor;
  } else {
    sentimentLabel = 'Heavy Bear Liquidation';
    sentimentColor = currentTheme.lossColor;
  }

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 280;
    const height = chartMode === 'gauge' ? 170 : 200;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g');

    if (chartMode === 'gauge') {
      renderSemicircleGauge(
        g,
        width,
        height,
        breadth,
        advancerPct,
        declinerPct,
        unchangedPct,
        currentTheme,
        (info) => setTooltip(info)
      );
    } else {
      renderRadialDonut(
        g,
        width,
        height,
        breadth,
        advancerPct,
        declinerPct,
        unchangedPct,
        currentTheme,
        (info) => setTooltip(info)
      );
    }
  }, [breadth, chartMode, currentTheme, advancerPct, declinerPct, unchangedPct]);

  return (
    <div
      id="breadth-gauge-donut-container"
      ref={containerRef}
      className={`relative flex flex-col items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${className}`}
      style={{
        backgroundColor: `${currentTheme.bg}40`,
        borderColor: currentTheme.cardBorder,
      }}
    >
      {/* Header controls & visual mode switcher */}
      <div className="w-full flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: currentTheme.textSecondary }}>
            Breadth Ratio Meter
          </span>
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
            style={{
              backgroundColor: `${sentimentColor}20`,
              color: sentimentColor,
            }}
          >
            {ratio} : 1.0
          </span>
        </div>

        {/* Mode Toggle Pills: Gauge vs Donut */}
        <div
          className="flex items-center p-0.5 rounded-lg border text-[11px]"
          style={{
            backgroundColor: `${currentTheme.bg}90`,
            borderColor: currentTheme.cardBorder,
          }}
        >
          <button
            id="toggle-breadth-gauge"
            type="button"
            onClick={() => setChartMode('gauge')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors font-medium ${
              chartMode === 'gauge' ? 'shadow-sm' : 'opacity-65 hover:opacity-100'
            }`}
            style={{
              backgroundColor: chartMode === 'gauge' ? currentTheme.accent : 'transparent',
              color: chartMode === 'gauge' ? '#ffffff' : currentTheme.textSecondary,
            }}
            title="Semicircle Gauge View"
          >
            <Gauge className="w-3 h-3" />
            <span>Gauge</span>
          </button>
          <button
            id="toggle-breadth-donut"
            type="button"
            onClick={() => setChartMode('donut')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors font-medium ${
              chartMode === 'donut' ? 'shadow-sm' : 'opacity-65 hover:opacity-100'
            }`}
            style={{
              backgroundColor: chartMode === 'donut' ? currentTheme.accent : 'transparent',
              color: chartMode === 'donut' ? '#ffffff' : currentTheme.textSecondary,
            }}
            title="360° Donut View"
          >
            <PieChart className="w-3 h-3" />
            <span>Donut</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full flex items-center justify-center my-1 min-h-[170px]">
        <svg ref={svgRef} className="overflow-visible" />

        {/* Hover Tooltip Overlay */}
        {tooltip && (
          <div
            className="absolute z-20 pointer-events-none px-2.5 py-1.5 rounded-lg border backdrop-blur-md shadow-xl text-xs whitespace-nowrap transition-all duration-150"
            style={{
              left: Math.max(10, Math.min(tooltip.x - 60, (containerRef.current?.clientWidth || 260) - 130)),
              top: Math.max(5, tooltip.y - 45),
              backgroundColor: `${currentTheme.cardBg}f5`,
              borderColor:
                tooltip.type === 'gain'
                  ? currentTheme.gainColor
                  : tooltip.type === 'loss'
                  ? currentTheme.lossColor
                  : '#64748b',
              color: currentTheme.textPrimary,
            }}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    tooltip.type === 'gain'
                      ? currentTheme.gainColor
                      : tooltip.type === 'loss'
                      ? currentTheme.lossColor
                      : '#64748b',
                }}
              />
              <span>{tooltip.label}</span>
            </div>
            <div className="text-[11px] font-mono mt-0.5 flex items-center gap-2">
              <span style={{ color: currentTheme.textMuted }}>{tooltip.count} Stocks</span>
              <span className="font-bold" style={{ color: currentTheme.accent }}>
                ({tooltip.pct}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Summary Tags */}
      <div className="w-full flex items-center justify-between text-[11px] font-mono pt-2 border-t mt-1" style={{ borderColor: currentTheme.cardBorder }}>
        <div className="flex items-center gap-1" style={{ color: currentTheme.gainColor }}>
          <TrendingUp className="w-3 h-3" />
          <span className="font-bold">{breadth.advancers}</span>
          <span className="opacity-70">({advancerPct}%)</span>
        </div>

        {breadth.unchanged > 0 && (
          <div className="flex items-center gap-1" style={{ color: '#94a3b8' }}>
            <Minus className="w-3 h-3" />
            <span className="font-bold">{breadth.unchanged}</span>
          </div>
        )}

        <div className="flex items-center gap-1" style={{ color: currentTheme.lossColor }}>
          <TrendingDown className="w-3 h-3" />
          <span className="font-bold">{breadth.decliners}</span>
          <span className="opacity-70">({declinerPct}%)</span>
        </div>
      </div>

      <div className="w-full text-center mt-1.5">
        <span className="text-[10.5px] font-medium" style={{ color: sentimentColor }}>
          ● {sentimentLabel}
        </span>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// D3 Implementation: Semicircle Gauge with Needle and Arc Segments
// -------------------------------------------------------------
function renderSemicircleGauge(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  width: number,
  height: number,
  breadth: MarketBreadth,
  advancerPct: number,
  declinerPct: number,
  unchangedPct: number,
  theme: ThemeConfig,
  onHover: (info: SegmentTooltip | null) => void
) {
  const centerX = width / 2;
  const centerY = height - 28;
  const radius = Math.min(centerX - 15, centerY - 10);
  const innerRadius = radius * 0.70;

  const gaugeGroup = g.append('g').attr('transform', `translate(${centerX},${centerY})`);

  // Background track (-PI/2 to PI/2)
  const bgArc = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(radius)
    .startAngle(-Math.PI / 2)
    .endAngle(Math.PI / 2);

  gaugeGroup
    .append('path')
    .attr('d', bgArc as any)
    .attr('fill', `${theme.cardBorder}60`);

  // Data slices mapped across semicircle (-PI/2 to PI/2)
  const total = breadth.total || 1;
  const slices = [
    {
      label: 'Decliners',
      count: breadth.decliners,
      pct: declinerPct,
      type: 'loss' as const,
      color: theme.lossColor,
      weight: breadth.decliners,
    },
    {
      label: 'Unchanged',
      count: breadth.unchanged,
      pct: unchangedPct,
      type: 'neutral' as const,
      color: '#64748b',
      weight: breadth.unchanged,
    },
    {
      label: 'Advancers',
      count: breadth.advancers,
      pct: advancerPct,
      type: 'gain' as const,
      color: theme.gainColor,
      weight: breadth.advancers,
    },
  ].filter((s) => s.weight > 0);

  // Compute angles for each segment across -Math.PI / 2 to Math.PI / 2
  let currentAngle = -Math.PI / 2;
  const totalWeight = slices.reduce((acc, s) => acc + s.weight, 0) || 1;

  slices.forEach((slice) => {
    const sliceAngleSpan = (slice.weight / totalWeight) * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngleSpan;
    currentAngle = endAngle;

    const segmentArc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .padAngle(0.02)
      .cornerRadius(3);

    gaugeGroup
      .append('path')
      .attr('d', segmentArc as any)
      .attr('fill', slice.color)
      .attr('opacity', 0.88)
      .attr('cursor', 'pointer')
      .on('mouseenter', function (event) {
        d3.select(this).attr('opacity', 1).attr('stroke', '#ffffff').attr('stroke-width', 2);
        const [mx, my] = d3.pointer(event, g.node());
        onHover({
          label: slice.label,
          count: slice.count,
          pct: slice.pct,
          type: slice.type,
          x: mx,
          y: my,
        });
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 0.88).attr('stroke', 'none');
        onHover(null);
      });
  });

  // Calculate Needle Angle:
  // 0% advancers = -PI/2 (extreme left, full decliners)
  // 50% advancers = 0 (vertical, balanced)
  // 100% advancers = PI/2 (extreme right, full advancers)
  const clampedPct = Math.max(0, Math.min(100, advancerPct));
  const targetNeedleAngle = -Math.PI / 2 + (clampedPct / 100) * Math.PI;

  // Needle Group with Pivot Circle
  const needleGroup = gaugeGroup.append('g').attr('class', 'needle');

  const needleLength = radius * 0.88;
  const needleWidth = 3.5;

  const needlePath = `M ${-needleWidth} 0 L 0 ${-needleLength} L ${needleWidth} 0 Z`;

  needleGroup
    .append('path')
    .attr('d', needlePath)
    .attr('fill', theme.textPrimary)
    .attr('transform', `rotate(${(targetNeedleAngle * 180) / Math.PI})`)
    .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))')
    .attr('opacity', 0)
    .transition()
    .duration(650)
    .ease(d3.easeCubicOut)
    .attr('opacity', 1);

  // Center Pivot Hub
  gaugeGroup
    .append('circle')
    .attr('r', 6)
    .attr('fill', theme.cardBg)
    .attr('stroke', theme.textPrimary)
    .attr('stroke-width', 2.5);

  gaugeGroup
    .append('circle')
    .attr('r', 2.5)
    .attr('fill', theme.accent);

  // Center Text Displays
  gaugeGroup
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-22px')
    .attr('fill', breadth.advanceDeclineRatio >= 1.0 ? theme.gainColor : theme.lossColor)
    .attr('font-size', '16px')
    .attr('font-weight', '900')
    .attr('font-family', 'monospace')
    .text(`${breadth.advanceDeclineRatio}x`);

  gaugeGroup
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-8px')
    .attr('fill', theme.textMuted)
    .attr('font-size', '8.5px')
    .attr('font-family', 'monospace')
    .attr('letter-spacing', '0.05em')
    .text('ADV/DEC RATIO');

  // Gauge Range Markers
  gaugeGroup
    .append('text')
    .attr('x', -radius + 4)
    .attr('y', 14)
    .attr('text-anchor', 'start')
    .attr('fill', theme.lossColor)
    .attr('font-size', '9px')
    .attr('font-family', 'monospace')
    .attr('font-weight', 'bold')
    .text('BEAR');

  gaugeGroup
    .append('text')
    .attr('x', radius - 4)
    .attr('y', 14)
    .attr('text-anchor', 'end')
    .attr('fill', theme.gainColor)
    .attr('font-size', '9px')
    .attr('font-family', 'monospace')
    .attr('font-weight', 'bold')
    .text('BULL');
}

// -------------------------------------------------------------
// D3 Implementation: 360° Interactive Donut with Arc Padding
// -------------------------------------------------------------
function renderRadialDonut(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  width: number,
  height: number,
  breadth: MarketBreadth,
  advancerPct: number,
  declinerPct: number,
  unchangedPct: number,
  theme: ThemeConfig,
  onHover: (info: SegmentTooltip | null) => void
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 12;
  const innerRadius = radius * 0.62;

  const donutGroup = g.append('g').attr('transform', `translate(${centerX},${centerY})`);

  const data = [
    {
      label: 'Advancers',
      count: breadth.advancers,
      pct: advancerPct,
      type: 'gain' as const,
      color: theme.gainColor,
      value: breadth.advancers || 0.001,
    },
    {
      label: 'Unchanged',
      count: breadth.unchanged,
      pct: unchangedPct,
      type: 'neutral' as const,
      color: '#64748b',
      value: breadth.unchanged || 0,
    },
    {
      label: 'Decliners',
      count: breadth.decliners,
      pct: declinerPct,
      type: 'loss' as const,
      color: theme.lossColor,
      value: breadth.decliners || 0.001,
    },
  ].filter((d) => d.value > 0);

  const pie = d3
    .pie<typeof data[0]>()
    .value((d) => d.value)
    .sort(null)
    .padAngle(0.04);

  const arc = d3
    .arc<d3.PieArcDatum<typeof data[0]>>()
    .innerRadius(innerRadius)
    .outerRadius(radius)
    .cornerRadius(4);

  const arcs = donutGroup
    .selectAll('.donut-slice')
    .data(pie(data))
    .enter()
    .append('g')
    .attr('class', 'donut-slice');

  arcs
    .append('path')
    .attr('d', arc as any)
    .attr('fill', (d) => d.data.color)
    .attr('opacity', 0.88)
    .attr('cursor', 'pointer')
    .on('mouseenter', function (event, d) {
      d3.select(this)
        .attr('opacity', 1)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2.5);
      const [mx, my] = d3.pointer(event, g.node());
      onHover({
        label: d.data.label,
        count: d.data.count,
        pct: d.data.pct,
        type: d.data.type,
        x: mx,
        y: my,
      });
    })
    .on('mouseleave', function () {
      d3.select(this).attr('opacity', 0.88).attr('stroke', 'none');
      onHover(null);
    });

  // Center Metrics
  donutGroup
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-4px')
    .attr('fill', breadth.advanceDeclineRatio >= 1.0 ? theme.gainColor : theme.lossColor)
    .attr('font-size', '17px')
    .attr('font-weight', '900')
    .attr('font-family', 'monospace')
    .text(`${breadth.advanceDeclineRatio}`);

  donutGroup
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '14px')
    .attr('fill', theme.textMuted)
    .attr('font-size', '9px')
    .attr('font-family', 'monospace')
    .attr('letter-spacing', '0.05em')
    .text('A/D RATIO');
}
