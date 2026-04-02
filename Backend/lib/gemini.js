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

module.exports.callGemini = callGemini
module.exports.cleanJSON = cleanJSON
