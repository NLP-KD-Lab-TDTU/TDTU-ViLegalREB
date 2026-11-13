import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const [scrollRatio, setScrollRatio] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = 60;
      const current = window.scrollY;
      const ratio = Math.min(1, Math.max(0, current / maxScroll));
      setScrollRatio(ratio);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className="site-header"
      style={{
        borderBottomColor: `rgba(var(--border-rgb), ${scrollRatio})`,
        boxShadow:
          scrollRatio > 0
            ? `0 4px 16px -2px rgba(0, 0, 0, ${0.05 * scrollRatio})`
            : 'none',
      }}
    >
      <div className="header-inner">
        {/* Brand */}
        <Link to="/" className="header-brand">
          <div className="brand-text">
            <span className="brand-title">TDTU-ViLegalREB</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Leaderboard
          </NavLink>
          <NavLink
            to="/construction"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Construction
          </NavLink>          
          <NavLink
            to="/submission"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Submission
          </NavLink>
        </nav>

        {/* Actions */}
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
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/construction"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          >
            Construction
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          >
            Leaderboard
          </NavLink>
          <NavLink
            to="/submission"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          >
            Submission
          </NavLink>
        </div>
      )}
    </header>
  );
};
