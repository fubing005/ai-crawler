---
title: "Design Direction Overview"
author: "Shalabing"
date: "2026-04-30"
project: "vscode_bmad_method_test"
---

# Design Direction Overview

**AI-Powered Universal Crawler Framework**

---

## Executive Summary

This document presents the comprehensive design direction for the AI-powered universal crawler framework. The design philosophy centers on making data extraction as simple as using a search engine, while providing powerful capabilities for advanced users through progressive disclosure.

### Core Value Proposition

> "Input URL → AI Analysis → Get Data"

No code required. AI automatically learns page structure, identifies data fields, and extracts structured information. Local deployment ensures data privacy and compliance.

---

## Design Philosophy

### The "Aha!" Moment

When users first successfully crawl a new website, they should feel:

> **"This is too simple! I used to spend hours, now it takes seconds."**

This moment of surprise and efficiency is the core differentiator from traditional tools like Scrapy or Puppeteer.

### Emotional Journey

| Stage | User Feeling | Design Response |
|-------|-------------|-----------------|
| **Discovery** | Curiosity & Expectation | Clear onboarding, simple installation |
| **First Use** | Surprise & Clarity | Fast AI analysis, intuitive field preview |
| **In Progress** | Control & Understanding | Real-time progress, transparent AI process |
| **Completion** | Achievement & Efficiency | Success celebration, data statistics |
| **Error** | Safety (not frustration) | Friendly errors, actionable solutions |
| **Offline** | Continuity | Offline mode, local data access |
| **Mistake** | Relief | Undo/redo, recovery mechanisms |

---

## Core Design Principles

### 1. Zero-Code First

**Principle:** Core value requires no programming. All major functions should be mouse-clickable. Code/CLI/API are advanced options for developers.

**Implementation:**
- Default interface: Simple URL input → AI analysis → Results
- Advanced features: Hidden behind "Expert Mode" toggle
- CLI/API: Available but not required for basic use

### 2. AI Transparency

**Principle:** Don't hide AI limitations. Let users understand what AI is doing, confidence levels, and why it makes certain judgments.

**Implementation:**
- Real-time progress display during analysis
- Field confidence indicators (e.g., 95%)
- Preview panel with inline editing
- Detailed task logs

### 3. Progressive Capability

**Principle:** Start simple, reveal advanced features when needed. Support three user types with adaptive interfaces.

**User Types:**
- **Non-technical analysts:** Basic crawling and simple export
- **Data engineers:** Scheduling, integration, quality monitoring
- **Developers:** CLI, API, SDK, advanced configuration

### 4. Instant Feedback = Trust

**Principle:** Clear progress, status updates, and error explanations. Users always know what's happening.

**Implementation:**
- Progress bars with percentage
- Status icons with clear meaning
- Real-time preview panels
- Friendly error messages with actionable steps

### 5. First Experience = Success

**Principle:** 80% of users should successfully crawl at least one website within their first week.

**Implementation:**
- Clear first-time wizard
- Example URLs for quick testing
- Minimal configuration friction
- "Quick Start" mode to skip advanced setup

---

## Three-Tier View Strategy

### Overview

The application provides three distinct views to serve different user types and use cases. Users can freely switch between views, and their preference is remembered.

### View 1: Simple View (Default)

**Design Foundation:** Clean Focus Style

**Target Users:**
- First-time users
- Non-technical users (data analysts, market researchers)
- Zero-code experience scenarios

**Interface Characteristics:**
- Large centered search box (search engine-like)
- 2-3 example URLs for quick testing
- Collapsible left sidebar (expands on hover)
- Minimal distractions, only core features visible

**Key Experience:**
- Zero-code experience, "as simple as a search engine"
- Maximized "aha moment" impact
- 80% user success rate in first week

**Visual Layout:**
```
┌─────────────────────────────────────────┐
│  [Logo]  [View Switcher]  [Settings]    │
├─────────────────────────────────────────┤
│                                         │
│         ┌─────────────────┐             │
│         │  Enter URL      │             │
│         └─────────────────┘             │
│                                         │
│    Example: amazon.com/product/123     │
│    Example: news.example.com/article   │
│                                         │
│         [Start Crawling]                │
│                                         │
└─────────────────────────────────────────┘
```

### View 2: Dashboard View

**Design Foundation:** Card Dashboard Style

**Target Users:**
- Data engineers
- Experienced users
- Users needing monitoring and preview

