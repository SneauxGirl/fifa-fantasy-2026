import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { openMatchModal } from "../../store/slices/uiSlice";
import {
  selectAllMatches,
  selectSignedSquadIds,
  selectSignedPlayerTeamIds,
} from "../../store/selectors/scoringSelectors";
import type { Match } from "../../types/match";
import { transformMatch } from "../../lib/dataTransform";
import styles from "./MatchList.module.scss";

type FilterStatus = "all" | "upcoming" | "live" | "finished";

/**
 * MatchList Component
 * Displays all matches with filtering by status.
 * Highlights roster matches (where user has selected players).
 * Click to open MatchCardModal.
 */
export const MatchList: React.FC = () => {
  const dispatch = useAppDispatch();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const matches = useAppSelector(selectAllMatches);
  const rosterSquads = useAppSelector(selectSignedSquadIds);
  const rosterPlayers = useAppSelector(selectSignedPlayerTeamIds);
  const isLoading = useAppSelector((state) => state.matches.isLoading);
  const error = useAppSelector((state) => state.matches.error);

  // Filter matches by status
  const filteredMatches = matches.filter((match) => {
    if (filterStatus === "upcoming") {
      return match.status.short === "NS";
    }
    if (filterStatus === "live") {
      return ["1H", "2H", "ET", "HT", "P"].includes(match.status.short);
    }
    if (filterStatus === "finished") {
      return match.status.short === "FT" || match.status.short === "AET";
    }
    return true; // "all"
  });

  // Check if match is a roster match
  const isRosterMatch = (match: Match) => {
    const hasRosterTeam =
      rosterSquads.includes(match.homeTeam.id) || rosterSquads.includes(match.awayTeam.id);
    const hasRosterPlayer =
      rosterPlayers.includes(match.homeTeam.id) || rosterPlayers.includes(match.awayTeam.id);
    return hasRosterTeam || hasRosterPlayer;
  };

  // Get match status display
  const getStatusDisplay = (match: Match) => {
    switch (match.status.short) {
      case "NS":
        return "Upcoming";
      case "1H":
      case "2H":
      case "ET":
        return `${match.status.elapsed}'`;
      case "HT":
        return "HT";
      case "P":
        return "Penalties";
      case "FT":
      case "AET":
        return "Final";
      default:
        return match.status.short;
    }
  };

  const handleMatchClick = (match: Match) => {
    dispatch(openMatchModal(match));
  };

  return (
    <div className={styles.matchList}>
      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.tab} ${filterStatus === "all" ? styles.active : ""}`}
          onClick={() => setFilterStatus("all")}
        >
          All
        </button>
        <button
          className={`${styles.tab} ${filterStatus === "upcoming" ? styles.active : ""}`}
          onClick={() => setFilterStatus("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`${styles.tab} ${filterStatus === "live" ? styles.active : ""}`}
          onClick={() => setFilterStatus("live")}
        >
          Live
        </button>
        <button
          className={`${styles.tab} ${filterStatus === "finished" ? styles.active : ""}`}
          onClick={() => setFilterStatus("finished")}
        >
          Finished
        </button>
      </div>

      {/* Match Items */}
      <div className={styles.matchItems}>
        {isLoading && (
          <div className={styles.loadingState}>
            <p>Loading matches...</p>
          </div>
        )}
        {error && (
          <div className={styles.errorState}>
            <p>Error loading matches</p>
            <p className={styles.errorMessage}>{error}</p>
          </div>
        )}
        {!isLoading && !error && filteredMatches.length === 0 && (
          <div className={styles.emptyState}>
            <p>No matches found for this filter</p>
          </div>
        )}
        {filteredMatches.map((match) => {
          const isRoster = isRosterMatch(match);
          const isLive = ["1H", "2H", "ET", "HT", "P"].includes(match.status.short);

          return (
            <div
              key={match.id}
              className={`${styles.matchItem} ${isRoster ? styles.rosterMatch : ""} ${
                isLive ? styles.liveMatch : ""
              }`}
              onClick={() => handleMatchClick(match)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleMatchClick(match);
                }
              }}
            >
              {isRoster && <div className={styles.rosterBadge}>📊</div>}
              {isLive && <div className={styles.liveBadge}>🔴 LIVE</div>}

              <div className={styles.matchContent}>
                <div className={styles.matchHeader}>
                  <div className={styles.teams}>
                    <span className={styles.team}>{match.homeTeam.name}</span>
                    <span className={styles.vs}>vs</span>
                    <span className={styles.team}>{match.awayTeam.name}</span>
                  </div>
                  <div className={styles.status}>{getStatusDisplay(match)}</div>
                </div>

                <div className={styles.matchDetails}>
                  {(() => {
                    const displayMatch = transformMatch(match);
                    return (
                      <>
                        {(match.status.short === "FT" || match.status.short === "AET") ? (
                          <span className={styles.score}>
                            {displayMatch.score.home} - {displayMatch.score.away}
                          </span>
                        ) : match.status.short === "NS" ? (
                          <span className={styles.dateTime}>
                            {new Date(match.date).toLocaleDateString()} ·{" "}
                            {new Date(match.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        ) : (
                          <span className={styles.score}>
                            {displayMatch.score.home} - {displayMatch.score.away}
                          </span>
                        )}
                        {match.venue && <span className={styles.venue}>{match.venue.name}</span>}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
