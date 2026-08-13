import { useMemo, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  type EdgeProps,
} from '@xyflow/react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  buildConnectionDirectionLabel,
  resolveConnectionDashArray,
  resolveConnectionOpacity,
  resolveConnectionStrokeColor,
  resolveConnectionStrokeWidth,
  type ConnectionVariant,
  type SmartConnectionEdgeModel,
} from '../lib/connectionStyles';

function buildOrthogonalPath(params: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}) {
  const { sourceX, sourceY, targetX, targetY } = params;
  const offset = Math.max(42, Math.min(140, Math.abs(targetX - sourceX) * 0.35));
  const direction = targetX >= sourceX ? 1 : -1;
  const elbowX = sourceX + offset * direction;
  const elbowY = sourceY + (targetY - sourceY) * 0.5;
  const path = `M ${sourceX} ${sourceY} L ${elbowX} ${sourceY} L ${elbowX} ${elbowY} L ${targetX} ${elbowY} L ${targetX} ${targetY}`;
  return [path, elbowX, elbowY] as const;
}

function resolveSmartRoute(params: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: any;
  targetPosition: any;
}) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } = params;
  const dx = Math.abs(targetX - sourceX);
  const dy = Math.abs(targetY - sourceY);

  if (dx < 70 && dy < 18) {
    return getStraightPath({ sourceX, sourceY, targetX, targetY });
  }

  if (dy > dx * 0.7 || sourcePosition === targetPosition) {
    return buildOrthogonalPath({ sourceX, sourceY, targetX, targetY });
  }

  if (dx > 320) {
    return getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      curvature: 0.22,
    });
  }

  return getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 24,
  });
}

