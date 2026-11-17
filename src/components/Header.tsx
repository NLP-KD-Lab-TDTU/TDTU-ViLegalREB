import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/construction', label: 'Construction' },
  { to: '/submission', label: 'Submission' },
];

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 4);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className={`site-header${isScrolled ? ' is-scrolled' : ''}`}>
      <div className="header-inner">
        <Link to="/" className="header-brand">
          <div className="brand-text">
            <span className="brand-title">TDTU-ViLegalREB</span>
          </div>
        </Link>

        <nav className="header-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <a
            href="https://huggingface.co/datasets/NLP-KD-Lab-TDTU/TDTU-ViLegalREB"
            target="_blank"
            rel="noopener noreferrer"
            className="header-icon-btn"
            title="Hugging Face Dataset"
            aria-label="Hugging Face Dataset"
          >
            <img
              src={`${import.meta.env.BASE_URL}Hf-logo-without-title.svg`}
              alt="Hugging Face"
              className="hf-header-icon"
              width={20}
              height={20}
            />
          </a>
          <Link to="/submission" className="header-cta-btn">
            Submit Run
          </Link>
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};
