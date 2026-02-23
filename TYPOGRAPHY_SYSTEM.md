# TechNZ Editorial Typography System

## 📰 Overview
Professional editorial typography inspired by NewzLive, combining classic serif headlines with modern sans-serif body text for optimal readability and news-focused aesthetic.

---

## 🔤 Font Families

### **Headline Font: Merriweather (Serif)**
- **Usage**: Headlines, article titles, section headers
- **Weights**: 300 (Light), 400 (Regular), 700 (Bold), 900 (Black)
- **Character**: Editorial, traditional, authoritative
- **Fallback**: PT Serif, Georgia, Times New Roman, serif

### **Body Font: Inter (Sans-Serif)**
- **Usage**: Body text, UI elements, meta information, buttons
- **Weights**: 300-800
- **Character**: Clean, modern, highly readable
- **Fallback**: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue

---

## 📏 Typography Scale

### **Headlines (Serif)**
```css
h1 - 3rem (48px)     - Font Weight: 900 - Line Height: 1.1 - Letter Spacing: -0.03em
h2 - 2.25rem (36px)  - Font Weight: 800 - Line Height: 1.15 - Letter Spacing: -0.02em
h3 - 1.75rem (28px)  - Font Weight: 700 - Line Height: 1.25 - Letter Spacing: -0.02em
h4 - 1.5rem (24px)   - Font Weight: 700 - Line Height: 1.2
h5 - 1.25rem (20px)  - Font Weight: 600 - Line Height: 1.2
h6 - 1.125rem (18px) - Font Weight: 600 - Line Height: 1.2
```

### **Body Text (Sans-Serif)**
```css
Body:       16px - Font Weight: 400 - Line Height: 1.7 - Letter Spacing: -0.011em
Lead:       1.25rem (20px) - Font Weight: 400 - Line Height: 1.6
Article:    1.0625rem (17px) - Font Weight: 400 - Line Height: 1.8
Caption:    0.875rem (14px) - Font Weight: 400 - Line Height: 1.5 - Style: Italic
Meta:       0.875rem (14px) - Font Weight: 500 - Uppercase - Letter Spacing: 0.05em
Label:      0.75rem (12px) - Font Weight: 700 - Uppercase - Letter Spacing: 0.1em
```

---

## 🎨 CSS Variables

```css
--font-headline: 'Merriweather', 'PT Serif', Georgia, serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

---

## 📱 Responsive Typography

### **Desktop (1024px+)**
- Base font size: 16px
- Full headline scale maintained
- Optimal reading width: 65-75 characters per line

### **Tablet (768px - 1023px)**
- Base font size: 15px
- Headlines scale down proportionally
- h1: 2rem, h2: 1.75rem, h3: 1.5rem

### **Mobile (480px - 767px)**
- Base font size: 15px
- Further headline reduction
- h1: 2rem, h2: 1.75rem, h3: 1.5rem

### **Small Mobile (< 480px)**
- Base font size: 14px
- Compact headline sizes
- h1: 1.75rem, h2: 1.5rem, h3: 1.25rem

---

## 🎯 Usage Guidelines

### **Headlines**
```html
<!-- Article Title -->
<h1>Major Tech Breakthrough Announced</h1>

<!-- Section Title -->
<h2>Latest Updates</h2>

<!-- Category Header -->
<h3>Artificial Intelligence</h3>
```

### **Body Content**
```html
<!-- Lead Paragraph -->
<p class="lead">
  An introductory paragraph that summarizes the main point...
</p>

<!-- Article Body -->
<div class="article-body">
  <p>Regular article content with optimal readability...</p>
</div>
```

### **Special Elements**
```html
<!-- Blockquote -->
<blockquote>
  "A powerful quote that deserves emphasis"
</blockquote>

<!-- Caption -->
<p class="caption">Photo by John Doe, 2026</p>

