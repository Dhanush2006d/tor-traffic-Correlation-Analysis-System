import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Shield, Network, Clock, Search, FileText, Activity } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Nodes from './pages/Nodes';
import Timeline from './pages/Timeline';
import Analysis from './pages/Analysis';
import CaseWorkspace from './pages/CaseWorkspace';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cyber-dark flex">
        <nav className="w-64 bg-cyber-primary border-r border-cyber-accent/30 flex flex-col">
          <div className="p-6 border-b border-cyber-accent/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyber-accent flex items-center justify-center animate-pulse-glow">
                <Shield className="w-6 h-6 text-cyber-highlight" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-cyber-highlight">TOR TRAFFIC</h1>
                <p className="text-xs text-cyber-muted">Correlation Analysis</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4">
            <div className="space-y-2">
              <NavItem to="/" icon={Activity} label="Dashboard" />
              <NavItem to="/nodes" icon={Network} label="TOR Nodes" />
              <NavItem to="/timeline" icon={Clock} label="Timeline" />
              <NavItem to="/analysis" icon={Search} label="Analysis" />
              <NavItem to="/reports" icon={FileText} label="Reports" />
            </div>
          </div>

          <div className="p-4 border-t border-cyber-accent/30">
            <div className="cyber-card rounded-lg p-3">
              <p className="text-xs text-cyber-warning font-medium mb-1">DISCLAIMER</p>
              <p className="text-xs text-cyber-muted leading-relaxed">
                This system provides probabilistic correlation analysis only.
                Results are NOT definitive identification.
              </p>
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/nodes" element={<Nodes />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/analysis" element={<Navigate to="/case/demo-case" replace />} />
            <Route path="/case/:caseId" element={<CaseWorkspace />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
          ? 'bg-cyber-accent text-cyber-highlight cyber-glow'
          : 'text-cyber-muted hover:bg-cyber-secondary hover:text-cyber-text'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium text-sm">{label}</span>
    </NavLink>
  );
}

export default App;
