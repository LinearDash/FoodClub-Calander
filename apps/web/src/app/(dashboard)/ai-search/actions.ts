'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { getEvents } from '../events/actions'

export async function searchEventsWithAI(userPrompt: string, selectedDates: Date[], searchParams: any) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log(`[AI Search] Attempting search. API Key length: ${apiKey?.length || 0}`);

    if (!apiKey || apiKey.length < 10) {
      return { error: 'Gemini API key is not being read correctly. Please ensure GEMINI_API_KEY is in apps/web/.env.local and you have restarted the server.' }
    }

    // Initialize inside the action to ensure env is fresh
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // 1. Fetch existing events for context (to avoid duplicates)
    const existingEvents = await getEvents()
    const formattedExistingEvents = existingEvents.map(e => ({
      name: e.name,
      date: e.date,
      location: e.location
    }))

    // 2. Prepare the model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    })

    const dateContext = selectedDates.length > 0 
      ? `targeting the following dates: ${selectedDates.map(d => {
          try {
            return new Date(d).toISOString().split('T')[0];
          } catch(e) {
            return d;
          }
        }).join(', ')}`
      : 'targeting upcoming months in 2026'

    const systemPrompt = `
      You are an "Event Detective" and high-level Culinary Scout. 
      Your mission is to find events that a food vendor in Perth, Western Australia should attend.
      
      CONTEXT:
      - Location: Perth, WA (radius of ${searchParams.radius}km).
      - Event Types: ${searchParams.type === 'all' ? 'Festivals, Markets, Rodeos, Agricultural Shows, Street Festivals' : searchParams.type}.
      - Target Dates: ${dateContext}.
      - Existing Events (DO NOT SUGGEST THESE): ${JSON.stringify(formattedExistingEvents)}. 
      
      TONE:
      - Professional, expert, and thorough.
      
      GOAL:
      - Find as many relevant events as possible that are NOT already in the existing events list.
      - ALWAYS return the results as a VALID JSON ARRAY.
      
      Output Schema (Array of objects):
      [
        {
          "name": "Event Name",
          "type": "festival | market_place | rodeo | agricultural_show | annual_show | street_festival",
          "location": "Specific address or landmark in Perth",
          "date": "YYYY-MM-DD",
          "dateLabel": "DD MMM",
          "description": "Brief reason why this is a good opportunity for a vendor"
        }
      ]
      
      Current Request: "${userPrompt}"
    `

    const result = await model.generateContent(systemPrompt)
    const response = await result.response
    let text = response.text()
    
    // Clean text in case Gemini wraps it in markdown blocks
    text = text.replace(/```json\n?/, '').replace(/```\n?/, '').trim();
    
    try {
      const parsedResults = JSON.parse(text)
      return { data: parsedResults }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text)
      // Fallback: try to find anything that looks like a JSON array
      const matches = text.match(/\[\s*\{.*\}\s*\]/s);
      if (matches) {
        try {
          return { data: JSON.parse(matches[0]) };
        } catch (e) {}
      }
      return { error: 'Failed to process AI response format. Please try again.' }
    }

  } catch (error: any) {
    console.error('AI_SEARCH_ERROR:', error)
    return { error: error.message || 'An error occurred while searching.' }
  }
}
