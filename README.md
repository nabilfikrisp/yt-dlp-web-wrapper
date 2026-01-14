# YT-DLP Web Wrapper

Web interface for downloading YouTube videos with yt-dlp.

## Features

- Web-based UI for yt-dlp
- Video/audio format selection with quality info
- Stream downloads with real-time progress
- Automatic metadata fetching
- Browser folder picker (no config files)
- Resumeable unfinished downloads

## Requirements

- Node.js 20+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed
- [ffmpeg](https://ffmpeg.org/) installed (for merging video+audio)
- **For Folder Picking:**
  - **Windows:** PowerShell (Built-in)
  - **Linux:** `sudo apt install zenity`
  - **macOS:** AppleScript (Built-in)

## Installation

```bash
git clone https://github.com/yourusername/yt-dlp-web-wrapper.git
cd yt-dlp-web-wrapper
pnpm install
pnpm dev
```

Open http://localhost:3000

## First Run

1. On first launch, select your download folder
2. The app will verify yt-dlp and ffmpeg are installed
3. Start downloading!

## Tech Stack

- TanStack Start (React + Vite + SSR)
- Tailwind CSS + shadcn/ui
- Zod + TanStack Form

## License

MIT
