# ControlStackAI — Languages & Tools (Drop‑in)

This zip adds a clean, professional “Languages & Tools” section to your site while preserving the current layout.

## Files included
```
styles/stack.css
snippets/stack-section.html
snippets/services-tooling-block.html   # optional for services.html
snippets/nav-link.html                 # optional header nav link
```

## How to install (Cloudflare Pages friendly)
1. **Copy** `styles/stack.css` into your repo at `styles/`.
2. **Link the CSS** in your HTML `<head>` (add after your existing stylesheet links):
   ```html
   <link rel="stylesheet" href="/styles/stack.css">
   ```
3. **Add the main section**: open `index.html` and paste the contents of `snippets/stack-section.html`
   **below your Services section** and **above Contact**. If unsure, paste it **right before `</main>`**
   or just before `</footer>`—it’s fully self-contained and won’t clash with existing CSS.
4. *(Optional)* Add a **nav link** in your header/menu:
   ```html
   <!-- somewhere in your <nav> list -->
   <li><a href="#stack">Stack</a></li>
   ```
5. *(Optional)* In `services.html`, you can paste `snippets/services-tooling-block.html` under your
   services list to keep pages consistent.

## What’s included
- **Core Languages**: Python, Rust, Go, Java, MATLAB, C, C++
- **AI/ML/DL**: PyTorch, TensorFlow/Keras, scikit‑learn, XGBoost, LightGBM, JAX, NumPy, pandas
- **UI & Desktop**: PySide6 (Qt), Qt Widgets/Quick, native integrations
- **MATLAB ↔ Python**: MATLAB Engine for Python, `scipy.io`, `mat73`/`h5py`, codegen bridges

The CSS is **scoped** (prefixed with `cs-`) so it won’t interfere with your current design.

## Commit checklist
- [ ] Add `/styles/stack.css`
- [ ] Paste the main `stack-section` into `index.html`
- [ ] (Optional) Paste services block into `services.html`
- [ ] (Optional) Add nav link to header

---

Need this as a ready-to-merge branch or with the section auto‑inserted for you? Ping me and I’ll ship a PR patch against `main`.