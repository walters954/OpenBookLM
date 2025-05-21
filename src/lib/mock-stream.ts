/**
 * Helper functions for generating mock streaming responses
 */

/**
 * Create a mock stream of text for simulating chat responses
 * @param writer The writable stream writer
 * @param encoder TextEncoder instance
 * @param chatId The chat ID (for logging)
 * @param onComplete Callback function called when streaming completes with the full content
 */
export async function createMockStream(
    writer: WritableStreamDefaultWriter<Uint8Array>,
    encoder: TextEncoder,
    chatId: string,
    onComplete: (fullContent: string) => Promise<void>
): Promise<void> {
    try {
        // Hardcoded response for demo
        const mockContent = `This is a mock response for demonstration purposes. The OpenBookLM demo is running in development mode without API keys or Redis configured.

Here's what this demo app can do:
- Create notebooks to organize your research
- Add sources (URLs, text) to notebooks
- Chat with your sources
- Export notes and summaries

This streaming response is simulating what would normally come from an AI model like OpenAI, Anthropic, or Llama 3.`;

        console.log(`Starting mock stream for chat ${chatId}`);

        // Split into words for more realistic streaming
        const words = mockContent.split(" ");
        let fullContent = "";

        for (let i = 0; i < words.length; i++) {
            // Build a chunk that's a few words at a time to make it more realistic
            const wordChunk =
                words.slice(i, Math.min(i + 3, words.length)).join(" ") + " ";
            i += 2; // Skip ahead since we grabbed multiple words

            fullContent += wordChunk;

            const mockChunk = {
                choices: [
                    {
                        delta: {
                            content: wordChunk,
                        },
                    },
                ],
            };

            const jsonChunk = JSON.stringify(mockChunk);

            // Log some chunks but not all to avoid noise
            if (i === 0 || i >= words.length - 3) {
                console.log(
                    `Mock chunk #${i}: ${jsonChunk.substring(0, 50)}...`
                );
            }

            // Write in SSE format
            await writer.write(encoder.encode(`data: ${jsonChunk}\n\n`));

            // Small delay to simulate streaming
            await new Promise((resolve) => setTimeout(resolve, 80));
        }

        console.log("Mock streaming complete");
        await writer.write(encoder.encode("data: [DONE]\n\n"));

        // Call the completion callback with the full content
        await onComplete(fullContent);
    } catch (error) {
        console.error("Error in mock stream:", error);
    } finally {
        await writer.close();
    }
}
