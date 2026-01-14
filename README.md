# YT-DLP Web Wrapper (Experimental / Archived)

## 🛑 PROJECT STATUS: ARCHIVED

**Notice:** This project is no longer under active development. It is preserved here as a technical case study in Node.js file system management, OS-level integration, and security auditing.

### ⚠️ Security Warning

This application performs destructive file system operations (`rm`, `unlink`) and executes shell commands. During development, a comprehensive security audit revealed several critical architectural risks that require significant hardening.

**Do not run this on a machine containing sensitive data.**

---

## 🌿 Branch Strategy

To preserve the work while protecting the user, this repository has been split:

- **`main` (Current):** **Safe View.** All destructive cleanup logic, shell-based folder pickers, and session-removal features have been **removed**.
- **`unsafe-latest-feature`:** **Full Technical Implementation.** Contains the automated cleanup and native OS integrations.
- **Warning:** This branch contains the documented security risks (C1-C4) and should be used for educational/reference purposes only.

---

## ✅ Safe Features (Available on `main`)

These features are core to the UI and the yt-dlp integration and are safe for exploration:

- **Format Selection:** Dynamic fetching of video/audio formats with quality and file size estimation.
- **Real-time Progress:** Live stream processing of `yt-dlp` output to show download percentage and speed in the UI.
- **Modern Tech Stack:** Implementation of **TanStack Start** with SSR and Type-safe routing.
- **Metadata Fetching:** Automatic retrieval of video thumbnails, titles, and descriptions before starting a download.
- **UI/UX:** A clean, responsive dashboard built with **shadcn/ui** and **Tailwind CSS**.

---

## 🔍 Security Audit & Technical Debt

The project reached a "sunset" phase when the complexity of **safe OS integration** began to outweigh the utility of the tool.

### 👤 Design Scope: Personal Use Only

By design, this application was built for **single-user, local self-hosting**.

- It lacks any form of Authentication or Authorization (AuthN/AuthZ).
- It assumes the user running the web interface has the same permissions as the user who started the server.
- **Exposure to the open internet is strictly prohibited** as it would grant unauthenticated remote access to your system's shell and file system via the identified C1-C4 vulnerabilities.

### Critical Risks (Identified)

- **Path Traversal (C1):** Cleanup routines lack strict filename validation, potentially allowing "escape" via malicious filenames.
- **Symlink Vulnerability (C2):** Recursive delete operations do not distinguish between local files and symlinks.
- **yt-dlp Command Injection (C4):** CLI arguments lack a hardened "jail" separator (`--`), posing a risk if malformed URLs are processed.

### Architectural "Unsafe" Features (Moved to `unsafe` branch)

- **Native Folder Picking:** Spawning shell processes (PowerShell/Zenity/AppleScript) without production-grade input sanitization.
- **Distributed Session Registry:** A global JSON registry that tracks local paths; corruption of this file could lead to unauthorized system directory management.
- **Surgical Session Cleanup:** Logic designed to delete `.part` and `.ytdl` files which relies on string-based path joining.

---

## Tech Stack

- **Framework:** TanStack Start (React + Vite + SSR)
- **Styling:** Tailwind CSS + shadcn/ui
- **Validation:** Zod + TanStack Form
- **Engine:** yt-dlp + ffmpeg

## Requirements

- Node.js 20+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) & [ffmpeg](https://ffmpeg.org/) installed on system PATH.

## License

MIT - Provided "as-is" without any warranties.

---

### Final Thoughts

This project served as a deep dive into the risks of building local-first web tools. The true challenge of system-level software is not the feature itself, but the **Security Infrastructure** (Path Jailing, Argument Sanitization, and Resource Guarding) required to make it safe for others.