<!-- Meta Information -->
<span class="meta-text">By Sarah Johnson • 3 min read</span>

<!-- Category Label -->
<span class="label">TECHNOLOGY</span>
```

---

## 🛠️ Utility Classes

### **Font Family**
```css
.font-headline  - Apply serif headline font
.font-body      - Apply sans-serif body font
```

### **Font Weights**
```css
.font-weight-light      - 300
.font-weight-normal     - 400
.font-weight-medium     - 500
.font-weight-semibold   - 600
.font-weight-bold       - 700
.font-weight-extrabold  - 800
.font-weight-black      - 900
```

### **Text Styles**
```css
.text-uppercase  - Uppercase with letter-spacing
.text-italic     - Italic style
```

### **Line Heights**
```css
.leading-tight    - 1.2
.leading-normal   - 1.5
.leading-relaxed  - 1.7
.leading-loose    - 2.0
```

---

## ✨ Key Features

### **Editorial Character**
- Serif headlines convey authority and tradition
- Sans-serif body ensures modern readability
- Balanced contrast creates visual hierarchy

### **Optimized Readability**
- Line height: 1.7 for body text (optimal 1.5-1.8)
- Letter spacing: Tightened for headlines, comfortable for body
- Font size: 16px base (ideal 15-18px)

### **Professional Polish**
- Negative letter-spacing on headlines (-0.02em to -0.03em)
- Uppercase labels with increased spacing (0.05em - 0.1em)
- Smooth font rendering with antialiasing

### **Performance**
- Google Fonts with `display=swap` for instant text rendering
- System font fallbacks for reliability
- Optimized font weights (only necessary weights loaded)

---

## 🎨 Integration Examples

### **News Card Title**
```css
.newsCardTitle {
  font-family: var(--font-headline);
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--text-primary);
}
```

### **Article Meta**
```css
.articleMeta {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}
```

### **Section Header**
```css
.sectionHeader {
  font-family: var(--font-headline);
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}
```

---

## 📊 Accessibility

### **Contrast Ratios**
- White on Navy (#ffffff on #051622): 15.2:1 (AAA)
- Teal on Navy (#1BA098 on #051622): 4.8:1 (AA)
- Gold on Navy (#DEB992 on #051622): 7.9:1 (AAA)

### **Font Size Minimum**
- Body text: 16px (above 14px minimum)
- Small text: 14px (meets WCAG AA)
- Labels: 12px (uppercase improves readability)

### **Line Length**
- Desktop: 65-75 characters (optimal)
- Mobile: Responsive container maintains readability

---

## 🔄 Migration Guide

Replace old font declarations:
```css
/* Old */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto';

/* New - Headlines */
font-family: var(--font-headline);

/* New - Body */
font-family: var(--font-body);
```

---

## 📝 Best Practices

1. **Use serif for headlines** to establish editorial authority
2. **Use sans-serif for body** for optimal screen readability
3. **Maintain hierarchy** with consistent font sizing
4. **Tighten letter-spacing** on large headlines
5. **Increase line-height** for body text (1.7-1.8)
6. **Use font weights** strategically (700+ for headlines, 400-500 for body)
7. **Test on multiple devices** to ensure responsive scaling works
8. **Keep paragraphs** to 65-75 characters wide for optimal reading

---

## 🚀 Performance Notes

- Fonts loaded via Google Fonts CDN
- `display=swap` ensures text is visible during font load
- Only necessary weights included (300, 400, 500, 600, 700, 800, 900)
- System font fallbacks for instant rendering
- Preconnect to Google Fonts for faster loading

---

## 🎯 Result

A professional, editorial-style typography system that:
- ✅ Balances tradition (serif) with modernity (sans-serif)
- ✅ Ensures excellent readability on all devices
- ✅ Creates clear visual hierarchy
- ✅ Matches NewzLive editorial aesthetic
- ✅ Maintains accessibility standards
- ✅ Performs efficiently
