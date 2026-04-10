# ✦ Carousel Craft

### AI-Powered Social Media Creative Studio

> Generate structured, platform-ready social media creatives from a simple idea — in seconds.

---

## 🔗 Live Demo

👉 https://carousel-craft-sandy.vercel.app

---

## 📌 Problem Statement

Content teams, especially in edtech, face a recurring bottleneck:

* Creating **high-quality social media creatives** is slow
* Requires **design expertise + copywriting skills**
* Maintaining **brand consistency and narrative flow** is difficult
* Iteration is time-consuming

This results in reduced content velocity and inconsistent output quality.

---

## 💡 Solution

Carousel Craft is a browser-based AI studio that transforms a rough idea into a **fully structured, visually designed, and platform-optimized creative**.

It combines:

* AI-generated storytelling
* Deterministic visual generation
* Interactive editing tools

The result is a **ready-to-post creative with minimal effort**.

---

## ✨ Key Features

* AI-generated structured slides (Hook → Build → Takeaway)
* Multiple formats: Carousel, Post, Story
* Platform-aware content (Instagram, LinkedIn, Facebook)
* Tone customization (Reassuring, Curious, Data-driven, Playful)
* Canvas-based instant visual generation
* Inline editing for real-time content updates
* Per-slide regeneration
* Caption + hashtag generator
* PNG export for publishing

---

## 🧠 Key Design Decisions & Tradeoffs

### 1. Narrative Enforcement vs Flexibility

* Enforced structured storytelling for consistency
* Tradeoff: Reduced creative randomness

### 2. Canvas Visual Engine vs External APIs

* Built a client-side visual generator
* Tradeoff: Less realism compared to AI images
* Benefit: Instant generation, no API failures, no latency

### 3. Single-File Architecture

* Entire app built in a centralized structure
* Tradeoff: Lower scalability
* Benefit: Faster development and easier debugging

### 4. AI JSON Parsing Strategy

* Implemented self-healing parsing for malformed outputs
* Tradeoff: Added complexity in handling responses

---

## ⚙️ Challenges & Solutions

### Challenge 1: Inconsistent AI Output Format

**Solution:** Built a fallback parser and re-prompting strategy to repair malformed JSON.

### Challenge 2: Slow / Unreliable Image APIs

**Solution:** Replaced with deterministic Canvas-based visual engine.

### Challenge 3: Maintaining Narrative Quality

**Solution:** Strict prompting to enforce storytelling structure.

### Challenge 4: Real-time Editing Without Breaking Layout

**Solution:** Component-based rendering with controlled state updates.

---

## 🚀 Future Improvements

* Multi-user collaboration
* Saved templates and reusable drafts
* Animation exports (video/GIF)
* Advanced brand customization
* Analytics-based content suggestions

---

## 🛠️ Tech Stack

* React 18 + Vite
* Anthropic Claude API
* HTML5 Canvas
* html2canvas
* Vercel Deployment

---

## 👤 Author

Drishita Paul
