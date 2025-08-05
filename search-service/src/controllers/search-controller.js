const Search = require("../models/Search");
const logger = require("../utils/logger");

// Caches search results for 3 minutes
const searchPostController = async (req, res) => {
  logger.info("Search endpoint hit!");
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    const redisClient = req.redisClient;
    const cacheKey = `search:text:${query}`;

    // Check Redis cache
    const cachedResults = await redisClient.get(cacheKey);
    if (cachedResults) {
      logger.info("Cache hit for query:", query);
      return res.json(JSON.parse(cachedResults));
    }

    // Search in MongoDB
    const results = await Search.find(
      {
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);

    // Cache the result for 180 seconds (3 min)
    await redisClient.set(cacheKey, JSON.stringify(results), "EX", 180);
    logger.info("Cache set for query:", query);

    res.json(results);
  } catch (e) {
    logger.error("Error while searching post", e);
    res.status(500).json({
      success: false,
      message: "Error while searching post",
    });
  }
};

module.exports = { searchPostController };
