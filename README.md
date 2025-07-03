# WeebGet – A CLI Tool to Download Anime Episodes ![GitHub last commit](https://img.shields.io/github/last-commit/ryokacchi/weebget) ![GitHub Repo stars](https://img.shields.io/github/stars/ryokacchi/weebget)

WeebGet is a simple and powerful command-line tool that lets you download your favorite anime episodes directly from the terminal.
Forget about endless searching—just run a command and fetch episodes automatically in the best quality available.

**Episode data is provided by [Animely.net](https://animely.net)**

[*Preview Video*](https://cdn.discordapp.com/attachments/1096085224632361005/1375832968630636575/2025-05-21_13-56-32_online-video-cutter.com.mp4?ex=6833c88d&is=6832770d&hm=c2cbddc0cd3f488608c3e7d56087ee277b35a103723322370393831135416ede&)

## Installation
First of all, to run this project, your computer must have [Node.js version >=23](https://nodejs.org/tr) installed.

```bash
git clone https://github.com/ryokacchi/weebget
cd weebget-animely
npm start
```

## 🆕 Latest Updates

### 🔧 Critical Bug Fixes

#### 1. **API Request Inconsistency Resolved**
- **Issue**: Mixed usage of `fetch` and `axios` throughout the codebase
- **Solution**: Standardized all API requests to use `axios`
- **Impact**: More consistent error handling and timeout support

#### 2. **`[object Object]` Display Error Fixed**
- **Issue**: Fansub information and some fields displayed as `[object Object]`
- **Solution**: Added special parsing logic for object fields
- **Impact**: All information now displays properly and readable

#### 3. **ESLint Rule Conflicts Resolved**
- **Issue**: `no-inline-comments` rule conflicted with existing code
- **Solution**: Removed unnecessary ESLint rules
- **Impact**: Consistent code standards maintained

### 🚀 New Features

#### 1. **Enhanced Search System**
```bash
# All of these now work:
- "solo leveling" → Finds both Season 1 and Season 2
- "solo" → Lists all anime starting with Solo  
- "Solo Leveling 2. sezon" → Directly finds Season 2
```

**Search Levels:**
- **Exact Match**: Precise name matching
- **Partial Match**: Substring matching
- **Fuzzy Match**: Word-based search

#### 2. **Multiple Results Support**
- Selection screen appears when multiple anime are found
- Shows season number and episode count information
- User-friendly interface for easy selection

#### 3. **Enhanced Download Experience**
```
📥 Download starting...
[████████████████████████░░░░░░░░░░░░░░] 68.5% (145.2 MB / 212.1 MB)
✅ File successfully saved: videos/66b2c8da28db188850110f94/episode.mp4
```

**New Features:**
- Beautiful progress bar with visual download tracking
- Download speed optimization (3 seconds → 1 second updates)
- Detailed error messages and debug information
- Emoji-rich user-friendly messages

### 🛡️ Security and Stability Improvements

#### 1. **Robust Error Handling**
- **Network Errors**: Special messages for internet connection issues
- **Timeout Errors**: 30-second timeout support added
- **API Errors**: Detailed error descriptions and solution suggestions
- **File System Errors**: Automatic cleanup on file write errors

#### 2. **Input Validation**
- Empty anime name input validation
- Invalid URL checking
- Type safety with secure data processing
- Special validation for object fields

#### 3. **Enhanced Type Safety**
```javascript
// Type safety with JSDoc
/** @type {import("./jsdoc.js").Anime[]} */
let animes;

// Robust functions
export function formatName(/** @type {number|string|object} */ number, /** @type {string} */ type)
```

### 📊 Performance Improvements

#### 1. **Download Optimization**
- Progress updates reduced from 3 seconds to 1 second
- Memory-efficient downloading using stream pipeline
- File cleanup on failed downloads

#### 2. **API Call Optimization**
- Faster HTTP requests using axios
- Prevented unnecessary retries with proper error handling
- Timeout support to prevent hanging requests

### 🎨 User Experience Improvements

#### 1. **Colorful and Clear Messages**
```bash
🎉 weebget is ready for request usage
🔍 2 anime found:
✨ Solo Leveling 2.sezon selected!
📺 Total 13 episodes available
📥 Download starting...
✅ File successfully saved
```

#### 2. **Detailed Information Display**
- Season number and episode count display
- Proper fansub information rendering
- Link availability checks and user warnings
- Localized error messages

### 🔧 Technical Fixes

#### 1. **Dependency Management**
- Removed Bun dependency (was used in script but not declared)
- Full Node.js compatibility ensured
- @types/node version update

#### 2. **Code Quality**
- ESLint rules reorganized
- Consistent code formatting
- Proper error handling patterns
- Clean architecture principles

### 📝 Usage Examples

#### Scenario 1: Solo Leveling Season 2
```bash
npm start
# → Which anime would you like to search for? solo leveling 2. sezon
# → Solo Leveling 2.sezon selected!
# → 13 episodes listed
# → Choose your desired episode
# → Download begins
```

#### Scenario 2: Fuzzy Search
```bash
npm start  
# → Which anime would you like to search for? solo
# → 🔍 3 anime found:
#   • Solo Leveling (Season 1, 12 episodes)
#   • Solo Leveling 2.sezon (Season 2, 13 episodes)  
#   • Guild no Uketsukejou... (Season 1, 12 episodes)
# → Select your choice
```

### 🐛 Known Issues and Solutions

#### Issue: "Failed to fetch anime list from API"
**Solution**: Check your internet connection or try using a VPN

#### Issue: "Link not available" error
**Solution**: This is normal - that episode hasn't been uploaded yet

#### Issue: Download is very slow
**Solution**: Depends on the download server - be patient or try at a different time

## Help
If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle nudge in the right direction, please join our [Discord server](https://discord.gg/wH9ckRMETq).

## Data Source
Episode data is provided by [Animely.net](https://animely.net) - A comprehensive anime streaming platform.