**Interface Characteristics:**
- Card layout with statistics (total crawls, success rate, active tasks, data entries)
- Recent task list with status and progress
- Quick actions: New task, Import config, View docs
- Expanded left sidebar

**Key Experience:**
- Data transparency: Real-time status and statistics
- Task monitoring: View all running and completed tasks
- Quick access: One-click access to common functions

**Visual Layout:**
```
┌────┬─────────────────────────────────────┐
│Nav │  Statistics Cards                   │
│    │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│    │  │ 123 │ │ 98% │ │  5  │ │ 10K │   │
│    │  └─────┘ └─────┘ └─────┘ └─────┘   │
│    │                                     │
│    │  Recent Tasks                       │
│    │  ┌─────────────────────────────┐   │
│    │  │ Task 1 | Running | 45%      │   │
│    │  │ Task 2 | Complete | 100%    │   │
│    │  └─────────────────────────────┘   │
└────┴─────────────────────────────────────┘
```

### View 3: Professional View

**Design Foundation:** Compact Professional Style

**Target Users:**
- Developers
- Advanced users
- Users needing precise control and batch operations

**Interface Characteristics:**
- High-density information display
- Toolbar for quick access
- Detailed configuration panel (AI model, crawl settings, data output)
- Data table with sorting and filtering
- Expanded left sidebar + top toolbar

**Key Experience:**
- Efficiency first: More information per screen
- Batch operations: Support batch crawling and export
- Detailed configuration: All options visible, minimal clicks

**Visual Layout:**
```
┌─────────────────────────────────────────┐
│ [Toolbar] [Filter] [Export] [Settings]  │
├────┬─────────────────────────────────────┤
│Nav │  Configuration Panel                │
│    │  ┌─────────────────────────────┐   │
│    │  │ AI Model: [Dropdown]        │   │
│    │  │ Crawl Settings: [Config]    │   │
│    │  │ Data Output: [Format]       │   │
│    │  └─────────────────────────────┘   │
│    │                                     │
│    │  Task Table                         │
│    │  ┌─────────────────────────────┐   │
│    │  │ ID | URL | Status | Actions │   │
│    │  │  1 | ... | ...  | [Edit]   │   │
│    │  └─────────────────────────────┘   │
└────┴─────────────────────────────────────┘
```

### View Switching Mechanism

**Switching Method:**
- View switcher at top of left sidebar
- Free switching between all three views
- User preference remembered

**Switching Timing:**
- After first-time wizard completion, prompt user to choose default view
- Users can switch views at any time
- Optional automatic view recommendation based on user behavior

**View Persistence:**
- Save user view preference
- Automatically load last selected view on next startup

---

## Visual Design System

### Color Palette

**Theme:** Blue Technology Theme

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary** | Tech Blue | `#3B82F6` | Main action buttons, input focus |
| **Secondary** | Indigo | `#6366F1` | Secondary actions, navigation selected |
| **Warning** | Amber | `#F59E0B` | Warning states |
| **Error** | Red | `#EF4444` | Error states |
| **Success** | Green | `#10B981` | Success states |

**Theme Variables:**
- Primary background: Primary color at 5% opacity
- Secondary background: Primary color at 10% opacity (hover)
- Text color: `#FFFFFF` (light mode)
- Text color (dark mode): `#1A1A1A` (dark gray)
- Border color: Primary color at 10% opacity
- Divider: Primary color at 15% opacity
- Shadow color: Primary color at 20% opacity

### Typography System

**Font Family:** Inter / system-ui (built-in fonts)

| Scale | Size | Line Height | Usage |
|-------|------|-------------|-------|
| **Heading-1** | 2rem (32px) | 1.5 | Page titles |
| **Heading-2** | 1.75rem (28px) | 1.5 | Section titles |
| **Heading-3** | 1.5rem (24px) | 1.5 | Subsection titles |
| **Body-1** | 1rem (16px) | 1.5 | Body text |
| **Body-2** | 0.875rem (14px) | 1.5 | Secondary text |
| **Caption** | 0.875rem (14px) | 1.5 | Captions, labels |

### Spacing System

**Base Unit:** 4px

| Token | Size | Usage |
|-------|------|-------|
| **XXS** | 4px | Tight spacing |
| **XS** | 8px | Small gaps |
| **S** | 12px | Compact spacing |
| **M** | 16px | Default spacing |
| **L** | 20px | Comfortable spacing |
| **XL** | 24px | Large spacing |
| **XXL** | 32px | Extra large spacing |

### Visual Hierarchy

