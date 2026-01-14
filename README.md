# YT-DLP Web Wrapper (Experimental / Archived)

## 🛑 Project Status: Archived

**Notice:** This project is no longer under active development. It is preserved here as a technical case study in Node.js file system management, session persistence, and security auditing.

### ⚠️ Security Warning

This application performs destructive file system operations (`rm`, `unlink`). During development, a comprehensive security audit revealed several critical edge cases (documented below) that require significant hardening before this tool can be considered "safe" for general use.

**Do not run this on a machine containing sensitive data.** Use a containerized environment (Docker) or a dedicated sandbox partition.

---

## The "Security Wall" (Lessons Learned)

This project successfully implemented a web interface for `yt-dlp` with a unique "distributed session" architecture. However, development reached a "sunset" phase when the complexity of **safe file system management** began to outweigh the utility of the tool.

The audit below highlights the "Shadow Project"—the massive amount of invisible infrastructure required to make a simple "Delete" button truly safe on a host OS.

### 🔍 Identified Security & Edge Case Debt

These are the findings from the final security audit. They are documented here for educational purposes and remain unmitigated in this version:

#### Critical Severity

- **Path Traversal (C1):** Cleanup routines lack strict filename validation. Maliciously crafted filenames could theoretically escape the session folder.
- **Symlink Attack Risk (C2):** The recursive delete logic does not explicitly check for symlinks. A symlink to a system directory (e.g., `/etc`) could be followed during a cleanup task.
- **yt-dlp Command Injection (C4):** URLs are passed to the CLI without a hardened argument separator (`--`), posing a risk if malformed strings are input.

#### High/Medium Severity

- **Incomplete Path Guardrails:** Current protections only block the project `root` and `src/`. It lacks global system guards for `/home`, `/etc`, or `/root`.
- **Process Locking:** Folder removal occasionally fails with `EISDIR` errors when `yt-dlp` or the OS holds a file handle, requiring a more robust "Verified Drain" logic.

---

## Features (As Implemented)

- **Distributed Sessions:** Uses a global registry to track downloads across restarts.
- **Surgical Cleanup:** Attempts to remove only `.part`, `.ytdl`, and `.json` files to protect user data.
- **Signature Guard:** Every folder is tagged with `---ytdlpwebuisession` to prevent accidental deletion of non-app folders.
- **Stream Downloads:** Real-time progress tracking via standard out.
- **Native Folder Picker:** Integration with Zenity (Linux), PowerShell (Win), and AppleScript (macOS).

## Tech Stack

- **Framework:** TanStack Start (React + Vite + SSR)
- **Styling:** Tailwind CSS + shadcn/ui
- **Validation:** Zod + TanStack Form
- **CLI Wrapper:** Node `child_process` (Spawn)

## Requirements

- Node.js 20+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [ffmpeg](https://ffmpeg.org/)
- **Linux:** `sudo apt install zenity` (for folder picking)

## License

MIT - Provided "as-is" without any warranties.

---

### Final Thoughts

If you are looking to fork this, focus on the **Path Jail** pattern ensuring all operations are verified using `path.relative` against a strictly defined storage root. The UI and session logic are solid; the file system "plumbing" is the final frontier.
