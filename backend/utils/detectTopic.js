const detectTopic = (title = '', source = '') => {
  const text = `${title} ${source}`.toLowerCase();
  if (text.includes('ai') || text.includes('artificial') || text.includes('gpt') || text.includes('openai') || text.includes('machine learning')) return 'ai';
  if (text.includes('cyber') || text.includes('hack') || text.includes('security') || text.includes('breach')) return 'cybersecurity';
  if (text.includes('software') || text.includes('dev') || text.includes('code') || text.includes('github')) return 'software';
  if (text.includes('gadget') || text.includes('device') || text.includes('hardware') || text.includes('chip')) return 'gadgets';
  if (text.includes('startup') || text.includes('funding') || text.includes('venture')) return 'startups';
  return 'tech';
};

const toDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const computeStreak = (dateKeysSet) => {
  if (!dateKeysSet.size) return { current: 0, longest: 0 };

  const sorted = [...dateKeysSet].sort();
  let longest = 1;
  let run = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.round((curr - prev) / 86400000);
    if (diffDays === 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  let current = 0;
  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 86400000));

  if (!dateKeysSet.has(today) && !dateKeysSet.has(yesterday)) {
    return { current: 0, longest };
  }

  let check = dateKeysSet.has(today) ? today : yesterday;
  current = 1;

  while (true) {
    const d = new Date(check);
    d.setDate(d.getDate() - 1);
    const prevKey = toDateKey(d);
    if (dateKeysSet.has(prevKey)) {
      current += 1;
      check = prevKey;
    } else {
      break;
    }
  }

  return { current, longest: Math.max(longest, current) };
};

const formatDuration = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return { hours, minutes, label: `${hours}h ${minutes}m` };
  if (minutes > 0) return { hours: 0, minutes, label: `${minutes} min` };
  return { hours: 0, minutes: 0, label: '< 1 min' };
};

const lastNDays = (n) => {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push({ date: toDateKey(d), label: d.toLocaleDateString('en-US', { weekday: 'short' }) });
  }
  return days;
};

module.exports = { detectTopic, toDateKey, computeStreak, formatDuration, lastNDays };
