import styles from "./Header.module.scss";
import { SummaryTicker } from "../Dashboard/SummaryTicker";

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export const Header = ({ title, children }: HeaderProps) => {
  return (
    <header className={styles.headerBanner}>
      {/* Content constrained to pageContent width/padding */}
      <div className={styles.headerContent}>
        {/* Left side: Icon */}
        <div className={styles.headerLeft}>
          <img
            src="/fifa2026-wht.svg"
            alt="FIFA 2026"
            className={styles.icon}
          />
        </div>

        {/* Right side: Title or Children */}
        {(title || children) && (
          <div className={styles.headerRight}>
            {title && <h1>{title}</h1>}
            {children}
          </div>
        )}
      </div>

      {/* Ticker for testing */}
      <SummaryTicker />
    </header>
  );
};
