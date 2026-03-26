import styles from "./TopNav.module.scss";

/**
 * Top Navigation Bar (FIFA Links)
 * - External links to FIFA services
 * - Right-aligned
 * - Black background, white text (always)
 * - Matches FIFA.com style
 */
const TopNav = () => {
  const links = [
    { label: "World Cup 2026", href: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026" },
    { label: "Tickets and Hospitality", href: "https://www.fifa.com/tickets" },
    { label: "FIFA Store", href: "https://store.fifa.com/" },
    { label: "FIFA Rewards", href: "https://www.fifa.com/en/rewards" },
    { label: "FIFA+", href: "https://www.fifa.com/fifaplus" },
    { label: "Inside FIFA", href: "https://inside.fifa.com/" },
  ];

  return (
    <nav className={styles.topNav} aria-label="FIFA services">
      <div className={styles.navContainer}>
        <div className={styles.logoSection}>
          <img src="/FIFA_Logo_White_Generic.png" alt="FIFA World Cup 2026" className={styles.logo} />
        </div>
        <div className={styles.linkGroup}>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
