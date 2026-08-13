/**
 * GamificationBadge Component
 * Displays user badges and achievements with animations
 */

import { motion } from 'motion/react';
import type { UserBadge, BadgeType } from '../types/assessments';
import { BADGE_DEFINITIONS } from '../types/assessments';

interface GamificationBadgeProps {
  badge: UserBadge;
  size: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function GamificationBadge({ badge, size = 'md', showTooltip = true }: GamificationBadgeProps) {
  const badgeDef = BADGE_DEFINITIONS[badge.badge_type as BadgeType];
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl'
  };

  return (
    <div className="relative group">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold overflow-hidden`}
        style={{
          backgroundColor: badge.badge_color + '20',
          border: `2px solid ${badge.badge_color}`,
          color: badge.badge_color
        }}
      >
        {badge.badge_image_url ? (
          <img
            src={badge.badge_image_url}
            alt={badge.badge_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="leading-none">{badge.badge_icon || badgeDef.icon || '🏅'}</span>
        )}
      </motion.div>

      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap z-10 pointer-events-none"
        >
          <div className="font-semibold">{badge.badge_name}</div>
          {badge.badge_description && (
            <div className="text-slate-300 mt-1">{badge.badge_description}</div>
          )}
          <div className="text-slate-400 mt-1 text-xs">
            {new Date(badge.earned_at).toLocaleDateString('pt-BR')}
          </div>
        </motion.div>
      )}
    </div>
  );
}

interface BadgeGridProps {
  badges: UserBadge[];
  maxDisplay: number;
}

export function BadgeGrid({ badges, maxDisplay = 8 }: BadgeGridProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const hiddenCount = badges.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-3">
      {displayBadges.map((badge) => (
        <GamificationBadge key={badge.id} badge={badge} size="md" />
      ))}
      {hiddenCount > 0 && (
        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold">
          +{hiddenCount}
        </div>
      )}
    </div>
  );
}

interface BadgeProgressProps {
  earnedBadges: UserBadge[];
  totalBadges: number;
}

export function BadgeProgress({ earnedBadges, totalBadges }: BadgeProgressProps) {
  const progress = (earnedBadges.length / totalBadges) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">Conquistas</span>
        <span className="text-white font-semibold">{earnedBadges.length}/{totalBadges}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full"
        />
      </div>
    </div>
  );
}
