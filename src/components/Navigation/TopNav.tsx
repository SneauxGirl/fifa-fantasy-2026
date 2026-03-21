import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { toggleSidebar } from "../../store/slices/uiSlice";
import styles from "./TopNav.module.scss";

/**
 * Top Navigation Bar
 * - Logo/branding (left)
 * - Hamburger menu for mobile (right)
 * - Minimal on mobile, slightly more content on tablet+
 */
const TopNav = () => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebar.open);

  const toggleMenu = () => {
    dispatch(toggleSidebar());
  };

  return (
    <nav className={styles.topNav} aria-label="Main navigation">
      <div className={styles.navContainer}>
        {/* Logo / Branding */}
        <Link to="/" className={styles.logo} aria-label="Home">
          <span className={styles.logoText}>FF26</span>
        </Link>

        {/* Center - Title (hidden on mobile) */}
        <div className={styles.navTitle}>
          <h1>FIFA Fantasy 2026</h1>
        </div>

        {/* Right - Hamburger Menu (mobile only) */}
        <button
          className={`${styles.hamburger} ${sidebarOpen ? styles.active : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={sidebarOpen}
          aria-controls="sidebar"
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>
      </div>
    </nav>
  );
};

export default TopNav;
