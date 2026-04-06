import React, { useState, useEffect } from 'react';
import { LeaderboardType, LeaderboardEntry } from '../services/leaderboard';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  type: LeaderboardType;
  onTypeChange?: (type: LeaderboardType) => void;
  currentUserId?: string;
}

export function Leaderboard({
  entries,
  type,
  onTypeChange,
  currentUserId,
}: LeaderboardProps) {
  const typeLabels: { [key in LeaderboardType]: string } = {
    highScore: 'HIGH SCORE',
    maxWave: 'MAX WAVE',
    totalKills: 'TOTAL KILLS',
    totalPlayTime: 'PLAYTIME',
    achievements: 'ACHIEVEMENTS',
  };

  const getScoreLabel = (type: LeaderboardType): string => {
    const labels: { [key in LeaderboardType]: string } = {
      highScore: 'Score',
      maxWave: 'Wave',
      totalKills: 'Kills',
      totalPlayTime: 'Hours',
      achievements: 'Count',
    };
    return labels[type];
  };

  const formatScore = (score: number, type: LeaderboardType): string => {
    switch (type) {
      case 'totalKills':
        return score.toLocaleString();
      case 'totalPlayTime':
        return (score / 3600000).toFixed(1);
      default:
        return score.toString();
    }
  };

  return (
    <div
      id="leaderboard"
      style={{
        background: 'rgba(0,0,0,0.8)',
        border: '1px solid rgba(0,255,100,0.3)',
        borderRadius: '8px',
        padding: '20px',
        width: '100%',
        maxWidth: '600px',
        fontFamily: "'Orbitron', monospace",
      }}
    >
      {/* Type Selector */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {Object.keys(typeLabels).map((t) => (
          <button
            key={t}
            onClick={() => onTypeChange?.(t as LeaderboardType)}
            style={{
              padding: '8px 12px',
              fontSize: '11px',
              background: type === t ? 'rgba(0,255,100,0.3)' : 'rgba(0,255,100,0.1)',
              border: `1px solid rgba(0,255,100,${type === t ? 0.6 : 0.3})`,
              color: 'rgba(0,255,100,1)',
              cursor: 'pointer',
              borderRadius: '4px',
              transition: 'all 0.2s',
            }}
          >
            {typeLabels[t as LeaderboardType]}
          </button>
        ))}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'rgba(0,255,100,1)',
          marginBottom: '15px',
          textAlign: 'center',
          letterSpacing: '2px',
          borderBottom: '1px solid rgba(0,255,100,0.2)',
          paddingBottom: '10px',
        }}
      >
        {typeLabels[type]}
      </div>

      {/* Leaderboard Entries */}
      <div
        style={{
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        {entries.length > 0 ? (
          entries.map((entry, index) => {
            const isCurrentUser = entry.uid === currentUserId;
            return (
              <div
                key={`${entry.uid}-${index}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 8px',
                  marginBottom: '4px',
                  background: isCurrentUser ? 'rgba(0,255,100,0.1)' : 'transparent',
                  border: isCurrentUser ? '1px solid rgba(0,255,100,0.4)' : 'none',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: isCurrentUser ? 'rgba(0,255,100,1)' : 'rgba(0,255,100,0.8)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <span
                    style={{
                      width: '30px',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: entry.rank <= 3 ? 'rgba(255,200,100,1)' : 'inherit',
                    }}
                  >
                    #{entry.rank}
                  </span>
                  {entry.photoURL && (
                    <img
                      src={entry.photoURL}
                      alt={entry.displayName}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        border: '1px solid rgba(0,255,100,0.3)',
                      }}
                    />
                  )}
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {entry.displayName}
                  </span>
                </div>
                <span style={{ fontWeight: 'bold', minWidth: '80px', textAlign: 'right' }}>
                  {formatScore(entry.score, type)} {getScoreLabel(type)}
                </span>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', color: 'rgba(0,255,100,0.5)', padding: '20px' }}>
            No leaderboard data available
          </div>
        )}
      </div>
    </div>
  );
}
