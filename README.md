````markdown
# 🌐 Website Replica Generator

Imagine capturing an entire website — styles, images, and structure — into a ZIP file with just a URL.  
**Website Replica Generator** is a browser-based tool that does exactly that. No backend. No signup. Just instant, client-side website replication.

🔗 [Live Demo](https://website-replica-generator.netlify.app/)



## ✨ Features at a Glance

✅ Paste any valid website URL  
✅ Fetches HTML, images, and stylesheets  
✅ Rewrites asset paths for local usage  
✅ Bundles everything into a downloadable `.zip` file  
✅ Fully client-side — your data stays in your browser  
✅ No frameworks, no installations — just open and use



## 📸 Visual Walkthrough

+--------------------------------------------------------+
|              🌐 Website Replica Generator              |
+--------------------------------------------------------+
| 🔗 Enter Website URL: [ https://example.com       ]    |
| [ Generate Replica ]                                   |
+--------------------------------------------------------+
| ⏳ Fetching HTML...                                     |
| 🖼️ Downloading images, stylesheets...                  |
| ✅ All assets fetched!                                 |
| ⬇️ Download ZIP button appears                         |
+--------------------------------------------------------+


## 🎯 Use Cases

* 📦 **Offline Browsing** — Take any public webpage offline for studying or demo purposes
* 🧑‍💻 **Web Dev Learning** — Break down website structure & styles into components
* 🗂️ **Archiving Web Content** — Store static versions of pages before they disappear
* 💡 **Inspiration Toolkit** — Collect designs, layouts, and UI references for later
* 🧪 **Testing & Experimenting** — See how pages behave in local or sandboxed environments



## 🧠 How It Works (Under the Hood)

### 1. User Input

* URL is validated and sanitized before making requests.

### 2. HTML Fetching

* The main HTML content is fetched using `fetch()`.
* DOM is parsed using `DOMParser`.

### 3. Asset Collection

* Parses `<link>`, `<img>`, and other references to:

  * Stylesheets
  * Images
  * Inline or embedded content
* Fetches each asset using asynchronous requests.

### 4. Path Rewriting

* All external links are rewritten to local file references.
* HTML and CSS are updated accordingly.

### 5. Packaging with JSZip

* Uses [JSZip](https://stuk.github.io/jszip/) to create a structured `.zip` file:

  
  /index.html
  /images/
  /styles/
  ```
* ZIP is auto-triggered for download via Blob URLs.



## 🛠️ Built With

* **HTML5** – Semantic, clean layout
* **Vanilla JavaScript** – No dependencies except JSZip
* **JSZip** – JavaScript ZIP file creation
* **FileSaver.js** (optional) – Save Blob to local system
* **Flexbox + Media Queries** – Responsive and minimal UI design



## 🚀 Getting Started Locally

Want to run it offline or modify it?

```bash
# Clone the repository
git clone https://github.com/your-username/website-replica-generator.git
cd website-replica-generator

# Open in your browser
open index.html  # or manually double-click the file


✅ No build step
✅ No server required
✅ Just HTML + JS in a browser



## 🧩 Feature Ideas (Coming Soon / Contributions Welcome)

* [ ] JavaScript file fetching and inlining
* [ ] Google Fonts and external font support
* [ ] Choose what to include (images, CSS, JS, fonts)
* [ ] Dark/light UI toggle
* [ ] Progress bar with asset count
* [ ] Site preview pane before download



## 🤝 Contributing

Contributions are more than welcome!

1. Fork the repository
2. Create your branch: `git checkout -b feature/awesome-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/awesome-feature`
5. Open a pull request

If you’d like to suggest features or report bugs, open an issue!



## 📄 License

This project is licensed under the **MIT License** — use it freely in commercial and personal projects.



## 🙌 Acknowledgments

* [JSZip](https://stuk.github.io/jszip/) for client-side zipping
* [MDN Web Docs](https://developer.mozilla.org/) for all the browser API guidance
* Inspiration from tools like HTTrack, but with a browser-only twist



## 🚧 Limitations

> This tool is a *basic static replica generator*. It will not clone:

* Dynamic content (loaded via JavaScript/AJAX)
* User authentication or logins
* Backend scripts (PHP, Node, Python, etc.)
* Third-party iframes or cross-origin data (CORS restrictions apply)



## 🔥 Example Workflow

1. Visit: [https://website-replica-generator.netlify.app](https://website-replica-generator.netlify.app)
2. Paste: `https://example.com`
3. Click **Generate Replica**
4. Wait \~5–10 seconds depending on page size
5. Hit **Download ZIP**
6. Open `index.html` locally — voilà! Offline website replica ✨



## 📬 Contact

Have feedback, suggestions, or want to collaborate?

📧 Reach out via GitHub Issues or discussions
🚀 Follow me on [GitHub](https://github.com/manuvish011) for more open-source tools



> 💡 *“Sometimes the best dev tools are the ones that save time, not just build code.”*



---

📌 **Note**: If you'd like me to add matching screenshots, animations (GIFs), or badges (build status, license, etc.), I can generate those for you as well. Just let me know!
```
