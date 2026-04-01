const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

async function callGemini(systemPrompt, userMessage) {
  try {
    const fullPrompt = `${systemPrompt}\n\n${userMessage}`
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    return response.text()
  } catch (err) {
    console.error('Gemini API error:', err)
    throw err
  }
}

function cleanJSON(text) {
  return text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()
}

module.exports = { callGemini, cleanJSON }