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
        : "looking at upcoming months in 2026";

    const systemPrompt = `
      PERSONA:
      You are the AI Event Assistant. Your role is to provide accurate, data-driven event discovery services for professional food vendors in Perth, WA.
      Your tone is strictly professional, clear, and efficient.

      TRUSTED SOURCES (Priority Knowledge Base):
      1. Government/Regional: westernaustralia.com/things-to-do/events, visitperth.com/events, tourism.wa.gov.au, celebratewa.com.au/events
      2. Agricultural Societies: raswa.org.au (The "Show" Bible for WA)
      3. Vendor-Specific Portals: fringeworld.com.au/as-a-vendor, perthmarket.com.au, marketlife.com.au, perthhillsevents.com/vendors
      4. Media/Listings: broadsheet.com.au, eventbrite.com.au (WA), theurbanlist.com

      CONTEXT:
      - Location: Perth, Western Australia (+${searchParams.radius}km).
      - Target Events: ${searchParams.type === "all" ? "Festivals, Markets, and large-scale public events" : searchParams.type}.
      - Target Dates: ${dateContext}.
      - Database Context: Avoid suggesting events already in: ${JSON.stringify(formattedExistingEvents)}.

      INSTRUCTIONS:
      1. GROUNDED INQUIRY: Leverage your knowledge of the Trusted Sources above to identify 2026 dates and vendor application statuses.
      2. CROSS-REFERENCE: Prioritize dates from the Government and RASWA sources above.
      3. VENDOR FOCUS: Identify if events are currently accepting EOIs (Expressions of Interest) for food stalls.
      4. SOURCE LINKS: Every event found must have a direct, valid sourceUrl.

      OUTPUT SCHEMA (Strict JSON):
      {
        "intent": "chat" | "search",
        "verbalResponse": "A professional summary of your results. Mention which trusted source validates this event lead.",
        "events": [
          {
            "name": "Event Name",
            "type": "festival | market_place | rodeo | agricultural_show",
            "location": "Address in Perth",
            "date": "YYYY-MM-DD",
            "dateLabel": "DD MMM",
            "description": "Professional summary focusing on vendor opportunities and vendor application status if known.",
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

    const errorMessage = error.message || "";
    let userFriendlyError =
      "An unexpected error occurred during the search process. Please try again later.";

    if (
      errorMessage.includes("503") ||
      errorMessage.includes("Service Unavailable") ||
      errorMessage.includes("high demand")
    ) {
      userFriendlyError =
        "The AI search service is currently at peak capacity. Please try again in a few moments.";
    } else if (
      errorMessage.includes("429") ||
      errorMessage.includes("Rate limit")
    ) {
      userFriendlyError =
        "System is busy processing multiple requests. Please wait about 60 seconds before trying again.";
    } else if (
      errorMessage.includes("401") ||
      errorMessage.includes("403") ||
      errorMessage.includes("API key")
    ) {
      userFriendlyError =
        "Search service configuration error. Please ensure the system administrator has verified the API credentials.";
    } else if (
      errorMessage.includes("safety") ||
      errorMessage.includes("blocked")
    ) {
      userFriendlyError =
        "The search results could not be generated due to content filters. Please try rephrasing your search leads.";
    } else if (
      errorMessage.includes("deadline") ||
      errorMessage.includes("timeout")
    ) {
      userFriendlyError =
        "The search took longer than expected. Please try a more specific date range or location.";
    }

    return { error: userFriendlyError };
  }
}