**Color Semantics:**
- **Primary:** Main action buttons, input focus
- **Secondary:** Secondary actions, navigation selected
- **Accent:** Important hints, success states
- **Success/Warning/Error:** Status indicators

**Spacing Hierarchy:**
- 4px base unit
- space-2 (8px) ~ space-32 (128px) range

**Typography Hierarchy:**
- Heading-1~3 for titles
- Body-1~2 for content
- Caption for labels

---

## Component Strategy

### Component Library: Naive UI

**Why Naive UI?**
- Vue 3 Composition API native
- Comprehensive component set
- Excellent TypeScript support
- Built-in dark mode
- Strong accessibility support

### Custom Component Extensions

**1. Crawl Progress Component**
- Base: Naive UI Progress
- Extensions: Crawl-specific states and animations via slots
- Future extensions: Pause, resume, cancel operations

**2. AI Analysis Preview Component**
- Base: Naive UI Card and List
- Extensions: Field highlighting and confidence indicators via slots
- Future extensions: Multi-field selection, field relationship visualization

**3. Data Preview Component**
- Base: Naive UI Table
- Extensions: Sorting, filtering, export operations via slots
- Future extensions: Batch editing, data merging

### Performance Optimization

**Virtual Scrolling:**
```vue
<n-data-table
  :data="largeData"
  :max-height="600"
  :virtual-scroll="true"
  :row-props="rowProps"
/>
```

**Large Dataset Handling:**
- Pagination to reduce single render count
- Virtual scrolling for ultra-large datasets
- Avoid complex calculations in Table render functions
- Use computed to cache calculation results

### Light/Dark Mode

**Theme Switching:**
```vue
<n-config-provider
  :theme="darkTheme ? darkTheme : null"
  :theme-overrides="themeOverrides"
>
  <n-layout>
    <!-- App content -->
  </n-layout>
</n-config-provider>
```

**Dark Mode Optimization:**
- Ensure contrast meets WCAG 2.1 AA standards
- All status icons clearly visible in dark mode
- Focus indicators clear in both modes

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

**Contrast Standards:**
- All text meets minimum contrast ratios
- Interactive elements have clear focus states
- Color not used as sole indicator

**Keyboard Navigation:**
- All interactive elements support keyboard navigation
- Clear focus indicators (`:focus-visible`)
- Logical tab order

**ARIA Labels:**
- Complete ARIA support for screen readers
- Semantic HTML structure
- Descriptive labels for all controls

**Screen Reader Support:**
- All icons have text alternatives
- Dynamic content updates announced
- Error messages accessible

---

## First-Time Experience

### Onboarding Flow

**Step 1: Welcome Page**
- Explain core product features
- Outline setup steps

**Step 2: Configure AI Model**
- Choose local (Ollama) or cloud model provider
- Clear guidance for each option

**Step 3: Enter URL**
- Use example URLs or enter own URL
- Quick testing capability

**Step 4: Select Fields**
- AI identifies fields
- User selects fields to extract

**Step 5: Preview Results**
- View extracted results
- Correct if needed

**Step 6: Completion**
- Successfully complete first crawl
- Celebration animation

### Post-Onboarding

**Celebration Animation:**
> "You just successfully crawled X data items!"

**Next Steps:**
- Prompt user to choose view mode (Simple/Standard/Professional)
- Quick start options: Continue crawling, View docs, View history

---

## AI Transparency Implementation

### Shared Transparency Features (All Views)

**1. Real-Time Progress Display**
- AI analysis page structure progress
- Data extraction progress (X/Y items extracted)
- Estimated remaining time

**2. Field Preview and Confidence**
- Display AI-identified field list
- Show confidence for each field (e.g., 95%)
- Support field preview (show identified values)

**3. Real-Time Preview Panel**
- Center area shows preview panel
- Real-time updates of AI recognition results
- Support inline editing and correction

**4. Task Logs**
- Display detailed execution logs
- Record AI model selection and switching events
- Record user manual adjustments

---

## Key Success Moments

### User Realizes "This is Better"

- First URL input, AI analyzes page structure in seconds
- Seeing accurately identified data fields (product name, price, stock, etc.)
- Successfully crawling complete data without any configuration
- Comparing hours of traditional crawler development to seconds here
- Seeing CLI and API can automate entire workflow

### User Feels Success or Completion

