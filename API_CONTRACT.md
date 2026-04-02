# API Contract — GeM Tender Copilot

Base URL: http://localhost:3001

---

## 1. Upload Company Profile
POST /api/profile
Content-Type: multipart/form-data

Fields:
- udyam (file, optional)
- gst (file, optional)  
- company_name (string, required)
- category (string, required)
- turnover (number, required)
- years_in_operation (number, required)

Response:
{
  "profile_id": "uuid-string",
  "profile": {
    "company_name": "string",
    "udyam_number": "string",
    "gst_number": "string",
    "category": "string",
    "turnover": number,
    "years_in_operation": number,
    "certifications": ["string"]
  }
}

---

## 2. Get Matched Tenders
GET /api/tenders/:profile_id

Response:
{
  "tenders": [
    {
      "id": "string",
      "title": "string",
      "department": "string",
      "value": "string",
      "deadline": "YYYY-MM-DD",
      "category": "string",
      "match_score": number,
      "match_reason": "string"
    }
  ]
}

---

## 3. Check Eligibility
POST /api/eligibility
Content-Type: application/json

Body:
{
  "profile_id": "string",
  "tender_id": "string"
}

Response:
{
  "score": number,
  "total": number,
  "criteria": [
    {
      "name": "string",
      "status": "pass" | "fail" | "partial",
      "detail": "string"
    }
  ],
  "risk_flags": ["string"],
  "recommendation": "string"
}

---

## 4. Generate Bid Draft
POST /api/bid
Content-Type: application/json

Body:
{
  "profile_id": "string",
  "tender_id": "string"
}

Response:
{
  "company_overview": "string",
  "methodology": "string",
  "past_experience": "string",
  "team_credentials": "string",
  "checklist": [
    {
      "document": "string",
      "status": "ready" | "missing",
      "note": "string"
    }
  ]
}
