require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const xml2js = require('xml2js');
const https = require('https');

// Configure axios to ignore SSL certificate errors for RSS feeds (development only)
const axiosConfig = {
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  timeout: 10000
};

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow GitHub Pages and localhost
// For GitHub Pages, you'll need to set FRONTEND_URL environment variable
// Example: FRONTEND_URL=https://yourusername.github.io
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://sukhsidhu3287.github.io',
  'https://sukhsidhu3287.github.io/ssb_prep_portal',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or is a GitHub Pages domain
    if (allowedOrigins.indexOf(origin) !== -1 || 
        origin.includes('.github.io') || 
        origin.startsWith('https://') && origin.includes('github.io')) {
      callback(null, true);
    } else {
      // Allow all for development - you can restrict this in production
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Handle preflight requests explicitly (before routes)
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || origin.includes('.github.io'))) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  res.sendStatus(200);
});

// Ensure directories exist
const directories = [
  'uploads/reading_material',
  'uploads/newspaper',
  'uploads/tat_images',
  'uploads/wat_words',
  'uploads/srt_list'
];

directories.forEach(dir => {
  fs.ensureDirSync(dir);
});

// Configure multer for file uploads
// Note: req.body might not be available in destination/filename functions
// So we'll handle the path in the upload route instead
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Default to uploads root, we'll move it in the route handler
    const defaultPath = 'uploads/';
    fs.ensureDirSync(defaultPath);
    cb(null, defaultPath);
  },
  filename: (req, file, cb) => {
    // Use original filename for now, we'll rename in the route handler
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Helper function to truncate text to 100 words
function truncateTo100Words(text) {
  if (!text) return '';
  const words = text.split(' ');
  if (words.length <= 100) return text;
  return words.slice(0, 100).join(' ') + '...';
}

// News cache - refreshed on server start
let newsCache = [];
let lastNewsFetch = null;

// Function to parse RSS feed
function parseRSS(xmlData) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser();
    parser.parseString(xmlData, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        const items = result.rss?.channel?.[0]?.item || result.feed?.entry || [];
        const articles = items.map(item => {
          const title = item.title?.[0] || item.title?.[0]?._ || '';
          const description = item.description?.[0] || item.summary?.[0]?._ || item.content?.[0]?._ || '';
          const link = item.link?.[0]?._ || item.link?.[0] || item.id?.[0] || '#';
          
          return {
            title: title.replace(/<[^>]*>/g, '').trim(),
            description: truncateTo100Words(description.replace(/<[^>]*>/g, '').trim()),
            url: link,
            source: { name: 'RSS Feed' }
          };
        }).filter(article => article.title && article.description);
        
        resolve(articles);
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

// Function to fetch news from multiple free APIs
async function fetchNewsFromMultipleSources() {
  const allArticles = [];
  const seenTitles = new Set();

  try {
    // 1. The Hindu RSS Feed (National News) - Completely Free
    try {
      const hinduResponse = await axios.get('https://www.thehindu.com/news/national/feeder/default.rss', {
        ...axiosConfig,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      });
      const hinduArticles = await parseRSS(hinduResponse.data);
      hinduArticles.forEach(article => {
        if (!seenTitles.has(article.title.toLowerCase())) {
          article.source = { name: 'The Hindu' };
          allArticles.push(article);
          seenTitles.add(article.title.toLowerCase());
        }
      });
      console.log(`✓ The Hindu: ${hinduArticles.length} articles`);
    } catch (err) {
      console.log('✗ The Hindu RSS failed:', err.message);
    }

    // 2. Times of India RSS Feed (National News) - Completely Free
    try {
      const toiResponse = await axios.get('https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms', {
        ...axiosConfig,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      });
      const toiArticles = await parseRSS(toiResponse.data);
      toiArticles.forEach(article => {
        if (!seenTitles.has(article.title.toLowerCase())) {
          article.source = { name: 'Times of India' };
          allArticles.push(article);
          seenTitles.add(article.title.toLowerCase());
        }
      });
      console.log(`✓ Times of India: ${toiArticles.length} articles`);
    } catch (err) {
      console.log('✗ TOI RSS failed:', err.message);
    }

    // 3. India Today RSS Feed - Completely Free
    try {
      const indiaTodayResponse = await axios.get('https://www.indiatoday.in/rss/1206514', {
        ...axiosConfig,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      });
      const indiaTodayArticles = await parseRSS(indiaTodayResponse.data);
      indiaTodayArticles.forEach(article => {
        if (!seenTitles.has(article.title.toLowerCase())) {
          article.source = { name: 'India Today' };
          allArticles.push(article);
          seenTitles.add(article.title.toLowerCase());
        }
      });
      console.log(`✓ India Today: ${indiaTodayArticles.length} articles`);
    } catch (err) {
      console.log('✗ India Today RSS failed:', err.message);
    }

    // 4. Hindustan Times RSS Feed - Completely Free
    try {
      const htResponse = await axios.get('https://www.hindustantimes.com/rss/topnews/rssfeed.xml', {
        ...axiosConfig,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      });
      const htArticles = await parseRSS(htResponse.data);
      htArticles.forEach(article => {
        if (!seenTitles.has(article.title.toLowerCase())) {
          article.source = { name: 'Hindustan Times' };
          allArticles.push(article);
          seenTitles.add(article.title.toLowerCase());
        }
      });
      console.log(`✓ Hindustan Times: ${htArticles.length} articles`);
    } catch (err) {
      console.log('✗ Hindustan Times RSS failed:', err.message);
    }

    // 5. NewsAPI.org (if API key is provided) - Free Tier
    const newsApiKey = process.env.NEWS_API_KEY;
    if (newsApiKey && newsApiKey !== 'your-api-key-here') {
      try {
        const newsApiResponse = await axios.get('https://newsapi.org/v2/top-headlines', {
          params: {
            country: 'in',
            category: 'general',
            pageSize: 5,
            apiKey: newsApiKey
          },
          timeout: 5000
        });
        
        if (newsApiResponse.data && newsApiResponse.data.articles) {
          newsApiResponse.data.articles.forEach(article => {
            if (article.title && article.description && !seenTitles.has(article.title.toLowerCase())) {
              allArticles.push({
                title: article.title,
                description: truncateTo100Words(article.description || article.content || ''),
                url: article.url || '#',
                source: article.source || { name: 'NewsAPI' }
              });
              seenTitles.add(article.title.toLowerCase());
            }
          });
        }
      } catch (err) {
        console.log('NewsAPI failed:', err.message);
      }
    }

    // Filter for defence/national keywords
    const keywords = ['defence', 'defense', 'military', 'army', 'navy', 'air force', 'national', 'security', 'border', 'government', 'india', 'indian'];
    const filteredArticles = allArticles.filter(article => {
      const text = (article.title + ' ' + article.description).toLowerCase();
      return keywords.some(keyword => text.includes(keyword));
    });

    // If we have filtered articles, use them; otherwise use all
    const finalArticles = filteredArticles.length > 0 ? filteredArticles : allArticles;

    // Sort by relevance and limit to 10
    const result = finalArticles.slice(0, 10);
    
    // If we got no articles, return at least some basic info
    if (result.length === 0) {
      console.log('No articles found from RSS feeds. This might be due to CORS or feed format issues.');
    }
    
    return result;

  } catch (error) {
    console.error('Error fetching news:', error.message);
    return [];
  }
}

// Fetch news on server start
async function initializeNews() {
  console.log('Fetching latest news from multiple sources...');
  try {
    newsCache = await fetchNewsFromMultipleSources();
    lastNewsFetch = new Date();
    console.log(`Loaded ${newsCache.length} news articles`);
    if (newsCache.length === 0) {
      console.log('Warning: No news articles loaded. RSS feeds might be blocked or unavailable.');
    }
  } catch (error) {
    console.error('Error initializing news:', error.message);
    newsCache = [];
  }
}

// Initialize news when server starts
initializeNews();

// Refresh news every 30 minutes
setInterval(async () => {
  console.log('Refreshing news cache...');
  newsCache = await fetchNewsFromMultipleSources();
  lastNewsFetch = new Date();
  console.log(`Refreshed news cache: ${newsCache.length} articles`);
}, 30 * 60 * 1000); // 30 minutes

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get news headlines
app.get('/api/news', async (req, res) => {
  try {
    // Return cached news
    if (newsCache.length > 0) {
      return res.json(newsCache.slice(0, 10));
    }

    // If cache is empty, try to fetch fresh
    const freshNews = await fetchNewsFromMultipleSources();
    if (freshNews.length > 0) {
      newsCache = freshNews;
      lastNewsFetch = new Date();
      return res.json(newsCache.slice(0, 10));
    }

    // If all sources fail, return empty array
    res.json([]);
  } catch (error) {
    console.error('Error in /api/news:', error.message);
    res.json(newsCache.length > 0 ? newsCache.slice(0, 10) : []);
  }
});

// Manual refresh endpoint (optional)
app.post('/api/news/refresh', async (req, res) => {
  try {
    console.log('Manual news refresh requested...');
    newsCache = await fetchNewsFromMultipleSources();
    lastNewsFetch = new Date();
    res.json({ 
      success: true, 
      message: `Refreshed ${newsCache.length} news articles`,
      count: newsCache.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload file
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const uploadType = req.body.uploadType;
    let finalPath = req.file.path;
    let finalFilename = req.file.filename;
    
    // Determine destination folder based on upload type
    let targetDir = 'uploads/';
    
    if (uploadType === 'lecture') {
      targetDir += req.body.folder === 'newspaper' ? 'newspaper' : 'reading_material';
      
      // Handle filename for lecture
      if (req.body.filename) {
        finalFilename = req.body.filename;
      } else if (req.body.folder === 'newspaper' && req.body.date) {
        const ext = path.extname(req.file.originalname);
        const nameWithoutExt = path.basename(req.file.originalname, ext);
        finalFilename = `${nameWithoutExt}_${req.body.date}${ext}`;
      } else {
        finalFilename = req.file.originalname;
      }
    } else if (uploadType === 'tat') {
      targetDir += 'tat_images';
      
      // Auto-number TAT images
      const tatDir = 'uploads/tat_images';
      fs.ensureDirSync(tatDir);
      const files = fs.readdirSync(tatDir).filter(f => 
        /\.(png|jpg|jpeg)$/i.test(f) && f.startsWith('TAT_')
      );
      
      let maxNum = 0;
      files.forEach(f => {
        const match = f.match(/TAT_(\d+)\./i);
        if (match) {
          maxNum = Math.max(maxNum, parseInt(match[1]));
        }
      });
      
      const ext = path.extname(req.file.originalname);
      finalFilename = `TAT_${maxNum + 1}${ext}`;
    } else if (uploadType === 'wat') {
      targetDir += 'wat_words';
      finalFilename = 'words.txt';
    } else if (uploadType === 'srt') {
      targetDir += 'srt_list';
      finalFilename = 'srt_list.txt';
    } else {
      targetDir = 'uploads/';
    }
    
    // Ensure target directory exists
    fs.ensureDirSync(targetDir);
    
    // Move file to correct location
    const targetPath = path.join(targetDir, finalFilename);
    if (req.file.path !== targetPath) {
      fs.moveSync(req.file.path, targetPath, { overwrite: true });
      finalPath = targetPath;
    }
    
    // Handle SRT parsing
    if (uploadType === 'srt') {
      const content = fs.readFileSync(targetPath, 'utf-8');
      const srtItems = [];
      
      // Parse numbered SRT items
      const lines = content.split('\n');
      let currentItem = null;
      
      for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        const match = line.match(/^(\d+)\.\s*(.+)$/);
        if (match) {
          if (currentItem) {
            srtItems.push(currentItem);
          }
          currentItem = {
            number: parseInt(match[1]),
            text: match[2]
          };
        } else if (currentItem) {
          currentItem.text += ' ' + line;
        }
      }
      
      if (currentItem) {
        srtItems.push(currentItem);
      }
      
      // Save as JSON
      const jsonPath = path.join('uploads/srt_list', 'srt_list.json');
      fs.writeJsonSync(jsonPath, srtItems, { spaces: 2 });
    }
    
    res.json({ 
      success: true, 
      message: 'File uploaded successfully',
      filename: finalFilename,
      path: finalPath
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get TAT images
app.get('/api/tat-images', (req, res) => {
  try {
    const tatDir = 'uploads/tat_images';
    const files = fs.readdirSync(tatDir)
      .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
      .map(f => ({
        filename: f,
        path: `/uploads/tat_images/${f}`
      }))
      .sort((a, b) => {
        const numA = parseInt(a.filename.match(/\d+/)?.[0] || 0);
        const numB = parseInt(b.filename.match(/\d+/)?.[0] || 0);
        return numA - numB;
      });
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get WAT words
app.get('/api/wat-words', (req, res) => {
  try {
    const wordsPath = 'uploads/wat_words/words.txt';
    if (fs.existsSync(wordsPath)) {
      const content = fs.readFileSync(wordsPath, 'utf-8');
      const words = content.split('\n')
        .map(w => w.trim())
        .filter(w => w.length > 0);
      res.json(words);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get SRT list
app.get('/api/srt-list', (req, res) => {
  try {
    const jsonPath = 'uploads/srt_list/srt_list.json';
    if (fs.existsSync(jsonPath)) {
      const srtList = fs.readJsonSync(jsonPath);
      res.json(srtList);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reading material files
app.get('/api/reading-material', (req, res) => {
  try {
    const dir = 'uploads/reading_material';
    const files = fs.readdirSync(dir)
      .map(f => ({
        filename: f,
        path: `/uploads/reading_material/${f}`,
        type: path.extname(f).toLowerCase()
      }));
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get newspaper files
app.get('/api/newspapers', (req, res) => {
  try {
    const dir = 'uploads/newspaper';
    const files = fs.readdirSync(dir)
      .map(f => ({
        filename: f,
        path: `/uploads/newspaper/${f}`,
        type: path.extname(f).toLowerCase(),
        date: extractDateFromFilename(f)
      }))
      .sort((a, b) => {
        if (a.date && b.date) {
          return new Date(b.date) - new Date(a.date);
        }
        return b.filename.localeCompare(a.filename);
      });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function extractDateFromFilename(filename) {
  const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on port ${PORT}`);
  // News will be fetched automatically on server start via initializeNews()
});

