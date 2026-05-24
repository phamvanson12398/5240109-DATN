// Analytics service for AI chat - logs interactions for insights

/**
 * Log chat interaction for analytics
 * @param {string} userMessage
 * @param {string} botResponse
 * @param {Array} relevantProducts
 */
export async function logInteraction(userMessage, botResponse, relevantProducts) {
    try {
        const logData = {
            timestamp: new Date(),
            user_message: userMessage,
            bot_response: botResponse.substring(0, 200),
            products_shown: relevantProducts.map(p => p._id),
            products_count: relevantProducts.length
        };

        console.log("📊 Analytics:", JSON.stringify(logData, null, 2));

        // TODO: Save to database if ChatLog model is created
        // await ChatLog.create(logData);

    } catch (error) {
        console.error("Analytics error:", error);
        // Non-blocking - don't throw
    }
}