function truncateLabel(value: string, max = 24) {
  const text = String(value || '').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}&`;
}

export function SmartConnectionEdge(props: EdgeProps<SmartConnectionEdgeModel>) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
    style,
    interactionWidth,
  } = props;
  const [isHovered, setIsHovered] = useState(false);
  const variant: ConnectionVariant = data.variant || 'smart';
  const categoryKey = data.categoryKey || 'default';
  const active = Boolean(data.isActive || selected);
  const hovered = Boolean(data.isHovered || isHovered);
  const muted = Boolean((data as any).isMuted);

  const strokeColor = resolveConnectionStrokeColor(categoryKey);
  const strokeWidth = resolveConnectionStrokeWidth(variant, active, hovered);
  const dashArray = resolveConnectionDashArray(variant);
  const opacity = resolveConnectionOpacity(variant, active, hovered) * (muted ? 0.14 : 1);
  const edgeLabel = buildConnectionDirectionLabel(data.sourceLabel, data.targetLabel);
  const markerId = `connection-arrow-${id}`;
  const resolvedMarkerEnd = `url(#${markerId})`;
  const sharedDefs = (
    <defs>
      <marker
        id={markerId}
        markerWidth="12"
        markerHeight="12"
        refX="10"
        refY="3.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,0 L0,7 L10,3.5 z" fill={strokeColor} />
      </marker>
    </defs>
  );

  const [edgePath, labelX, labelY] = useMemo(() => {
    switch (variant) {
      case 'solid':
        return getStraightPath({ sourceX, sourceY, targetX, targetY });
      case 'orthogonal':
        return buildOrthogonalPath({ sourceX, sourceY, targetX, targetY });
      case 'curved':
      case 'glow':
      case 'gradient':
      case 'double':
      case 'pulsing':
      case 'highlight':
      case 'dashed':
      case 'dotted':
        return getBezierPath({
          sourceX,
          sourceY,
          sourcePosition,
          targetX,
          targetY,
          targetPosition,
          curvature: variant === 'curved' ? 0.26 : 0.2,
        });
      case 'smart':
      default:
        return resolveSmartRoute({
          sourceX,
          sourceY,
          targetX,
          targetY,
          sourcePosition,
          targetPosition,
        });
    }
  }, [variant, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

  const shouldShowLabel = !Boolean((data as any).suppressLabel) && (hovered || active);
  const edgeClassName = cn(
    'tecm-connection-edge',
    `tecm-connection-edge--${variant}`,
    active && 'tecm-connection-edge--active',
    hovered && 'tecm-connection-edge--hovered',
  );

  const baseStyle = {
    ...(style || {}),
    stroke: strokeColor,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    opacity,
    filter:
      variant === 'glow' || variant === 'highlight' || active || hovered ?
         `drop-shadow(0 0 ${active || hovered ? '10px' : '7px'} ${strokeColor})`
        : undefined,
    strokeDasharray: dashArray,
  };

  const renderLabel = (suffix: string) => (
    <EdgeLabelRenderer>
      <div
        className={cn(
          'pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white shadow-2xl backdrop-blur-xl',
          'transition-all duration-200',
          hovered || active ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        )}
        style={{
          transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          left: 0,
          top: 0,
          background: 'var(--connection-surface)',
          borderColor: strokeColor,
          boxShadow: `0 0 0 1px ${strokeColor}, 0 12px 32px rgba(0,0,0,0.35)`,
        }}
      >
        <span className="flex items-center gap-2 whitespace-nowrap">
          <ArrowRight size={12} className="text-white/80" />
          <span className="max-w-[220px] truncate">{truncateLabel(edgeLabel)}</span>
          {suffix && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/70">
              {suffix}
            </span>
          )}
        </span>
      </div>
    </EdgeLabelRenderer>
  );

  const renderGlowLayer = (extraStyle: Record<string, string | number | undefined> = {}) => (
    <BaseEdge
      id={`${id}-glow`}
      path={edgePath}
      markerEnd={resolvedMarkerEnd}
      interactionWidth={interactionWidth || 32}
      className={edgeClassName}
      style={{
        ...baseStyle,
        strokeWidth: strokeWidth + 4,
        opacity: Math.max(0.08, opacity * 0.22),
        filter: `blur(2px) drop-shadow(0 0 12px ${strokeColor})`,
        pointerEvents: 'none',
        ...extraStyle,
      }}
    />
  );

  const renderMainEdge = (extraStyle: Record<string, string | number | undefined> = {}) => (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={resolvedMarkerEnd}
      interactionWidth={interactionWidth || 32}
      className={edgeClassName}
      style={{
        ...baseStyle,
        ...extraStyle,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );

  if (variant === 'double') {
    return (
      <>
        {sharedDefs}
        {renderGlowLayer({ strokeWidth: strokeWidth + 6, opacity: Math.max(0.14, opacity * 0.24) })}
        {renderMainEdge({ strokeWidth: strokeWidth + 0.6 })}
        {shouldShowLabel && renderLabel('dupla')}
      </>
    );
  }

  if (variant === 'glow') {
    return (
      <>
        {sharedDefs}
        {renderGlowLayer({ strokeWidth: strokeWidth + 5 })}
        {renderMainEdge({ strokeWidth: strokeWidth + 0.8 })}
        {shouldShowLabel && renderLabel('glow')}
      </>
    );
  }

  if (variant === 'gradient') {
    const gradientId = `connection-gradient-${id}`;
    return (
      <>
        {sharedDefs}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--connection-gradient-from)" />
            <stop offset="50%" stopColor="var(--connection-primary)" />
            <stop offset="100%" stopColor="var(--connection-gradient-to)" />
          </linearGradient>
        </defs>
        <BaseEdge
          id={id}
          path={edgePath}
          interactionWidth={interactionWidth || 36}
          className={edgeClassName}
          style={{
            ...baseStyle,
            stroke: `url(#${gradientId})`,
            strokeWidth: strokeWidth + 0.2,
            filter: `drop-shadow(0 0 10px ${strokeColor})`,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
        {shouldShowLabel && renderLabel('gradiente')}
      </>
    );
  }

  if (variant === 'pulsing') {
    return (
      <>
        {sharedDefs}
        {renderGlowLayer({ strokeWidth: strokeWidth + 5, opacity: Math.max(0.12, opacity * 0.2) })}
        {renderMainEdge({
          strokeDasharray: dashArray,
          animation: 'connection-pulse 2.2s ease-in-out infinite, connection-flow 1.8s linear infinite',
        })}
        {shouldShowLabel && renderLabel('alerta')}
      </>
    );
  }

  if (variant === 'dashed' || variant === 'dotted') {
    return (
      <>
        {sharedDefs}
        {renderMainEdge({
          strokeDasharray: dashArray,
          animation: hovered || active ? 'connection-flow 2.2s linear infinite' : undefined,
        })}
        {shouldShowLabel && renderLabel(variant === 'dashed' ? 'traço' : 'pontos')}
      </>
    );
  }

  if (variant === 'highlight') {
    return (
      <>
        {sharedDefs}
        {renderGlowLayer({ strokeWidth: strokeWidth + 4, opacity: Math.max(0.14, opacity * 0.26) })}
        {renderMainEdge({
          strokeWidth: strokeWidth + 0.2,
          strokeDasharray: dashArray,
        })}
        {shouldShowLabel && renderLabel('segurança')}
      </>
    );
  }

  if (variant === 'orthogonal') {
    return (
      <>
        {sharedDefs}
        {renderMainEdge({
          strokeDasharray: dashArray,
        })}
        {shouldShowLabel && renderLabel('90°')}
      </>
    );
  }

  if (variant === 'curved') {
    return (
      <>
        {sharedDefs}
        {renderMainEdge({ strokeWidth: strokeWidth + (active || hovered ? 0.4 : 0) })}
        {shouldShowLabel && renderLabel('curva')}
      </>
    );
  }

  if (variant === 'solid') {
    return (
      <>
        {sharedDefs}
        {renderMainEdge({
          strokeWidth: strokeWidth + 0.2,
        })}
        {shouldShowLabel && renderLabel('sólida')}
      </>
    );
  }

  return (
    <>
      {sharedDefs}
      {renderMainEdge({
        strokeWidth: strokeWidth + (active || hovered ? 0.2 : 0),
        animation: active || hovered ? 'connection-flow 2.4s linear infinite' : undefined,
      })}
      {shouldShowLabel && renderLabel('auto')}
    </>
  );
}
