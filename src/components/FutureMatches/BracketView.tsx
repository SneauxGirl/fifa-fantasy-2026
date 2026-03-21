import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { openMatchModal } from "../../store/slices/uiSlice";
import { selectMatchesByStage, selectSignedSquadIds } from "../../store/selectors/scoringSelectors";
import type { Match } from "../../types/match";
import { transformMatch } from "../../lib/dataTransform";
import styles from "./BracketView.module.scss";

/**
 * BracketView Component
 * Desktop tournament bracket view showing groups and knockout stages.
 */
export const BracketView: React.FC = () => {
  const dispatch = useAppDispatch();
  const [expandedStage, setExpandedStage] = useState<string | null>("groups");

  const matchesByStage = useAppSelector(selectMatchesByStage);
  const rosterSquads = useAppSelector(selectSignedSquadIds);

  const stages = [
    { id: "groups", name: "Group Stage", matches: matchesByStage["Group Stage"], count: matchesByStage["Group Stage"].length },
    { id: "round32", name: "Round of 32", matches: matchesByStage["Round of 32"], count: matchesByStage["Round of 32"].length },
    { id: "round16", name: "Round of 16", matches: matchesByStage["Round of 16"], count: matchesByStage["Round of 16"].length },
    { id: "quarters", name: "Quarterfinals", matches: matchesByStage["Quarterfinals"], count: matchesByStage["Quarterfinals"].length },
    { id: "semis", name: "Semifinals", matches: matchesByStage["Semifinals"], count: matchesByStage["Semifinals"].length },
    { id: "final", name: "Final", matches: matchesByStage["Final"], count: matchesByStage["Final"].length },
  ];

  const handleMatchClick = (match: Match) => {
    dispatch(openMatchModal(match));
  };

  const isRosterMatch = (match: Match) => {
    return (
      rosterSquads.includes(match.homeTeam.id) || rosterSquads.includes(match.awayTeam.id)
    );
  };

  return (
    <div className={styles.bracketView}>
      <div className={styles.bracketContainer}>
        {stages.map((stage) => (
          <div key={stage.id} className={styles.stage}>
            <button
              className={`${styles.stageHeader} ${
                expandedStage === stage.id ? styles.expanded : ""
              }`}
              onClick={() =>
                setExpandedStage(expandedStage === stage.id ? null : stage.id)
              }
            >
              <span className={styles.stageName}>{stage.name}</span>
              <span className={styles.stageCount}>{stage.count} matches</span>
              <span className={styles.toggle}>
                {expandedStage === stage.id ? "▼" : "▶"}
              </span>
            </button>

            {expandedStage === stage.id && stage.matches.length > 0 && (
              <div className={styles.stageMatches}>
                {stage.matches.map((match) => (
                  <MatchBracketItem
                    key={match.id}
                    match={match}
                    isRoster={isRosterMatch(match)}
                    onClick={() => handleMatchClick(match)}
                  />
                ))}
              </div>
            )}

            {expandedStage === stage.id && stage.matches.length === 0 && (
              <div className={styles.noMatches}>
                <p>No matches scheduled for this stage</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * MatchBracketItem Component
 * Single match display in bracket.
 */
interface MatchBracketItemProps {
  match: Match;
  isRoster: boolean;
  onClick: () => void;
}

const MatchBracketItem: React.FC<MatchBracketItemProps> = ({
  match,
  isRoster,
  onClick,
}) => {
  const displayMatch = transformMatch(match);
  const isFinished = match.status.short === "FT" || match.status.short === "AET";
  const isLive = ["1H", "2H", "ET", "HT", "P"].includes(match.status.short);

  const getStatusDisplay = () => {
    if (isLive) return `${match.status.elapsed}'`;
    if (isFinished) return "Final";
    if (match.status.short === "NS") {
      return new Date(match.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
    return match.status.short;
  };

  return (
    <button
      className={`${styles.matchItem} ${isRoster ? styles.rosterMatch : ""} ${
        isLive ? styles.liveMatch : ""
      }`}
      onClick={onClick}
    >
      <div className={styles.matchHeader}>
        {isRoster && <span className={styles.rosterBadge}>📊</span>}
        {isLive && <span className={styles.liveBadge}>🔴</span>}
      </div>

      <div className={styles.teams}>
        <div className={styles.team}>
          <span className={styles.teamName}>{match.homeTeam.code}</span>
          {isFinished && (
            <span className={styles.score}>{displayMatch.score.home}</span>
          )}
        </div>

        <div className={styles.vs}>vs</div>

        <div className={styles.team}>
          {isFinished && (
            <span className={styles.score}>{displayMatch.score.away}</span>
          )}
          <span className={styles.teamName}>{match.awayTeam.code}</span>
        </div>
      </div>

      <div className={styles.matchFooter}>
        <span className={styles.status}>{getStatusDisplay()}</span>
        {match.venue && (
          <span className={styles.venue} title={match.venue.name}>
            {match.venue.city}
          </span>
        )}
      </div>
    </button>
  );
};
