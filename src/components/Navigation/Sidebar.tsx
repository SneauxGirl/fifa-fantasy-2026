import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.scss";

interface SidebarProps {
  onNavigate?: () => void;
}

/**
 * Sidebar Navigation
 * Shows links to Dashboard, Roster, and Future Matches
 * Collapsible on mobile, always visible on tablet+
 */
const Sidebar = ({ onNavigate }: SidebarProps) => {
  const handleNavClick = () => {
    onNavigate?.();
  };

  return (
    <div className={styles.sidebar} id="sidebar">
      <nav className={styles.navList} aria-label="Sidebar navigation">
        <NavLink
          to="/"
          className={({ isActive }: { isActive: boolean }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          onClick={handleNavClick}
        >
          <span className={styles.icon}>📊</span>
          <span className={styles.label}>Dashboard</span>
        </NavLink>

        <NavLink
          to="/roster"
          className={({ isActive }: { isActive: boolean }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          onClick={handleNavClick}
        >
          <span className={styles.icon}>👥</span>
          <span className={styles.label}>Roster</span>
        </NavLink>

        <NavLink
          to="/future-matches"
          className={({ isActive }: { isActive: boolean }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          onClick={handleNavClick}
        >
          <span className={styles.icon}>🏆</span>
          <span className={styles.label}>Future Matches</span>
        </NavLink>
      </nav>

      {/* Optional: User info or additional sidebar content */}
      <div className={styles.sidebarFooter}>
        <p className={styles.footerText}>2026 World Cup Fantasy</p>
      </div>
    </div>
  );
};

export default Sidebar;
