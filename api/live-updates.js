/**
 * Live Updates aggregator — Vercel serverless function.
 *
 * Pulls recent items from reputable environmental news RSS feeds, tags each
 * item with one of the site's categories via keyword matching, and returns
 * them as JSON. The response is cached at Vercel's edge for 1 hour
 * (stale-while-revalidate for a day), so feeds are re-scanned automatically
 * throughout the day without any cron job.
 */

const FEEDS = [
  { source: 'The Guardian',  url: 'https://www.theguardian.com/environment/rss' },
  { source: 'BBC News',      url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml' },
  { source: 'Mongabay',      url: 'https://news.mongabay.com/feed/' },
  { source: 'Grist',         url: 'https://grist.org/feed/' },
  { source: 'CleanTechnica', url: 'https://cleantechnica.com/feed/' },
];

// First matching category wins; unmatched items stay uncategorised (shown under "All").
// Matched with word boundaries so e.g. "gas" never matches "gastropods".
const CATEGORY_PATTERNS = {
  policy:   /\b(policy|law|laws|regulations?|government|court|ruling|ministers?|senate|parliament|election|treaty|agreement|ban|bans|legislation|cop\d{2}|summit|epa|lawsuit)\b/,
  energy:   /\b(energy|solar|wind (power|farms?|turbines?)|renewables?|batter(y|ies)|grid|nuclear|hydrogen|oil|gas|coal|electric vehicles?|evs?|power plants?|electricity|fossil fuels?)\b/,
  wildlife: /\b(wildlife|species|animals?|birds?|whales?|conservation|biodiversity|habitats?|extinct(ion)?|fish|bears?|wol(f|ves)|insects?|coral|elephants?|tigers?|rhinos?|poach(ing|ers)?|reefs?|forests?|deforestation)\b/,
  tech:     /\b(technology|ai|artificial intelligence|startups?|innovation|robots?|satellites?|carbon capture|geoengineering|lab-grown|breakthrough|scientists develop)\b/,
  living:   /\b(food|diets?|housing|city|cities|urban|gardens?|fashion|recycling|waste|plastics?|consumers?|households?|lifestyle|health)\b/,
  climate:  /\b(climate|warming|carbon|emissions?|co2|heat ?waves?|droughts?|floods?|wildfires?|ipcc|methane|greenhouse|temperatures?|sea levels?|ice sheets?|glaciers?|el niño|la niña|weather)\b/,
};

function decodeEntities(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&amp;/g, '&')
    .trim();
}

function stripHtml(s) {
  return decodeEntities(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function tag(xml, name) {
  const m = xml.match(new RegExp('<' + name + '[^>]*>([\\s\\S]*?)</' + name + '>', 'i'));
  return m ? m[1] : '';
}

function categorize(text) {
  const t = text.toLowerCase();
  for (const [cat, pattern] of Object.entries(CATEGORY_PATTERNS)) {
    if (pattern.test(t)) return cat;
  }
  return '';
}

async function fetchFeed(feed) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Ecodemia-LiveUpdates/1.0 (+https://www.ecodemia.org)' },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
    return items.slice(0, 20).map(item => {
      const title   = stripHtml(tag(item, 'title'));
      const link    = decodeEntities(tag(item, 'link')) || decodeEntities(tag(item, 'guid'));
      const desc    = stripHtml(tag(item, 'description')).slice(0, 240);
      const pubDate = tag(item, 'pubDate') || tag(item, 'dc:date');
      const date    = new Date(pubDate);
      return {
        title,
        link,
        source: feed.source,
        date: isNaN(date) ? null : date.toISOString(),
        category: categorize(title + ' ' + desc),
      };
    }).filter(i => i.title && /^https?:\/\//i.test(i.link));
  } catch {
    return []; // one dead feed must not break the endpoint
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async (req, res) => {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  const items = results
    .flatMap(r => (r.status === 'fulfilled' ? r.value : []))
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 60);

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ updated: new Date().toISOString(), count: items.length, items });
};
