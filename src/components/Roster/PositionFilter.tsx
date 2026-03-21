import React from "react";
import styles from "./PositionFilter.module.scss";

type PositionType = "GK" | "DEF" | "MID" | "FWD" | "ALL";

interface PositionFilterProps {
  selectedPosition: PositionType;
  onPositionChange: (position: PositionType) => void;
}

/**
 * PositionFilter Component
 * Dropdown to filter players by position.
 * Positions: GK, DEF, MID, FWD, ALL
 */
export const PositionFilter: React.FC<PositionFilterProps> = ({
  selectedPosition,
  onPositionChange,
}) => {
  const positions: PositionType[] = ["ALL", "GK", "DEF", "MID", "FWD"];

  const positionLabels: Record<PositionType, string> = {
    ALL: "All Positions",
    GK: "Goalkeeper (GK)",
    DEF: "Defender (DEF)",
    MID: "Midfielder (MID)",
    FWD: "Forward (FWD)",
  };

  return (
    <div className={styles.positionFilter}>
      <label htmlFor="position-select" className={styles.label}>
        Filter by Position:
      </label>
      <select
        id="position-select"
        className={styles.select}
        value={selectedPosition}
        onChange={(e) => onPositionChange(e.target.value as PositionType)}
      >
        {positions.map((position) => (
          <option key={position} value={position}>
            {positionLabels[position]}
          </option>
        ))}
      </select>
    </div>
  );
};
