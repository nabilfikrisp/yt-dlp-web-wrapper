# YT-DLP Web Wrapper (Experimental / Archived)

## 🛑 PROJECT STATUS: ARCHIVED

**Notice:** This project is no longer under active development. It is preserved here as a technical case study in Node.js file system management, OS-level integration, and security auditing.

### ⚠️ Security Warning

This application performs destructive file system operations (`rm`, `unlink`) and executes shell commands. During development, a comprehensive security audit revealed several critical architectural risks that require significant hardening.

**Do not run this on a machine containing sensitive data.**

---

## 🌿 Branch Strategy

To preserve the work while protecting the user, this repository has been split:

- **`main` (Current):** A "Safe View" branch. All destructive cleanup logic, shell-based folder pickers, and session-deletion features have been **removed or disabled**.
- **`unsafe-latest-feature`:** Contains the full implementation, including the automated cleanup and native OS integrations.
- **Warning:** This branch contains the documented security risks (C1-C4) and should be used for educational/reference purposes only.

---

## Technical Journey & "The Wall"

This project started as a simple UI wrapper for `yt-dlp`. However, as the scope moved toward managing local download sessions and automated cleanup, the complexity of **safe OS integration** became the primary focus.

The project reached a "sunset" phase when the effort to mitigate OS-level risks (Path Traversal, Command Injection, and Shell Escaping) began to outweigh the utility of the tool.

### 🔍 Security Audit (Findings)

Below are the documented risks identified during development that remain unaddressed in this version:

#### Critical Severity

- **Path Traversal (C1):** File cleanup routines lack full validation of filenames inside session folders, potentially allowing "escape" via malicious filenames.
- **Symlink Vulnerability (C2):** Recursive delete operations do not currently distinguish between local files and symlinks.
- **yt-dlp Command Injection (C4):** Arguments passed to the CLI lack a hardened "jail," posing a risk if malformed URLs are processed.

#### Architectural "Unsafe" Features (Moved to separate branch)

- **Native Folder Picking:** Integration with PowerShell, Zenity, and AppleScript involves spawning shell processes. Without strict input sanitization, these are vulnerable to shell injection.
- **Distributed Session Registry:** The global registry tracks local paths. Corrupting this registry could lead to the app attempting to "clean up" or manage unauthorized system directories.

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

This project served as a deep dive into the risks of building local-first web tools. The "Shadow Project" of security (Path Jailing, Argument Sanitization, and Resource Guarding) is the true challenge of system-level software.

---
