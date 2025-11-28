# SSB Prep Portal

A complete full-stack mobile-friendly application for SSB (Services Selection Board) preparation with three core modules: TEST, UPLOAD, and READ.

## 🚀 Quick Deployment to GitHub Pages

**Want to deploy to GitHub Pages?** See [GITHUB_SETUP.md](./GITHUB_SETUP.md) for a 5-minute setup guide!

The app is configured for GitHub Pages deployment:
- Frontend deploys to GitHub Pages automatically
- Backend needs separate hosting (Render, Railway, etc. - all free)
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions

## Features

### 📝 TEST Module
- **TAT Test**: Practice with 12 randomly selected images (30s viewing + 4min writing per image)
- **WAT Test**: Practice with 60 words (30 seconds per word)
- **SRT Test**: Practice with 60 SRTs (30-minute timer)

### 📤 UPLOAD Module
- **Lecture Material**: Upload PDF, DOC, DOCX, TXT files to reading_material/ or newspaper/ folders
- **TAT Images**: Upload PNG, JPG, JPEG images with auto-numbering (TAT_1.png, TAT_2.png...)
- **WAT Words**: Upload .txt file with one word per line
- **SRT List**: Upload .txt file with numbered SRT items

### 📖 READ Module
- Latest 5 defence/national news headlines
- Browse and read uploaded reading materials
- Browse newspapers sorted by date

## Installation (Local Development)

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Steps

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Set up News API (Optional)**:
   - Get a free API key from [NewsAPI.org](https://newsapi.org/)
   - Create a `.env` file in the root directory:
     ```
     NEWS_API_KEY=your-api-key-here
     ```
   - If no API key is provided, the app will use mock news data

3. **Start the application**:
   ```bash
   npm run dev
   ```
   This will start both the backend server (port 5000) and frontend (port 3000).

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

4. **Access the app**:
   - Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
ssb-prep-portal/
├── server/
│   └── index.js          # Express backend server
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── LandingPage.js
│       │   ├── UploadModule.js
│       │   ├── TestModule.js
│       │   ├── ReadModule.js
│       │   └── tests/
│       │       ├── TATTest.js
│       │       ├── WATTest.js
│       │       └── SRTTest.js
│       ├── config/
│       │   └── api.js     # API configuration
│       ├── App.js
│       └── index.js
├── uploads/              # Auto-created upload directories
│   ├── reading_material/
│   ├── newspaper/
│   ├── tat_images/
│   ├── wat_words/
│   └── srt_list/
├── .github/
│   └── workflows/        # GitHub Actions for deployment
├── package.json
└── README.md
```

## Usage

### Uploading Files

1. Click **UPLOAD** on the landing page
2. Select the type of file you want to upload:
   - **Lecture Material**: Choose folder (reading_material or newspaper), enter filename, and upload
   - **TAT Images**: Images are automatically numbered
   - **WAT Words**: Upload a .txt file with one word per line
   - **SRT List**: Upload a .txt file with numbered items (1. You are walking...)

### Taking Tests

1. Click **TEST** on the landing page
2. Select the test type:
   - **TAT Test**: View each image for 30 seconds, then write your story for 4 minutes
   - **WAT Test**: View 60 words, 30 seconds each
   - **SRT Test**: Complete 60 SRTs within 30 minutes

### Reading Materials

1. Click **READ** on the landing page
2. View latest news headlines
3. Browse and click on reading materials or newspapers to open them

## File Formats

- **Lecture Material**: PDF, DOC, DOCX, TXT
- **TAT Images**: PNG, JPG, JPEG
- **WAT Words**: TXT (one word per line)
- **SRT List**: TXT (numbered format: 1. You are walking...)

## Deployment

### GitHub Pages Deployment

See [GITHUB_SETUP.md](./GITHUB_SETUP.md) for quick setup or [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Steps:**
1. Update `client/package.json` homepage with your GitHub username
2. Push to GitHub
3. Enable GitHub Pages in repository settings
4. Deploy backend to Render/Railway/Vercel (free)
5. Set `REACT_APP_API_URL` environment variable

### Environment Variables

**Frontend (GitHub Pages):**
- `REACT_APP_API_URL`: Your backend service URL

**Backend (Render/Railway/etc.):**
- `PORT`: Server port (usually auto-set)
- `NEWS_API_KEY`: (Optional) News API key
- `FRONTEND_URL`: (Optional) Your GitHub Pages URL for CORS

## Notes

- All uploaded files are stored in the `uploads/` directory
- TAT images are automatically numbered sequentially
- Newspaper files are automatically appended with the date
- The app is mobile-responsive and works on all screen sizes
- Sound alerts play at the end of test timers
- For GitHub Pages deployment, backend must be hosted separately

## Troubleshooting

- **Port already in use**: Change the PORT in `server/index.js` or set `PORT` environment variable
- **Files not uploading**: Check that the `uploads/` directory has write permissions
- **News not loading**: The app will use mock data if the News API key is not set or fails
- **CORS errors**: Update `server/index.js` CORS settings with your frontend URL
- **404 on refresh (GitHub Pages)**: Normal for React Router. Navigate from home page.

## License

ISC
