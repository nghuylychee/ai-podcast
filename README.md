# AI Podcast Feed

A TikTok-style web app for listening to AI-generated podcasts. Built with React, Tailwind CSS, and Framer Motion.

## Features

- 🎧 Vertical scrolling podcast feed
- 🎯 Topic-based filtering
- 🎨 Beautiful, minimal UI
- 🔄 Smooth animations and transitions
- 🎵 Background playback support
- 📱 Mobile-friendly design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd podcast-ai
```

2. Install dependencies:
```bash
npm install
```

3. Add your audio files:
Place your AI-generated podcast audio files in the `public/audio` directory.

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
/public
  /audio          # Podcast audio files
/src
  /components     # React components
    Feed.jsx      # Main podcast feed
    PodcastPlayer.jsx  # Audio player
    TopicFilter.jsx    # Topic filtering
  /data
    podcasts.json # Podcast metadata
  App.jsx         # Main app component
  index.css       # Global styles
```

## Adding New Podcasts

To add new podcasts, follow these steps:

1. Add your audio file to `/public/audio/`
2. Update `src/data/podcasts.json` with the new podcast metadata:

```json
{
  "id": "unique-id",
  "title": "Podcast Title",
  "topic": "Topic Category",
  "audio_url": "/audio/your-file.mp3",
  "duration": 180,
  "background_img": "background-image-url"
}
```

## Technologies Used

- React
- Tailwind CSS
- Framer Motion
- Howler.js
- Vite

## License

MIT

## Acknowledgments

- Background images from Unsplash
- Icons from Heroicons
