import { NavLink } from "react-router-dom";
import styles from "./BottomNav.module.scss";

/**
 * Bottom Navigation Bar
 * Mobile/Tablet only - provides tab-based navigation at bottom of screen
 * Hidden on desktop (768px+)
 */
const BottomNav = () => {
  return (
    <nav className={styles.bottomNav} aria-label="Bottom navigation">
      <NavLink
        to="/"
        className={({ isActive }: { isActive: boolean }) =>
          `${styles.navItem} ${isActive ? styles.active : ""}`
        }
        title="Dashboard"
      >
        <span className={styles.icon}>📊</span>
        <span className={styles.label}>Dashboard</span>
      </NavLink>

      <NavLink
        to="/roster"
        className={({ isActive }: { isActive: boolean }) =>
          `${styles.navItem} ${isActive ? styles.active : ""}`
        }
        title="Roster"
      >
        <span className={styles.icon}>👥</span>
        <span className={styles.label}>Roster</span>
      </NavLink>

      <NavLink
        to="/future-matches"
        className={({ isActive }: { isActive: boolean }) =>
          `${styles.navItem} ${isActive ? styles.active : ""}`
        }
        title="Future Matches"
      >
        <span className={styles.icon}>🏆</span>
        <span className={styles.label}>Matches</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
