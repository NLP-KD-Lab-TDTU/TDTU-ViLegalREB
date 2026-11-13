import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand info */}
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <span className="brand-title">TDTU-ViLegalREB</span>
            </div>
            <p className="footer-desc">
              Vietnamese Legal Retrieval Embedding Benchmark.
            </p>
            <div className="footer-meta">
              <span className="footer-lab">
                Developed by{' '}
                <a
                  href="https://huggingface.co/datasets/NLP-KD-Lab-TDTU/TDTU-ViLegalREB"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <strong>NLP & KD Lab</strong>
                </a>
              </span>
              <span className="footer-school">
                <a
                  href="https://it.tdtu.edu.vn/en"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Faculty of Information Technology, Ton Duc Thang University
                </a>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <a href="#about-benchmark">Overview</a>
              </li>
              <li>
                <Link to="/construction">Construction</Link>
              </li>
              <li>
                <Link to="/leaderboard">Leaderboard</Link>
              </li>
              <li>
                <Link to="/submission">Submit Results</Link>
              </li>
            </ul>
          </div>

          {/* Tracks */}
          <div className="footer-col">
            <h4 className="footer-heading">Tracks</h4>
            <ul className="footer-links">
              <li>
                <span className="footer-text-link">Full Corpus Retrieval</span>
              </li>
              <li>
                <span className="footer-text-link">Candidate Re-ranking</span>
              </li>
              <li>
                <span className="footer-text-link">Core Relevance</span>
              </li>
              <li>
                <span className="footer-text-link">All Relevance</span>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-col">
            <h4 className="footer-heading">Resources</h4>
            <ul className="footer-links">
              <li>
                <a
                  href="https://github.com/vilegalreb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a
                  href="https://huggingface.co/datasets/NLP-KD-Lab-TDTU/TDTU-ViLegalREB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  <span>Dataset</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:nlpkd-lab@tdtu.edu.vn"
                  className="external-link"
                >
                  <span>Contact</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © {new Date().getFullYear()} TDTU-ViLegalREB Leaderboard. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <a
              href="https://huggingface.co/datasets/NLP-KD-Lab-TDTU/TDTU-ViLegalREB"
              target="_blank"
              rel="noopener noreferrer"
            >
              TDTU NLP & KD Laboratory
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
