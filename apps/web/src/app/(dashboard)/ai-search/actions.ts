/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getEvents } from "../events/actions";

export async function searchEventsWithAI(
  userPrompt: string,
  selectedDates: Date[],
  searchParams: any,
) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.length < 10) {
      return {
        error:
          "Search service configuration error: Gemini API key missing or invalid.",
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // 1. Fetch existing events for context (to avoid duplicates)
    const existingEvents = await getEvents();
    const formattedExistingEvents = existingEvents.map((e) => ({
      name: e.name,
      date: e.date,
      location: e.location,
    }));

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const dateContext =
      selectedDates.length > 0
        ? `targeting these specific dates: ${selectedDates
            .map((d) => {
              try {
                return new Date(d).toISOString().split("T")[0];
              } catch {
                return d;
              }
            })
            .join(", ")}`
        : "looking at the shadows of upcoming months in 2026";

    const systemPrompt = `
      PERSONA:
      You are the AI Event Assistant. Your role is to provide accurate, data-driven event discovery services for professional food vendors.
      Your tone is strictly professional, clear, and efficient. Avoid metaphors, slang, or any "detective" roleplay.
      You focus on delivering high-quality leads that help vendors expand their business.

      CONTEXT:
      - Location: Perth, Western Australia (+${searchParams.radius}km).
      - Target Events: ${searchParams.type === "all" ? "Festivals, Markets, and large-scale public events" : searchParams.type}.
      - Target Dates: ${dateContext}.
      - Existing Database: ${JSON.stringify(formattedExistingEvents)} (Do not suggest these). 

      INSTRUCTIONS:
      1. INTENT ANALYSIS: Determine if the user is greeting you ("chat") or requesting event data ("search").
      2. RESPONSE STYLE: Provide a professional verbal summary of your findings or respond to the user's inquiry clearly.
      3. EVENT DISCOVERY (Search mode): Identify REAL, verified upcoming events matching the criteria.
      4. SOURCE LINKS: Provide a direct, valid URL for each event found.

      OUTPUT SCHEMA (Strict JSON):
      {
        "intent": "chat" | "search",
        "verbalResponse": "A professional summary of your findings or response...",
        "events": [
          {
            "name": "Event Name",
            "type": "festival | market_place | rodeo | agricultural_show",
            "location": "Address in Perth",
            "date": "YYYY-MM-DD",
            "dateLabel": "DD MMM",
            "description": "Professional summary of the opportunity for a vendor.",
            "sourceUrl": "Direct URL link"
          }
        ]
      }

      Deliver high-quality results.
      User Request: "${userPrompt}"
    `;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    let text = response.text();

    // Clean text
    text = text
      .replace(/```json\n?/, "")
      .replace(/```\n?/, "")
      .trim();

    try {
      const parsedResults = JSON.parse(text);
      return {
        intent: parsedResults.intent,
        message: parsedResults.verbalResponse,
        data: parsedResults.events || [],
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", text, parseError);
      return {
        error: "Failed to process AI event data. Please try your search again.",
      };
    }
  } catch (error: any) {
    console.error("AI_SEARCH_ERROR:", error);
    return {
      error:
        error.message ||
        "An unexpected error occurred during the search process.",
    };
  }
}
