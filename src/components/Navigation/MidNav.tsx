import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./MidNav.module.scss";

/**
 * Middle Navigation Bar (App Navigation)
 * - Logo/branding (left)
 * - Navigation links (center, desktop only)
 * - Hamburger menu (mobile only)
 * - Black background, white text (always)
 */
const MidNav = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className={styles.midNav} aria-label="Main navigation">
      <div className={styles.navContainer}>
        {/* Hamburger Menu (mobile only) */}
        <button
          className={`${styles.hamburger} ${mobileMenuOpen ? styles.active : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>

        {/* Logo / Branding */}
        <Link to="/" className={styles.logo} aria-label="Home">
          <img src="/fifa2026-wht.svg" alt="FIFA 2026" className={styles.logoImg} />
        </Link>

        {/* Center - Title (hidden on mobile) */}
        <div className={styles.navTitle}>
          <h1>FIFA Fantasy 2026</h1>
        </div>

        {/* Navigation Links (hidden on mobile) */}
        <div className={styles.navLinks}>
          <Link
            to="/"
            className={`${styles.navLink} ${isActive("/") ? styles.active : ""}`}
          >
            Dashboard
          </Link>
          <Link
            to="/roster"
            className={`${styles.navLink} ${isActive("/roster") ? styles.active : ""}`}
          >
            Roster
          </Link>
          <Link
            to="/future-matches"
            className={`${styles.navLink} ${isActive("/future-matches") ? styles.active : ""}`}
          >
            Matches
          </Link>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuHeader}>
            <img src="/fifa2026-wht.svg" alt="FIFA 2026" className={styles.mobileLogoImg} />
            <button
              className={styles.closeButton}
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <nav className={styles.mobileLinks}>
            <Link
              to="/"
              className={`${styles.mobileLink} ${isActive("/") ? styles.active : ""}`}
              onClick={handleNavClick}
            >
              Dashboard
            </Link>
            <Link
              to="/roster"
              className={`${styles.mobileLink} ${isActive("/roster") ? styles.active : ""}`}
              onClick={handleNavClick}
            >
              Roster
            </Link>
            <Link
              to="/future-matches"
              className={`${styles.mobileLink} ${isActive("/future-matches") ? styles.active : ""}`}
              onClick={handleNavClick}
            >
              Matches
            </Link>
          </nav>
        </div>
      )}
    </nav>
  );
};

export default MidNav;
