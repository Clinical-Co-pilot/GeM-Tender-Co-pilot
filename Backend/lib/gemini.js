const { requireFromDeps } = require('./deps')

const { GoogleGenerativeAI } = requireFromDeps('@google/generative-ai')

let model
const defaultModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

function cleanJSON(text) {
  return text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()
}

async function callGemini(systemPrompt, userMessage) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  if (!model) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    model = genAI.getGenerativeModel({ model: defaultModel })
  }

  const fullPrompt = `${systemPrompt}\n\n${userMessage}`
  const result = await model.generateContent(fullPrompt)
  const response = await result.response
  return response.text()
}

async function extractFromDocument(fileBuffer, mimeType, docType) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  if (!model) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    model = genAI.getGenerativeModel({ model: defaultModel })
  }

  const prompts = {
    udyam: `Extract the Udyam Registration Number from this certificate document.
The number format is UDYAM-XX-XX-XXXXXXX (e.g. UDYAM-MH-12-0012345).
Return ONLY valid JSON with no extra text: {"udyam_number": "the number or null if not found"}`,
    gst: `Extract the GSTIN (GST Registration Number) from this certificate document.
The GSTIN is a 15-character alphanumeric number (e.g. 27AABCS1429B1ZB).
Return ONLY valid JSON with no extra text: {"gst_number": "the number or null if not found"}`
  }

  const prompt = prompts[docType]
  if (!prompt) throw new Error(`Unknown docType: ${docType}`)

  const result = await model.generateContent([
    { inlineData: { data: fileBuffer.toString('base64'), mimeType } },
    prompt
  ])
  const response = await result.response
  return response.text()
}

module.exports.callGemini = callGemini
module.exports.cleanJSON = cleanJSON
module.exports.extractFromDocument = extractFromDocument
