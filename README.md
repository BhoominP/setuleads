<p align="center">
  <a href="https://github.com/your-org/setuleads">
    <img src="src/assets/Setuleads_horizontal.svg" alt="SetuLeads Logo" width="520" />
  </a>
</p>

<h1 align="center">⚡ SETULEADS — STRUCTURAL WEB INSPECTION & PROSPECT DISCOVERY ENGINE</h1>

<p align="center">
  <strong>v1.1 Tactical Intelligence Bridge • Next-Gen Prospect Harvesting & CRM Workstation</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/VERSION-v1.1_RELEASE-FF4A00?style=for-the-badge&labelColor=080808" alt="Version" />
  <img src="https://img.shields.io/badge/FRONTEND-REACT_19_%7C_TS_%7C_VITE-FF4A00?style=for-the-badge&labelColor=080808" alt="Stack" />
  <img src="https://img.shields.io/badge/BACKEND-SPRING_BOOT_3_%7C_JAVA_17-00E599?style=for-the-badge&labelColor=080808" alt="Backend" />
  <img src="https://img.shields.io/badge/AI_ENGINE-GEMINI_QUALIFIER-FF4A00?style=for-the-badge&labelColor=080808" alt="Engine" />
  <img src="https://img.shields.io/badge/EXCEL_ENGINE-SHEETJS_XLSX-00E599?style=for-the-badge&labelColor=080808" alt="Export" />
</p>

---

## ─── 01 // OVERVIEW & VISION

**SETULEADS** is a high-performance, dark-editorial, brutalist prospect discovery bridge and tactical CRM workstation. Designed for modern growth teams, agency founders, and market researchers, SetuLeads combines multi-source geospatial harvesting, AI-powered relevance qualification, interactive 2D radar territory scanning, and high-performance Excel report generation into a seamless single-pane workspace.

> *"Turn raw web signals into qualified, actionable prospect pipelines with millisecond precision."*

---

## ─── 02 // OFFICIAL BRAND LOGO ASSETS

