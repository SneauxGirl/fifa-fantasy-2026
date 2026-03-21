// src/components/SquadCard/SquadCard.tsx
import React, { useState } from "react";
import type { Squad } from "../../types/squad";
import { nationalColors } from "../../lib/nationalColors";
import styles from "./SquadCard.module.scss";

interface SquadCardProps {
  team: Squad;
  fantasyStatus: "active" | "substitute" | "eliminated";
}

export const SquadCard: React.FC<SquadCardProps> = ({ team, fantasyStatus }) => {
  const [showTournament, setShowTournament] = useState(false);

  const {
    name,
    nameLocal,
    code,
    flag,
    fifaRanking,
    historicalPerformance,
    squadPerformance,
    tournamentPerformance,
  } = team;

  // Choose performance data: tournament if available and selected, else squad
  const performanceData = (showTournament && tournamentPerformance) ? tournamentPerformance : squadPerformance;

  const colors = nationalColors[code] ?? ["#888", "#ccc", "#888"];
  const [primary, secondary] = colors;

  const badgeClass =
    fantasyStatus === "active"     ? styles.squadCardBadgeActive     :
    fantasyStatus === "substitute" ? styles.squadCardBadgeSubstitute :
    styles.squadCardBadgeEliminated;

  return (
    <div
      className={styles.squadCard}
      style={{
        "--jersey-primary":   primary,
        "--jersey-secondary": secondary,
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className={styles.squadCardHeader}>
        <div className={styles.squadCardHeaderMeta}>
          <div className={styles.squadCardHeaderLeft}>
            <span className={styles.squadCardFlagBadge}>{flag} {code}</span>
          </div>
          {fifaRanking != null && (
            <span className={styles.squadCardRanking}>FIFA #{fifaRanking}</span>
          )}
        </div>
        <div className={styles.squadCardName}>{name}</div>
        {nameLocal !== name && (
          <div className={styles.squadCardLocalName}>{nameLocal}</div>
        )}
      </div>

      {/* Body */}
      <div className={styles.squadCardBody}>
        <div className={styles.squadCardMeta}>
          <span className={`${styles.squadCardBadge} ${badgeClass}`}>
            {fantasyStatus}
          </span>
        </div>

        {/* Toggle for squad vs tournament stats */}
        {tournamentPerformance ? (
          <div className={styles.squadCardToggle}>
            <button
              className={`${styles.squadCardToggleBtn} ${!showTournament ? styles.squadCardToggleBtnActive : ""}`}
              onClick={() => setShowTournament(false)}
            >
              Players Last 10
            </button>
            <button
              className={`${styles.squadCardToggleBtn} ${showTournament ? styles.squadCardToggleBtnActive : ""}`}
              onClick={() => setShowTournament(true)}
            >
              Tournament
            </button>
          </div>
        ) : null}

        {/* Current season/tournament stats */}
        {performanceData ? (
          <div className={styles.squadCardStatsSection}>
            <span className={styles.squadCardStatsLabel}>
              {showTournament ? "Tournament" : "Squad"} Stats
            </span>
            <div className={styles.squadCardStatsGrid}>
              <div className={styles.squadCardStatBox}>
                <span className={styles.squadCardStatBoxValue}>{performanceData.goalsFor}</span>
                <span className={styles.squadCardStatBoxLabel}>Goals For</span>
              </div>
              <div className={styles.squadCardStatBox}>
                <span className={styles.squadCardStatBoxValue}>{performanceData.goalsAgainst}</span>
                <span className={styles.squadCardStatBoxLabel}>Goals Against</span>
              </div>
              <div className={styles.squadCardStatBox}>
                <span className={styles.squadCardStatBoxValue}>{performanceData.cleanSheets}</span>
                <span className={styles.squadCardStatBoxLabel}>Clean Sheets</span>
              </div>
              <div className={styles.squadCardStatBox}>
                <span className={styles.squadCardStatBoxValue}>🟨 {performanceData.yellowCards} / 🔴 {performanceData.redCards}</span>
                <span className={styles.squadCardStatBoxLabel}>Cards</span>
              </div>
              <div className={styles.squadCardStatBox}>
                <span className={styles.squadCardStatBoxValue}>{performanceData.penaltiesScored}/{performanceData.penaltiesMissed}</span>
                <span className={styles.squadCardStatBoxLabel}>Penalties</span>
              </div>
              <div className={styles.squadCardStatBox}>
                <span className={styles.squadCardStatBoxValue}>{performanceData.shootoutGoals}/{performanceData.shootoutMisses}</span>
                <span className={styles.squadCardStatBoxLabel}>Shootout</span>
              </div>
            </div>
          </div>
        ) : null}

        <span className={styles.squadCardHistoryLabel}>
          World Cup History (Last {historicalPerformance.length})
        </span>
        <table className={styles.squadCardHistory}>
          <thead className={styles.squadCardHistoryHead}>
            <tr>
              <th>Year</th>
              <th>MP</th>
              <th>GF</th>
              <th>GA</th>
              <th>PEN</th>
            </tr>
          </thead>
          <tbody>
            {historicalPerformance.map((h) => (
              <tr key={h.year} className={styles.squadCardHistoryRow}>
                <td>{h.year}</td>
                <td>{h.matchesPlayed}</td>
                <td>{h.goalsFor}</td>
                <td>{h.goalsAgainst}</td>
                <td>{h.penalties}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TODO Phase 4: wire onClick to AI insight dispatch */}
        <button className={styles.squadCardAiBtn}>💡 AI Insights</button>
      </div>
    </div>
  );
};
