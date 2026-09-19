import React from 'react';
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Minimize2,
  Maximize2,
  Columns,
  Square,
  Sparkles,
  Info,
} from 'lucide-react';
import { ThemeConfig, TrackerWidgetConfig } from '../../types';

interface WidgetContainerProps {
  widget: TrackerWidgetConfig;
  currentTheme: ThemeConfig;
  index: number;
  totalWidgets: number;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
  onDragEnd: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleCollapse: () => void;
  onToggleWidth: () => void;
  children: React.ReactNode;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widget,
  currentTheme,
  index,
  totalWidgets,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onToggleCollapse,
  onToggleWidth,
  children,
}) => {
  // Determine grid column span
  const colSpanClass =
    widget.colSpan === 'half'
      ? 'col-span-12 lg:col-span-6'
      : widget.colSpan === 'two-thirds'
      ? 'col-span-12 lg:col-span-8'
      : widget.colSpan === 'one-third'
      ? 'col-span-12 lg:col-span-4'
      : 'col-span-12';

  return (
    <div
      id={`widget-wrapper-${widget.id}`}
      draggable
      onDragStart={(e) => onDragStart(e, widget.id)}
      onDragOver={(e) => onDragOver(e, widget.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, widget.id)}
      onDragEnd={onDragEnd}
      className={`group relative rounded-2xl border transition-all duration-200 ${colSpanClass} ${
        isDragging ? 'opacity-40 scale-[0.99] border-dashed' : 'opacity-100'
      } ${
        isDragOver
          ? 'ring-2 ring-offset-2 ring-sky-400 scale-[1.01]'
          : 'hover:border-opacity-80'
      }`}
      style={{
        backgroundColor: currentTheme.cardBg,
        borderColor: isDragOver ? currentTheme.accent : currentTheme.cardBorder,
        boxShadow: isDragOver
          ? `0 12px 30px -10px ${currentTheme.accent}40`
          : '0 2px 8px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Widget Header Bar */}
      <div
        className="flex items-center justify-between px-3.5 py-2 border-b rounded-t-2xl select-none"
        style={{
          borderColor: currentTheme.cardBorder,
          backgroundColor: `${currentTheme.bg}50`,
        }}
      >
        {/* Drag Handle & Widget Title */}
        <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing">
          <div
            className="p-0.5 rounded text-slate-400 hover:text-white transition-colors opacity-50 hover:opacity-100"
            title="Drag to rearrange widget position"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          <span
            className="text-xs font-semibold font-mono tracking-tight"
            style={{ color: currentTheme.textPrimary }}
          >
            {widget.title}
          </span>
        </div>

        {/* Quick Controls */}
        <div className="flex items-center gap-1">
          {/* Toggle Width Span */}
          <button
            onClick={onToggleWidth}
            className="p-1 rounded border text-slate-400 hover:text-white transition-all hidden sm:block opacity-60 hover:opacity-100"
            style={{ borderColor: currentTheme.cardBorder }}
            title={widget.colSpan === 'full' ? 'Switch to Half Width' : 'Switch to Full Width'}
          >
            {widget.colSpan === 'full' ? (
              <Columns className="w-3 h-3" />
            ) : (
              <Square className="w-3 h-3" />
            )}
          </button>

          {/* Collapse / Expand Toggle */}
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded border text-slate-400 hover:text-white transition-all opacity-60 hover:opacity-100"
            style={{ borderColor: currentTheme.cardBorder }}
            title={widget.isCollapsed ? 'Expand Widget' : 'Minimize Widget'}
          >
            {widget.isCollapsed ? (
              <Maximize2 className="w-3 h-3" />
            ) : (
              <Minimize2 className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Widget Body Content */}
      {!widget.isCollapsed && (
        <div className="p-3 sm:p-5">
          {children}
        </div>
      )}

      {/* Collapsed Placeholder Bar */}
      {widget.isCollapsed && (
        <div
          onClick={onToggleCollapse}
          className="p-3 text-center text-xs cursor-pointer hover:bg-white/5 transition-colors rounded-b-2xl font-mono"
          style={{ color: currentTheme.textMuted }}
        >
          Widget minimized. Click to expand.
        </div>
      )}
    </div>
  );
};
