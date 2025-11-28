# Quick Start Guide

## Installation (One Command)

```bash
npm run install-all
```

This installs dependencies for both backend and frontend.

## Running the App

### Option 1: Run Both Together (Recommended)
```bash
npm run dev
```

This starts:
- Backend server on `http://localhost:5000`
- Frontend app on `http://localhost:3000`

### Option 2: Run Separately

**Terminal 1 (Backend):**
```bash
npm run server
```

**Terminal 2 (Frontend):**
```bash
npm run client
```

## First Steps

1. **Open the app**: Navigate to `http://localhost:3000`

2. **Upload some test data**:
   - Click **UPLOAD**
   - Upload TAT images (PNG/JPG)
   - Upload WAT words (.txt file with one word per line)
   - Upload SRT list (.txt file with numbered items)

3. **Take a test**:
   - Click **TEST**
   - Select any test type
   - Follow the on-screen instructions

4. **Read materials**:
   - Click **READ**
   - View news and browse uploaded files

## File Upload Examples

### WAT Words File (words.txt)
```
courage
leadership
teamwork
discipline
honor
```

### SRT List File (srt_list.txt)
```
1. You are walking in a forest
2. A person approaches you
3. Suddenly you see a building
4. You enter the building
```

## Troubleshooting

- **Port 5000 already in use**: Change PORT in `server/index.js` or set environment variable
- **Port 3000 already in use**: React will automatically use the next available port
- **Files not uploading**: Ensure `uploads/` directory has write permissions
- **News API errors**: App will use mock data if API fails

## Environment Variables (Optional)

Create a `.env` file in the root directory:

```
PORT=5000
NEWS_API_KEY=your-news-api-key-here
```

