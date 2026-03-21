// src/components/PlayerCard/PlayerCard.tsx
import React, { useState } from "react";
import type { Player } from "../../types/player";
import type { RosterPlayer } from "../../types/match";
import { nationalColors, nationalFlags } from "../../lib/nationalColors";
import styles from "./PlayerCard.module.scss";

interface PlayerCardProps {
  player: Player | RosterPlayer;
  fantasyStatus: "available" | "starter" | "bench" | "eliminated";
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, fantasyStatus }) => {
  const [showTournament, setShowTournament] = useState(false);

  const isRosterPlayer = (p: Player | RosterPlayer): p is RosterPlayer => "type" in p && p.type === "player";

  const firstName = !isRosterPlayer(player) ? player.firstName : "";
  const lastName = !isRosterPlayer(player) ? player.lastName : "";
  const position = player.position;
  const nationalityCode = !isRosterPlayer(player) ? player.nationalityCode : player.code;
  const club = !isRosterPlayer(player) ? player.club : "—";
  const photoUrl = !isRosterPlayer(player) ? player.photoUrl : undefined;
  const recentPerformance = !isRosterPlayer(player) ? player.recentPerformance : [];
  const tournamentPerformance = !isRosterPlayer(player) ? player.tournamentPerformance : undefined;
  const isMvp = !isRosterPlayer(player) ? player.isMvp : false;

  const flagColors = nationalColors[nationalityCode] ?? ["#888", "#ccc", "#888"];
  const flagEmoji  = nationalFlags[nationalityCode] ?? "";

  // Choose performance data: tournament if available and selected, else pre-tournament
  const performanceData = (showTournament && tournamentPerformance?.length) ? tournamentPerformance : recentPerformance;
  const matchCount = performanceData.length;

  // Aggregate stats
  const totalMinutes       = performanceData.reduce((sum, s) => sum + s.minutesPlayed, 0);
  const totalGoals         = performanceData.reduce((sum, s) => sum + s.goals, 0);
  const totalAssists       = performanceData.reduce((sum, s) => sum + s.assists, 0);
  const totalPenalties     = performanceData.reduce((sum, s) => sum + s.penaltiesScored, 0);
  const totalYellowCards   = performanceData.reduce((sum, s) => sum + s.yellowCards, 0);
  const totalRedCards      = performanceData.reduce((sum, s) => sum + s.redCards, 0);
  const totalShootoutGoals = performanceData.reduce((sum, s) => sum + (s.shootoutGoals ?? 0), 0);
  const totalShootoutMisses = performanceData.reduce((sum, s) => sum + (s.shootoutMisses ?? 0), 0);
  const totalShootoutSaves = performanceData.reduce((sum, s) => sum + (s.shootoutSaves ?? 0), 0);
  const totalSaves         = performanceData.reduce((sum, s) => sum + (s.saves ?? 0), 0);
  const totalCleanSheets   = performanceData.filter(s => s.cleanSheet === true).length;

  // Shootout display (made/opportunities)
  const shootoutOpportunities = totalShootoutGoals + totalShootoutMisses;
  const isGk = position === "GK";
  const isDefensive = position === "GK" || position === "DEF";

  const badgeClass =
    fantasyStatus === "starter"   ? styles.playerCardBadgeStarter   :
    fantasyStatus === "eliminated" ? styles.playerCardBadgeEliminated :
    fantasyStatus === "available"  ? styles.playerCardBadgeAvailable  :
    styles.playerCardBadge;

  return (
    <div
      className={styles.playerCard}
      style={{
        "--flag-color-1": flagColors[0],
        "--flag-color-2": flagColors[1],
        "--flag-color-3": flagColors[2],
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className={styles.playerCardHeader}>
        <div className={styles.playerCardHeaderMeta}>
          <span className={styles.playerCardNationalityBadge}>{flagEmoji} {nationalityCode}</span>
          <span className={styles.playerCardPositionLabel}>{position}</span>
        </div>
        <div className={styles.playerCardName}>{firstName} {lastName}</div>
        {isMvp && (
          <span className={styles.playerCardMvpTrophy} aria-label="MVP">🏆</span>
        )}
      </div>

      {/* Photo + Body — stacked on mobile, side-by-side at tablet+ */}
      <div className={styles.playerCardLayout}>
        <div className={styles.playerCardPhotoWrap}>
          <img
            src={photoUrl ?? ""}
            alt={`${firstName} ${lastName}`}
            className={styles.playerCardPhoto}
          />
        </div>

        <div className={styles.playerCardBody}>
          <div className={styles.playerCardMeta}>
            <span className={`${styles.playerCardBadge} ${badgeClass}`}>
              {fantasyStatus}
            </span>
          </div>

          {/* Toggle button — club name or tournament */}
          {tournamentPerformance?.length ? (
            <div className={styles.playerCardToggle}>
              <button
                className={`${styles.playerCardToggleBtn} ${!showTournament ? styles.playerCardToggleBtnActive : ""}`}
                onClick={() => setShowTournament(false)}
              >
                {club}
              </button>
              <button
                className={`${styles.playerCardToggleBtn} ${showTournament ? styles.playerCardToggleBtnActive : ""}`}
                onClick={() => setShowTournament(true)}
              >
                Tournament
              </button>
            </div>
          ) : null}

          <span className={styles.playerCardStatsLabel}>
            Last {matchCount} Matches
          </span>

          {/* Primary stats row */}
          <div className={styles.playerCardStatsRow}>
            <div className={styles.playerCardStatItem}>
              <span className={styles.playerCardStatValue}>⏱ {totalMinutes}</span>
              <span className={styles.playerCardStatUnit}>m</span>
            </div>
            <div className={styles.playerCardStatItem}>
              <span className={styles.playerCardStatValue}>{totalGoals}</span>
              <span className={styles.playerCardStatUnit}>g</span>
            </div>
            <div className={styles.playerCardStatItem}>
              <span className={styles.playerCardStatValue}>{totalAssists}</span>
              <span className={styles.playerCardStatUnit}>a</span>
            </div>
            <div className={styles.playerCardStatItem}>
              <span className={styles.playerCardStatValue}>{totalPenalties}</span>
              <span className={styles.playerCardStatUnit}>p</span>
            </div>
          </div>

          {/* Secondary stats row: cards, shootout, position-specific */}
          <div className={styles.playerCardStatsRow}>
            <div className={styles.playerCardStatItem}>
              <span className={styles.playerCardStatValue}>🟨 {totalYellowCards}</span>
              <span className={styles.playerCardStatUnit}>yc</span>
            </div>
            <div className={styles.playerCardStatItem}>
              <span className={styles.playerCardStatValue}>🔴 {totalRedCards}</span>
              <span className={styles.playerCardStatUnit}>rc</span>
            </div>
            <div className={styles.playerCardStatItem}>
              <span className={styles.playerCardStatValue}>{isGk ? totalShootoutSaves : totalShootoutGoals}/{shootoutOpportunities || "-"}</span>
              <span className={styles.playerCardStatUnit}>{isGk ? "so" : "so"}</span>
            </div>
            {isDefensive && (
              <div className={styles.playerCardStatItem}>
                <span className={styles.playerCardStatValue}>{isGk ? totalSaves : totalCleanSheets}</span>
                <span className={styles.playerCardStatUnit}>{isGk ? "sv" : "cs"}</span>
              </div>
            )}
          </div>

          {/* TODO Phase 4: wire onClick to AI insight dispatch */}
          <button className={styles.playerCardAiBtn}>💡 AI Insights</button>
        </div>
      </div>
    </div>
  );
};
