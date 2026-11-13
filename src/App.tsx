import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LeaderboardProvider } from './context/LeaderboardContext';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { ConstructionPage } from './pages/ConstructionPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { SubmissionPage } from './pages/SubmissionPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <LeaderboardProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="construction" element={<ConstructionPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="submission" element={<SubmissionPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </LeaderboardProvider>
    </BrowserRouter>
  );
};

export default App;
