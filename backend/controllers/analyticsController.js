const ReadingActivity = require('../models/ReadingActivity');
const User = require('../models/User');
const Comment = require('../models/Comment');
const {
  detectTopic,
  toDateKey,
  computeStreak,
  formatDuration,
  lastNDays
} = require('../utils/detectTopic');

/**
 * @desc    Record a reading session
 * @route   POST /api/analytics/track
 * @access  Private
 */
const trackReading = async (req, res) => {
  try {
    const { articleUrl, articleTitle, topic, timeSpentSeconds } = req.body;

    if (!articleUrl) {
      return res.status(400).json({ message: 'articleUrl is required' });
    }

    const sourceName = typeof req.body.source === 'string' ? req.body.source : '';
    const resolvedTopic = topic || detectTopic(articleTitle || '', sourceName);
    const seconds = Math.min(Math.max(parseInt(timeSpentSeconds, 10) || 0, 0), 7200);

    const activity = await ReadingActivity.create({
      user: req.user._id,
      articleUrl: articleUrl.trim(),
      articleTitle: (articleTitle || '').trim(),
      topic: resolvedTopic,
      timeSpentSeconds: seconds
    });

    res.status(201).json({
      success: true,
      activityId: activity._id
    });
  } catch (error) {
    console.error('Track reading error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get personal reading analytics
 * @route   GET /api/analytics/me
 * @access  Private
 */
const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const activities = await ReadingActivity.find({ user: userId })
      .sort({ readAt: -1 })
      .lean();

    const totalSessions = activities.length;
    const uniqueArticles = new Set(activities.map((a) => a.articleUrl)).size;
    const totalTimeSeconds = activities.reduce((sum, a) => sum + (a.timeSpentSeconds || 0), 0);

    const dateKeys = new Set(activities.map((a) => toDateKey(a.readAt)));
    const { current: readingStreak, longest: longestStreak } = computeStreak(dateKeys);

    const topicCounts = {};
    activities.forEach((a) => {
      const t = a.topic || 'tech';
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    });

    const mostReadTopics = Object.entries(topicCounts)
      .map(([topic, count]) => ({
        topic,
        count,
        percentage: totalSessions ? Math.round((count / totalSessions) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);

    const thisWeekTime = activities
      .filter((a) => new Date(a.readAt) >= weekAgo)
      .reduce((s, a) => s + (a.timeSpentSeconds || 0), 0);

    const thisMonthTime = activities
      .filter((a) => new Date(a.readAt) >= monthAgo)
      .reduce((s, a) => s + (a.timeSpentSeconds || 0), 0);

    const days = lastNDays(7);
    const readsByDay = days.map(({ date, label }) => {
      const dayActs = activities.filter((a) => toDateKey(a.readAt) === date);
      return {
        date,
        label,
        reads: dayActs.length,
        timeSeconds: dayActs.reduce((s, a) => s + (a.timeSpentSeconds || 0), 0)
      };
    });

    const maxReads = Math.max(...readsByDay.map((d) => d.reads), 1);

    const recentActivity = activities.slice(0, 8).map((a) => ({
      articleTitle: a.articleTitle || 'Article',
      articleUrl: a.articleUrl,
      topic: a.topic,
      readAt: a.readAt,
      timeSpentSeconds: a.timeSpentSeconds,
      timeLabel: formatDuration(a.timeSpentSeconds || 0).label
    }));

    res.json({
      articlesRead: uniqueArticles,
      totalSessions,
      totalTimeSeconds,
      totalTime: formatDuration(totalTimeSeconds),
      thisWeekTime: formatDuration(thisWeekTime),
      thisMonthTime: formatDuration(thisMonthTime),
      readingStreak,
      longestStreak,
      mostReadTopics,
      readsByDay,
      maxReads,
      recentActivity
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Site-wide reading analytics (admin)
 * @route   GET /api/analytics/site
 * @access  Private/Admin
 */
const getSiteAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalComments = await Comment.countDocuments();

    const allActivities = await ReadingActivity.find().lean();
    const totalReads = allActivities.length;
    const totalTimeSeconds = allActivities.reduce((s, a) => s + (a.timeSpentSeconds || 0), 0);
    const uniqueReaders = new Set(allActivities.map((a) => a.user.toString())).size;

    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const activeReaders = new Set(
      allActivities
        .filter((a) => new Date(a.readAt) >= weekAgo)
        .map((a) => a.user.toString())
    ).size;

    const topicCounts = {};
    allActivities.forEach((a) => {
      const t = a.topic || 'tech';
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    });

    const topTopics = Object.entries(topicCounts)
      .map(([topic, count]) => ({
        topic,
        count,
        percentage: totalReads ? Math.round((count / totalReads) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    const days = lastNDays(7);
    const readsByDay = days.map(({ date, label }) => {
      const dayActs = allActivities.filter((a) => toDateKey(a.readAt) === date);
      return {
        date,
        label,
        reads: dayActs.length,
        uniqueUsers: new Set(dayActs.map((a) => a.user.toString())).size,
        timeSeconds: dayActs.reduce((s, a) => s + (a.timeSpentSeconds || 0), 0)
      };
    });

    const maxReads = Math.max(...readsByDay.map((d) => d.reads), 1);

    const monthAgo = new Date(Date.now() - 30 * 86400000);
    const readsThisMonth = allActivities.filter((a) => new Date(a.readAt) >= monthAgo).length;

    res.json({
      totalUsers,
      totalComments,
      totalReads,
      readsThisMonth,
      totalTimeSeconds,
      totalTime: formatDuration(totalTimeSeconds),
      uniqueReaders,
      activeReaders,
      topTopics,
      readsByDay,
      maxReads
    });
  } catch (error) {
    console.error('Site analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  trackReading,
  getUserAnalytics,
  getSiteAnalytics
};