- Clicking "Start Crawling" and seeing progress bar reach 100%
- Opening exported JSON/CSV/Excel file with complete, structured data
- Seeing successful records and statistics in crawl history
- First website redesign and crawler still works (AI adaptive success)
- Batch crawling multiple websites, all tasks complete successfully
- Successfully automating batch tasks via CLI or API

### Interactions That Would Break Experience

- AI analysis fails without clear reason and solution suggestions
- Error during crawling, user cannot continue or retry current task
- Data export fails or format error
- First use without any guidance, don't know where to start
- Encountering errors with only technical terms, no actionable guidance

### Success Flow

```
Open App → First Wizard (Select AI Model) → Enter URL
→ AI Analysis (3-5 seconds) → Preview Identified Fields
→ Correct Fields (if needed) → Start Crawling
→ Real-Time Progress View → View Results → Export Data
```

### Failure Flow

```
Open App → No Guidance → Enter URL → AI Analysis Fails
→ Vague Error Message → User Feels Frustrated → Give Up
```

---

## Design Rationale

### Why Three-Tier View Strategy?

**1. Serve All User Types**
- Non-technical users: Simple view, zero-code experience
- Data engineers: Dashboard view, monitoring and preview
- Developers: Professional view, precise control and batch operations

**2. Balance Simplicity and Functionality**
- Default simple, reduce first-use friction
- Advanced features accessible via switching
- Users can choose most suitable view based on needs

**3. Support Progressive Capability**
- Users start with simple view
- As experience grows, can switch to more advanced views
- Interface adapts to user skill level

**4. Solve Core Design Challenges**
- Progressive complexity: Three views serve different skill levels
- AI uncertainty visualization: All views have transparency features
- "Black box" trust issue: Real-time preview and confidence display build trust

**5. Align with Core Experience Principles**
- Zero-code first: Simple view maximizes zero-code experience
- AI transparency: All views share transparency features
- Progressive capability: Three views support progressive capability
- First experience success: First-time wizard + simple view

---

## Implementation Approach

### Technical Implementation

**1. View Component Architecture**
- Create three independent view components (SimpleView, DashboardView, ProfessionalView)
- Share core components (navigation bar, preview panel, progress indicator)
- Use state management to store user view preference

**2. State Management**
- Pinia stores for view preference
- Local storage for persistence
- Reactive view switching

**3. Component Reusability**
- Extract common UI patterns
- Create shared layout components
- Implement consistent interaction patterns

**4. Responsive Design**
- Three breakpoints: 1024px, 1280px, 1440px
- Adaptive layouts for different screen sizes
- Mobile-first approach

---

## Design Tokens Reference

### Color Tokens

```css
--color-primary: #3B82F6;
--color-secondary: #6366F1;
--color-warning: #F59E0B;
--color-error: #EF4444;
--color-success: #10B981;

--color-primary-bg: rgba(59, 130, 246, 0.05);
--color-secondary-bg: rgba(99, 102, 241, 0.1);
--color-text: #FFFFFF;
--color-text-dark: #1A1A1A;
--color-border: rgba(59, 130, 246, 0.1);
--color-divider: rgba(59, 130, 246, 0.15);
--color-shadow: rgba(59, 130, 246, 0.2);
```

### Typography Tokens

```css
--font-family: 'Inter', system-ui, sans-serif;

--font-size-h1: 2rem;
--font-size-h2: 1.75rem;
--font-size-h3: 1.5rem;
--font-size-body-1: 1rem;
--font-size-body-2: 0.875rem;
--font-size-caption: 0.875rem;

--line-height-tight: 1.5;
```

### Spacing Tokens

```css
--space-xxs: 4px;
--space-xs: 8px;
--space-s: 12px;
--space-m: 16px;
--space-l: 20px;
--space-xl: 24px;
--space-xxl: 32px;
```

---

## Conclusion

This design direction establishes a clear foundation for building an AI-powered universal crawler framework that is:

- **Simple** for non-technical users (zero-code experience)
- **Powerful** for developers (CLI, API, advanced configuration)
- **Transparent** in AI operations (real-time progress, confidence indicators)
- **Adaptive** to user skill levels (three-tier view strategy)
- **Accessible** to all users (WCAG 2.1 AA compliance)
- **Delightful** to use (emotional design, celebration moments)

The three-tier view strategy, combined with progressive disclosure and AI transparency, creates an experience that scales from first-time users to power developers while maintaining simplicity and clarity at every level.

---

**Document Version:** 1.0
**Last Updated:** 2026-04-30
**Author:** Shalabing
**Project:** vscode_bmad_method_test
