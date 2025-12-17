# TOR Traffic Correlation Analysis System

## Overview
A full-stack forensic web application for probabilistic TOR traffic correlation analysis. Built for police cyber forensics investigations.

**IMPORTANT DISCLAIMER**: This system provides probabilistic correlation analysis only. It does NOT claim to de-anonymize TOR traffic. All results should be treated as investigative leads requiring independent verification.

## Current State
- **Backend**: FastAPI server with SQLite database
- **Frontend**: React SPA with dark cyber-forensics theme
- **Status**: Complete and functional with demo data

## Architecture

### Backend (Python FastAPI)
- `/backend/main.py` - Main FastAPI application with CORS, routers, and startup initialization
- `/backend/database.py` - SQLite database setup and connection
- `/backend/models/schemas.py` - Pydantic models for API validation
- `/backend/routers/` - API endpoints:
  - `nodes.py` - TOR node management
  - `sessions.py` - Traffic session management
  - `analysis.py` - Correlation analysis
  - `reports.py` - PDF report generation
- `/backend/services/` - Core services:
  - `tor_simulator.py` - TOR node and traffic simulation
  - `correlation_engine.py` - Traffic correlation with confidence scoring
  - `pcap_analyzer.py` - PCAP file analysis
  - `report_generator.py` - PDF forensic report generation

### Frontend (React + Vite + Tailwind)
- `/frontend/src/App.jsx` - Main app with routing
- `/frontend/src/pages/` - Page components:
  - `Dashboard.jsx` - System overview and quick actions
  - `Nodes.jsx` - TOR node management
  - `Timeline.jsx` - Traffic session visualization
  - `Analysis.jsx` - Correlation analysis
  - `Reports.jsx` - PDF report management
- `/frontend/src/components/` - Reusable UI components
- `/frontend/src/services/api.js` - API client

## Key Features
1. **TOR Node Simulation** - Generate simulated TOR relay descriptors
2. **Traffic Session Management** - PCAP upload and demo traffic generation
3. **Correlation Engine** - Time-window based pattern matching
4. **Confidence Scoring** - Multi-factor scoring (timing, volume, pattern)
5. **PDF Report Generation** - Forensic reports with legal disclaimers

## API Endpoints
- `GET /api/stats` - System statistics
- `GET /api/nodes/` - List TOR nodes
- `POST /api/nodes/generate` - Generate simulated nodes
- `GET /api/sessions/` - List traffic sessions
- `POST /api/sessions/generate-demo` - Generate demo traffic
- `POST /api/sessions/upload-pcap` - Upload PCAP file
- `POST /api/analysis/run` - Run correlation analysis
- `POST /api/reports/generate/{case_id}` - Generate PDF report
- `GET /api/reports/download/{report_id}` - Download PDF

## Running the Application
Backend runs on port 5000, frontend development server proxies API calls.

## Recent Changes
- Initial build: December 2025
- Complete full-stack implementation with all features

## User Preferences
- Dark cyber-forensics theme
- Professional police-friendly language
- Clear forensic disclaimers throughout
