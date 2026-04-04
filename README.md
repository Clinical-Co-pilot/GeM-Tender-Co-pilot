<div align="center">

<img src="https://img.shields.io/badge/For-Indian%20MSMEs-green?style=for-the-badge" />

# 🏛️ GeM Tender Copilot

### *Find it. Win it.*

**AI-powered tender discovery & bid drafting platform for Indian MSMEs**

GeM Tender Copilot helps Micro, Small & Medium Enterprises find, evaluate, and win Government e-Marketplace (GeM) tenders — removing the guesswork from government contracting with intelligent matching, automated eligibility analysis, and AI-generated proposal drafts.

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20Now-blue?style=for-the-badge)](https://gem-tender-co-pilot.vercel.app)
[![Backend API](https://img.shields.io/badge/🔧%20Backend%20API-Live-green?style=for-the-badge)](https://gem-tender-co-pilot.onrender.com/health)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)]()

</div>

---

## 🎯 The Problem

India's government spends **₹4+ lakh crore annually** through the GeM portal. The government has **mandated 25% of all procurement for MSMEs**. Yet:

```
90% of MSMEs never win a single government tender
```

Not because they can't compete. Because of paperwork.

| Pain Point | The Reality |
|---|---|
| 📋 Tender Discovery | 40,000+ active tenders scattered across portals |
| 📄 Document Reading | Each tender is 40–60 pages of dense legal jargon |
| ✅ Eligibility Check | Hours spent reading only to find you don't qualify |
| 📝 Bid Preparation | 3–5 days to write one proposal from scratch |
| ❌ Rejection Rate | One missing document = entire bid rejected |

---

## 💡 The Solution

> **GeM Tender Copilot is like LinkedIn Jobs — but for government contracts.**

Upload your business profile once. AI finds matching tenders, checks every eligibility criterion, flags hidden risks, and drafts your entire technical proposal — **in 30 seconds.**

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Smart Tender Matching** | Deterministic scoring engine + Gemini AI refinement for top matches |
| ✅ **Eligibility Analysis** | 10+ pass/fail criteria with risk flags, warnings, and recommendations |
| 📝 **AI Bid Drafting** | Auto-generate submission-ready proposals from your profile + tender data |
| 📁 **Document Management** | Upload GST, Udyam, PAN, ITR, ISO — auto-extracts registration numbers |
| 🔍 **Browse All Tenders** | Search & filter all available tenders by category with keyword expansion |
| 📊 **Workflow Tracking** | Track every tender: Saved → Analyzed → Draft Ready → Submitted |
| 🔐 **Secure Auth** | Email/password auth with bcrypt (12 salt rounds) |
| 📤 **Draft Export** | Export polished proposal drafts as HTML for final review |
| 🏷️ **MSME Benefits** | Auto-flags EMD exemptions and 15% price preference you qualify for |

---

## 🖥️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 4.22 |
| Database | MongoDB 7.1 (with in-memory fallback) |
| AI | Google Gemini API (`gemini-2.5-flash`) |
| Auth | bcrypt 6.0 |
| File Upload | multer 1.4 |
| Dev Server | nodemon 3.1 |

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (React 19, TypeScript 5) |
| Styling | Tailwind CSS 4 |
| Icons | lucide-react |
| Bundler | Turbopack |

### Infrastructure
| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| 🌐 Frontend | https://gem-tender-co-pilot.vercel.app |
| 🔧 Backend API | https://gem-tender-co-pilot.onrender.com |
| ❤️ Health Check | https://gem-tender-co-pilot.onrender.com/health |

### The 60-Second Demo Flow

```
1. Sign up and upload your Udyam + GST certificate
            ↓
2. AI builds your complete business profile
            ↓
3. See matched tenders ranked by fit score (0–100)
            ↓
4. Click any tender → instant eligibility breakdown
            ↓
5. Generate full technical bid draft in 30 seconds
            ↓
6. Edit → Export as HTML → Submit on GeM portal
```

---

## ⚙️ How It Works

### Tender Matching Pipeline

```
Company Profile
      │
      ▼
Deterministic Scoring (per tender)
  ├─ Keyword overlap (category vs tender text)
  ├─ Turnover check (vs tender min_turnover)
  ├─ Experience check (vs tender min_years)
  ├─ Certification match
  ├─ Document readiness (Udyam, GST, experience)
  └─ MSME / OEM flags
      │
      ▼
Top 5 → Gemini AI Enrichment
(blended 75% deterministic + 25% AI)
      │
      ▼
Scored & ranked tender list (cached 15 min)
```

### Eligibility Analysis

Each tender is checked against **10+ criteria:**

```
✅ GST Registration          — Verified
✅ Udyam MSME Registration   — Confirmed
✅ Annual Turnover ₹20L+     — Your turnover: ₹21L
✅ 3 Years in Operation       — You have 5 years
✅ ISO 9001 Certification     — Found in profile
✅ Category Match             — IT Services — exact match
✅ EMD Exemption              — Exempt as MSME (saves ₹2.25L)
❌ Past Order Value ₹10L+    — Upload work completion certificates
❌ Bank Solvency Certificate  — Not uploaded yet

Score: 8/10 — Strong match — Proceed with bid
```

### Bid Draft Generation

```
Profile Data + Tender Data
         │
         ▼
Gemini AI generates 8 sections:
  ├─ Cover Letter
  ├─ Executive Summary
  ├─ Company Overview
  ├─ Scope Understanding
  ├─ Methodology
  ├─ Past Experience
  ├─ Team Credentials
  └─ Document Checklist
         │
         ▼
Editable draft saved → Export as HTML
```

> **Fallback:** If Gemini API is unavailable, deterministic templates are used — the app never fails to produce a draft.

---

## 📡 API Reference

Base URL: `https://gem-tender-co-pilot.onrender.com`

### Authentication
```http
POST /api/auth/signup     { email, password }
POST /api/auth/login      { email, password }
```

### Profile
```http
POST   /api/profile                               Create profile
GET    /api/profile/:profile_id                   Get profile
PUT    /api/profile/:profile_id                   Update profile
POST   /api/profile/:profile_id/documents         Upload document
GET    /api/profile/:profile_id/documents/:key    Download document
```

### Tenders
```http
GET /api/tenders/:profile_id                      Matched & scored tenders
GET /api/tenders/all?profile_id=...               All tenders with scoring
GET /api/tenders/detail?id=...&profile_id=...     Single tender detail
```

### Eligibility & Bids
```http
POST /api/eligibility     { profile_id, tender_id }
POST /api/bid             { profile_id, tender_id }
```

### Workflow
```http
GET   /api/workflow/:profile_id      List workflow states
PATCH /api/workflow/:profile_id      Update workflow flags
```

### Drafts
```http
GET  /api/drafts/:profile_id                      List all drafts
POST /api/drafts/generate                         Generate AI draft
PUT  /api/drafts/:profile_id                      Update draft
GET  /api/drafts/:profile_id/export?tender_id=..  Export as HTML
```

### Health
```http
GET /health     Server status + DB connection state
```

---

## 📁 Project Structure

```
GeM-Tender-Co-pilot/
│
├── Backend/
│   ├── index.js                    # Server entry, route registration
│   ├── data/
│   │   └── tenders.json            # 24 real GeM tender entries
│   ├── lib/
│   │   ├── gemini.js               # Gemini AI integration
│   │   ├── store.js                # MongoDB + in-memory data layer
│   │   ├── tenderEngine.js         # Eligibility & bid logic
│   │   └── profileContract.js      # Profile schema & validation
│   └── routes/
│       ├── auth.js                 # Signup + Login
│       ├── profile.js              # Profile CRUD + documents
│       ├── tenders.js              # Matching + scoring
│       ├── eligibility.js          # Eligibility checker
│       ├── bid.js                  # AI bid generation
│       ├── drafts.js               # Draft management + export
│       └── workflow.js             # Tender workflow state
│
└── frontend/
    ├── app/
    │   ├── page.tsx                # Landing page
    │   ├── auth/page.tsx           # Login + Signup
    │   ├── onboarding/page.tsx     # Profile setup
    │   └── (app)/
    │       ├── dashboard/          # Tender feed
    │       ├── profile/            # Profile management
    │       ├── tender/[id]/        # Tender detail
    │       ├── proposal/[id]/      # Eligibility analysis
    │       ├── draft/[id]/         # Bid draft editor
    │       └── drafts/             # All drafts
    ├── components/
    │   ├── AppNav.tsx              # Navigation
    │   └── DocumentUploadRow.tsx   # File upload
    └── lib/
        ├── mockApi.ts              # API fetch layer
        └── utils.ts                # Helpers
```

---

## 🏃 Run Locally

### Prerequisites
- Node.js 18+
- Gemini API key → [Get free key](https://aistudio.google.com)
- MongoDB Atlas (optional — falls back to in-memory)

### Clone
```bash
git clone https://github.com/Clinical-Co-pilot/GeM-Tender-Co-pilot.git
cd GeM-Tender-Co-pilot
```

### Backend
```bash
cd Backend
npm install

# Create .env file
GEMINI_API_KEY=your_key_here
MONGODB_URL=your_mongodb_url   # optional
PORT=3001
GEMINI_MODEL=gemini-2.5-flash

npm run dev
# Server running on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install

# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:3001

npm run dev
# Open http://localhost:3000
```

### Full Stack
```bash
# Terminal 1
cd Backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

---

## 🌍 Environment Variables

| Variable | Location | Required | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Backend `.env` | Recommended | Enables AI scoring, extraction & drafting |
| `MONGODB_URL` | Backend `.env` | Optional | Falls back to in-memory if not set |
| `PORT` | Backend `.env` | Optional | Default: `3001` |
| `GEMINI_MODEL` | Backend `.env` | Optional | Default: `gemini-2.5-flash` |
| `NEXT_PUBLIC_API_URL` | Frontend `.env.local` | Optional | Default: `http://localhost:3001` |

---

## 🗺️ Page Routes

| Route | Page |
|---|---|
| `/` | Landing page |
| `/auth` | Login + Signup |
| `/onboarding` | Profile setup |
| `/dashboard` | Tender feed with search and filters |
| `/profile` | Edit company details + documents |
| `/tender/[id]` | Full tender info + eligibility CTA |
| `/proposal/[id]` | Eligibility analysis pass/fail |
| `/draft/[id]` | AI bid draft editor |
| `/drafts` | All saved drafts |

---

## 📊 The Market Opportunity

```
7.16 crore    Registered MSMEs in India
₹4L crore+    Annual GeM procurement
25%           Mandated for small businesses
90%           MSMEs that never win a tender
0             AI-native tools for Indian MSME bidding
```

**The business case:**
- Pricing: ₹999–₹2,999/month per MSME
- One extra ₹10L contract pays for 4 years of subscription
- At 1% penetration = **₹1,400 crore ARR**

---

## 🗺️ Roadmap

### ✅ Built
- [x] Authentication (signup + login)
- [x] Company profile + document upload
- [x] AI tender matching with scoring
- [x] 10+ criterion eligibility checker
- [x] Risk assessment and flagging
- [x] 8-section AI bid draft generation
- [x] Draft editor + HTML export
- [x] Workflow tracking per tender
- [x] Full deployment (Vercel + Render)

### 🔜 Next
- [ ] Live GeM Official API integration
- [ ] CPPP portal scraping
- [ ] 28 state government portals
- [ ] Hindi language support
- [ ] Direct GeM portal submission

### 🔭 Long Term
- [ ] SE Asia expansion
- [ ] AI bid success prediction
- [ ] Competitor analysis per tender
- [ ] Automated document collection

---

## 🔐 Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- No plaintext credentials stored
- CORS restricted to production domain
- File uploads stored server-side with authenticated access only

---

## 👥 Team

| Name | Role |
|---|---|
| **Aparna Singha** | Backend, AI/ML, RAG Pipeline |
| **Lekhana Dinesh** | Frontend, UI/UX, Design |

---

## ⚠️ License & Legal

**© 2026 Aparna Singha & Lekhana Dinesh. All Rights Reserved.**

This repository and all of its contents — including but not limited to source code, design, architecture, algorithms, and documentation — is proprietary and confidential.

**The following are strictly prohibited without explicit written permission from the authors:**

- ❌ Copying or reproducing any part of this codebase
- ❌ Using this code for commercial purposes
- ❌ Distributing, sublicensing, or selling this code
- ❌ Building competing products based on this code
- ❌ Modifying and redistributing this code

**This repository is made publicly visible for review purposes only** (including hackathon and YC application review). Viewing this code does not grant any rights to use, copy, or distribute it.

For licensing inquiries or permissions, contact:
📧 aparnasingha3003@gmail.com

---

<div align="center">

**Made with ❤️ for India's 7 crore MSMEs**

*GeM Tender Copilot — Find it. Win it.*

[🌐 Live Demo](https://gem-tender-co-pilot.vercel.app) · [🔧 Backend API](https://gem-tender-co-pilot.onrender.com) · [🐛 Report Bug](https://github.com/Clinical-Co-pilot/GeM-Tender-Co-pilot/issues)

</div>
