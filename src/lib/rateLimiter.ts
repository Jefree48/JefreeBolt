// Simple in-memory storage
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const tokenUsage = new Map<string, { total: number; daily: number; resetTime: number }>();
const pdfDownloads = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  points: 50,
  duration: 3600, // 1 hour in seconds
};

export const rateLimiter = {
  async consume(userId: string): Promise<void> {
    const now = Date.now();
    const userLimit = rateLimits.get(userId);

    if (!userLimit || now >= userLimit.resetTime) {
      rateLimits.set(userId, {
        count: 1,
        resetTime: now + (RATE_LIMIT.duration * 1000),
      });
      return;
    }

    if (userLimit.count >= RATE_LIMIT.points) {
      throw new Error('rate_limit_exceeded');
    }

    userLimit.count += 1;
  }
};

export const tokenUsageStore = {
  async incrementTokens(userId: string, tokens: number): Promise<void> {
    const now = Date.now();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const usage = tokenUsage.get(userId) || {
      total: 0,
      daily: 0,
      resetTime: midnight.getTime(),
    };

    if (now >= usage.resetTime) {
      usage.daily = tokens;
      usage.resetTime = midnight.getTime();
    } else {
      usage.daily += tokens;
    }

    usage.total += tokens;
    tokenUsage.set(userId, usage);
  },

  async getTokenUsage(userId: string): Promise<{ total: number; daily: number }> {
    const now = Date.now();
    const usage = tokenUsage.get(userId) || {
      total: 0,
      daily: 0,
      resetTime: now,
    };

    if (now >= usage.resetTime) {
      usage.daily = 0;
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      usage.resetTime = midnight.getTime();
      tokenUsage.set(userId, usage);
    }

    return {
      total: usage.total,
      daily: usage.daily,
    };
  }
};

export const pdfLimiter = {
  async checkLimit(userId: string): Promise<boolean> {
    const now = Date.now();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const downloads = pdfDownloads.get(userId) || {
      count: 0,
      resetTime: midnight.getTime(),
    };

    if (now >= downloads.resetTime) {
      downloads.count = 0;
      downloads.resetTime = midnight.getTime();
    }

    return downloads.count < 3; // Límite de 3 descargas diarias para usuarios gratuitos
  },

  async incrementDownloads(userId: string): Promise<void> {
    const now = Date.now();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const downloads = pdfDownloads.get(userId) || {
      count: 0,
      resetTime: midnight.getTime(),
    };

    if (now >= downloads.resetTime) {
      downloads.count = 1;
      downloads.resetTime = midnight.getTime();
    } else {
      downloads.count += 1;
    }

    pdfDownloads.set(userId, downloads);
  }
};