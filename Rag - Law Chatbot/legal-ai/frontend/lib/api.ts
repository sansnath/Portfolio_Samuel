export async function sendQuestion(question: string) {
  try {
    // Step 1: Submit job to Gradio 5 HTTP endpoint
    const res1 = await fetch("https://snssamuel-legal-ai-backend.hf.space/gradio_api/call/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [question] }),
    });

    if (!res1.ok) {
      throw new Error(`Gradio API error! Status: ${res1.status}`);
    }

    const { event_id } = await res1.json();
    if (!event_id) {
      throw new Error("No event_id returned from Gradio API");
    }

    // Step 2: Fetch stream output from Gradio 5 SSE endpoint
    const res2 = await fetch(`https://snssamuel-legal-ai-backend.hf.space/gradio_api/call/predict/${event_id}`);
    if (!res2.ok) {
      throw new Error(`Gradio stream error! Status: ${res2.status}`);
    }

    const textStream = await res2.text();
    
    // Split by SSE event blocks (\n\n) to preserve multiline JSON payloads intact
    const events = textStream.split(/\n\n|\r\n\r\n/);
    let fullText = "";

    for (const eventBlock of events) {
      const dataMatch = eventBlock.match(/data:\s*([\s\S]*)/);
      if (dataMatch) {
        const rawData = dataMatch[1].trim();
        try {
          const parsed = JSON.parse(rawData);
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string" && parsed[0].trim().length > 0) {
            fullText = parsed[0];
          }
        } catch (e) {
          // Ignore non-JSON status messages like data: heartbeat
        }
      }
    }

    if (!fullText) {
      throw new Error("Gradio API returned empty response");
    }

    return {
      answer: fullText,
      citations: []
    };
  } catch (error) {
    console.error("Gradio API error:", error);
    throw error;
  }
}