SetuLeads utilizes a high-contrast brutalist design system equipped with four vector logo variants located in [`src/assets/`](file:///b:/setuleads/src/assets):

| Brand Asset Variant | Asset Location | Visual Target & Application |
| :--- | :--- | :--- |
| **Horizontal Brand Logo** | [`src/assets/Setuleads_horizontal.svg`](file:///b:/setuleads/src/assets/Setuleads_horizontal.svg) | Main Workstation Navigation Bar, README Headers, and External Reports |
| **Primary Icon Mark** | [`src/assets/Setuleads_logo.svg`](file:///b:/setuleads/src/assets/Setuleads_logo.svg) | Favicon, Compact Sidebar Badges, and Modal Headers |
| **Monochrome Editorial Logo** | [`src/assets/SetuLeads_Monochrome.svg`](file:///b:/setuleads/src/assets/SetuLeads_Monochrome.svg) | High-Contrast Architectural Panels & Dark Mode Prints |
| **Stacked Vertical Logo** | [`src/assets/Setuleads.svg`](file:///b:/setuleads/src/assets/Setuleads.svg) | Architecture Case Study Hero & Presentation Cards |

---

## ─── 03 // KEY SYSTEM CAPABILITIES

### ⚡ 1. Tactical Territory Radar Scan
- **Global Territory Coverage**: Interactive equirectangular projection spanning 10 key international regions (*India 🇮🇳, USA 🇺🇸, UK 🇬🇧, Canada 🇨🇦, Australia 🇦🇺, Germany 🇩🇪, UAE 🇦🇪, Japan 🇯🇵, France 🇫🇷, Singapore 🇸🇬*).
- **Target Coordinate Lock**: Click any sector or famous city pill to lock target WGS84 coordinates (`Lat/Lon`), view real-time distance rings (1,000 KM & 5,000 KM), and launch localized lead discovery.
- **De-cluttered Vector Engine**: De-cluttered tactical orange (`#FF4A00`) target nodes for selected regions with subtle background micro-dots.

### 🛰️ 2. Multi-Source Lead Harvester
- **Geospatial & POI Providers**: Live API extraction via Geoapify Places, OpenStreetMap (OSM), Overture Maps, and Google Places.
- **Social & Niche Signal Extraction**: Custom Google Dorking X-Ray (LinkedIn/Twitter), Telegram Public Channels, and Internshala Fresher Feeds.
- **Structural Web Audit**: Automated checks for site responsiveness, missing HTTPS SSL certificates, low page speeds, and technical debt indicators.

### 🧠 3. AI Qualification & Signal Filtering
- **Gemini AI Engine**: Integrated Spring Boot `RelevanceQualifier` and `GeminiQualificationDTO` for strict query intent validation.
- **Cross-Industry Exclusion**: Eliminates non-relevant leads (e.g. excluding medical/dental clinics when searching for tech software leads).
- **Fresher & Zero-Experience Enforcement**: Dedicated logic to qualify non-senior roles and entry-level opportunities.

### 📊 4. CRM Workstation & Pipeline Management
- **Interactive Kanban Board**: 6-stage lifecycle tracking (*New ➔ Contacted ➔ Replied ➔ Negotiating ➔ Won ➔ Lost*) with drag-and-drop workflow updates.
- **Lead Inspection Drawer**: Detailed inspect panels for business contacts, phone/email, website audit notes, social links, and activity logs.
- **Est. Deal Value Tracker**: Aggregated financial metrics and pipeline value estimation.

### 📥 5. SheetJS XLSX Export Engine
- **One-Click Native Downloads**: High-speed client-side Excel generation formatted with human-readable headers (*Business Name, Contact Person, Email, Phone, Website, Website Score, Audit Issues, Source, Location, Stage, Est. Value, Date*).
- **Custom Stage Filtering**: Export all stages or filter specifically by sales pipeline stage.

### 🤖 6. Automated Harvester Daemon
- **Autonomous Lead Scraping**: Configurable background harvest daemon running at automated intervals (every 15m, 30m, 1h, 6h, 24h) with automated local storage and database sync.

---

## ─── 04 // ARCHITECTURE OVERVIEW

```mermaid
graph TD
    User([User Workstation]) <-->|HTTP / REST API| FE[React 19 + TS + Vite Frontend]
    
    subgraph Frontend Layer
        FE --> Radar[Tactical Radar Scan Map]
        FE --> Table[Leads Table & Kanban Board]
        FE --> SheetJS[SheetJS XLSX Engine]
        FE --> HarvesterModal[Harvest Daemon Controller]
    end
    
    subgraph Backend Layer (Spring Boot 3 / Java 17)
        FE <-->|REST Endpoints| Controller[Discovery & Lead Controllers]
        Controller --> Service[Discovery & Harvester Services]
        Service --> AI[Gemini AI Relevance Qualifier]
        Service --> GeoService[Geospatial Scraping Engine]
    end
    
    subgraph External Data Sources
        GeoService --> Geoapify[Geoapify Places API]
        GeoService --> OSM[OpenStreetMap / Overpass API]
        GeoService --> Overture[Overture Maps Foundation]
        GeoService --> Google[Google Places API]
        GeoService --> Dorks[Google X-Ray Dork Engine]
    end
    
    subgraph Storage & Persistence
        Service <--> DB[(PostgreSQL Database)]
        FE <--> LocalStorage[(Local Browser Storage Fallback)]
    end
```

---

## ─── 05 // TECH STACK & SYSTEM SPECIFICATIONS

| Layer | Technologies & Frameworks |
| :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons, Phosphor Icons |
| **State & Data Fetching** | TanStack Query (React Query v5), React Context API |
| **Excel Export Engine** | SheetJS (`xlsx`) client-side generator |
| **Backend Runtime** | Spring Boot 3.x, Java 17, Maven 3.8+ |
| **AI & LLM Services** | Google Gemini AI API (`google-genai` SDK) |
| **Database & Auth** | PostgreSQL Database Schema, REST API Client |

---

## ─── 06 // QUICKSTART & SETUP GUIDE

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **JDK**: Java 17 or higher
- **Maven**: v3.8.0 or higher

### 1. Clone & Install Frontend Dependencies

```bash
# Clone the repository
git clone https://github.com/your-org/setuleads.git
cd setuleads

# Install NPM packages
npm install
```

### 2. Frontend Development Server

```bash
# Start Vite development server
npm run dev
```
The application will launch at `http://localhost:5173`.

### 3. Backend Spring Boot Server Setup

```bash
# Navigate to backend directory
cd backend

# Compile & execute Spring Boot server
mvn spring-boot:run
```
The backend server will run on `http://localhost:8080`.

---

## ─── 07 // VERIFICATION & TESTING

Run full automated test suites to ensure zero compilation or regression errors across frontend and backend layers:

```bash
# Execute Frontend TypeScript & Vite Production Build
npm run build

# Execute Spring Boot JUnit Test Suite
cd backend
mvn test
```

---

## ─── 08 // DESIGN SYSTEM SPECIFICATION

SETULEADS follows a strict **Dark Editorial Brutalist** visual identity:

| Tokens | Color Hex | Visual Purpose |
| :--- | :--- | :--- |
| `--color-base` | `#080808` | Canvas & Deep Background |
| `--color-panel` | `#101010` | Workstation Panels & Modal Cards |
| `--color-surface` | `#151515` | Elevated Card Surfaces |
| `--color-border` | `#222222` | Architectural Grid Lines |
| `--color-burnt-orange` | `#FF4A00` | Primary Tactical Accent & Radar Sweep |
| `--color-cyber-emerald` | `#00E599` | Success Signals & Active Radar Indicators |
| `--color-ink` | `#F4F0E8` | High-Contrast Primary Typography |
| `--color-muted` | `#8E8982` | Monospaced Secondary Labels & Coordinates |

---

<div align="center">

<img src="src/assets/SetuLeads_Monochrome.svg" alt="SetuLeads Monochrome Mark" width="120" />

<br/>

**SETULEADS INTELLIGENCE ENGINE** • *Structural Web Inspection & Prospect Discovery Bridge*  
Developed for High-Precision Prospecting & Growth Execution.

</div>
