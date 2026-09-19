import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
} from 'lucide-react';
import { MarketBreadth, ThemeConfig } from '../../types';
import { formatLargeNumber } from '../../utils/marketEngine';
import { BreadthGaugeDonut } from './BreadthGaugeDonut';

interface BreadthRadarWidgetProps {
  breadth: MarketBreadth;
  currentTheme: ThemeConfig;
}

export const BreadthRadarWidget: React.FC<BreadthRadarWidgetProps> = ({
  breadth,
  currentTheme,
}) => {
  const advancerPct = breadth.total > 0 ? (breadth.advancers / breadth.total) * 100 : 50;

  return (
    <div id="breadth-meter-card" className="space-y-4">
      {/* Header with Title and Overall A/D Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="p-2 rounded-xl"
            style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}
          >
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold" style={{ color: currentTheme.textPrimary }}>
              Market Breadth & Momentum Radar
            </h2>
            <p className="text-xs" style={{ color: currentTheme.textMuted }}>
              Real-time Advance/Decline ratio across {breadth.total} active universe constituents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs uppercase font-mono tracking-wider" style={{ color: currentTheme.textMuted }}>
              A/D Ratio
            </span>
            <div
              className="text-lg font-black font-mono"
              style={{
                color: breadth.advanceDeclineRatio >= 1.0 ? currentTheme.gainColor : currentTheme.lossColor,
              }}
            >
              {breadth.advanceDeclineRatio} : 1.0
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual-Layout: Interactive D3 Semicircle Gauge / Donut on one side, and Detailed Dynamics on the other */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left / Center D3 Donut & Gauge Visualizer (Dynamic Advancers vs Decliners) */}
        <div className="lg:col-span-5 flex">
          <BreadthGaugeDonut
            breadth={breadth}
            currentTheme={currentTheme}
            className="w-full h-full shadow-sm"
          />
        </div>

        {/* Right side: Detailed Breadth Breakdown Bar & Key Statistics */}
        <div
          className="lg:col-span-7 flex flex-col justify-between p-4 rounded-xl border"
          style={{
            backgroundColor: `${currentTheme.bg}40`,
            borderColor: currentTheme.cardBorder,
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: currentTheme.textSecondary }}>
                Advance / Decline Proportion
              </span>
              <span className="text-xs font-mono font-bold" style={{ color: currentTheme.textPrimary }}>
                {breadth.total} Total Constituents
              </span>
            </div>

            {/* Visual Breadth Meter Bar */}
            <div className="space-y-2">
              <div
                className="h-3.5 w-full rounded-full overflow-hidden flex bg-slate-800/40 p-0.5 border"
                style={{ borderColor: currentTheme.cardBorder }}
              >
                <div
                  className="h-full rounded-l-full transition-all duration-500 ease-out flex items-center justify-center text-[9px] font-bold text-white overflow-hidden"
                  style={{
                    width: `${advancerPct}%`,
                    backgroundColor: currentTheme.gainColor,
                  }}
                  title={`Advancers: ${breadth.advancers} (${advancerPct.toFixed(0)}%)`}
                />
                <div
                  className="h-full rounded-r-full transition-all duration-500 ease-out flex items-center justify-center text-[9px] font-bold text-white overflow-hidden"
                  style={{
                    width: `${100 - advancerPct}%`,
                    backgroundColor: currentTheme.lossColor,
                  }}
                  title={`Decliners: ${breadth.decliners}`}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <div className="flex items-center gap-1.5" style={{ color: currentTheme.gainColor }}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="font-bold">Advancers: {breadth.advancers}</span>
                  <span className="text-[11px] opacity-75">({advancerPct.toFixed(1)}%)</span>
                </div>

                <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>
                  Unchanged: {breadth.unchanged}
                </div>

                <div className="flex items-center gap-1.5" style={{ color: currentTheme.lossColor }}>
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span className="font-bold">Decliners: {breadth.decliners}</span>
                  <span className="text-[11px] opacity-75">({(100 - advancerPct).toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Aggregate Metric Blocks */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-3 border-t"
            style={{ borderColor: currentTheme.cardBorder }}
          >
            <div
              className="p-2.5 rounded-xl border"
              style={{ backgroundColor: `${currentTheme.bg}60`, borderColor: currentTheme.cardBorder }}
            >
              <div className="text-[10.5px]" style={{ color: currentTheme.textMuted }}>Top Outperformer</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold font-mono" style={{ color: currentTheme.textPrimary }}>
                  {breadth.topGainer.symbol}
                </span>
                <span className="text-xs font-bold font-mono" style={{ color: currentTheme.gainColor }}>
                  +{breadth.topGainer.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>

            <div
              className="p-2.5 rounded-xl border"
              style={{ backgroundColor: `${currentTheme.bg}60`, borderColor: currentTheme.cardBorder }}
            >
              <div className="text-[10.5px]" style={{ color: currentTheme.textMuted }}>Top Underperformer</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold font-mono" style={{ color: currentTheme.textPrimary }}>
                  {breadth.topLoser.symbol}
                </span>
                <span className="text-xs font-bold font-mono" style={{ color: currentTheme.lossColor }}>
                  {breadth.topLoser.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>

            <div
              className="p-2.5 rounded-xl border"
              style={{ backgroundColor: `${currentTheme.bg}60`, borderColor: currentTheme.cardBorder }}
            >
              <div className="text-[10.5px]" style={{ color: currentTheme.textMuted }}>Total Volume</div>
              <div className="text-xs font-bold font-mono mt-1" style={{ color: currentTheme.textPrimary }}>
                {formatLargeNumber(breadth.totalVolume)}
              </div>
            </div>

            <div
              className="p-2.5 rounded-xl border"
              style={{ backgroundColor: `${currentTheme.bg}60`, borderColor: currentTheme.cardBorder }}
            >
              <div className="text-[10.5px]" style={{ color: currentTheme.textMuted }}>Avg Movement</div>
              <div
                className="text-xs font-bold font-mono mt-1"
                style={{
                  color: breadth.avgChangePercent >= 0 ? currentTheme.gainColor : currentTheme.lossColor,
                }}
              >
                {breadth.avgChangePercent >= 0 ? '+' : ''}{breadth.avgChangePercent}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
