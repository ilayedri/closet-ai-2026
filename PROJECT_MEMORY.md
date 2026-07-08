# ClosetAI Project Memory

Last updated: 2026-07-08

## 1) Current Project Status

ClosetAI is in an advanced MVP foundation stage with a live production deployment and a clear luxury-brand product direction.

Current state:
- Core web experience is implemented and running in production.
- Bilingual UX (Hebrew/English) with RTL/LTR behavior is implemented.
- Core product routes and navigation are implemented and connected.
- Smart Closet foundation is implemented with meaningful user actions.
- Local-first data persistence and style intelligence preparation are implemented.
- AI-heavy capabilities (recognition, weather intelligence, try-on) are planned but not fully integrated yet.

## 2) What Has Already Been Built

### Design
- Luxury black and gold visual language across core pages.
- Premium editorial/polished tone in UI copy.
- Strong hero-first storytelling on the homepage.
- Consistent high-contrast dark experience with gold highlights and glass/surface layering.

### Pages
Implemented page set (Next.js pages router):
- Home: `/`
- Dashboard: `/dashboard`
- Closet: `/closet`
- Closet category details: `/closet/[category]`
- Add item: `/add-item`
- AI Stylist: `/stylist` and companion `/ai-stylist`
- Outfits: `/outfits`
- Profile: `/profile`
- Language selection: `/language`
- Onboarding flow: `/onboarding/*`

### Navigation
- Global top header navigation with route highlighting.
- Primary nav includes Home, My Closet, AI Stylist, Outfits, Profile.
- Dashboard CTA is always accessible from the header.
- Closet and stylist route mapping handles related paths correctly.

### Components
Shared and reusable UI building blocks are established:
- Header and language selector
- Button/Card/Modal families
- Clothing item presentation components
- Theming helpers (`themed-text`, `themed-view`)
- Web/mobile utility components (`app-tabs`, `web-badge`, `external-link`, `hint-row`)

### Features
- Bilingual copy system with centralized content source.
- RTL/LTR direction handling based on selected language.
- Smart closet category system with per-category counts.
- Add-item flow with image upload prep and image preview.
- Season metadata capture for wardrobe items.
- Outfit save and history capture signals.
- Initial style intelligence snapshot generation from user behavior.

## 3) Current Architecture and File Structure

### Technical Stack
- UI/runtime: React + Next.js (Pages Router) for production web deployment.
- Multi-platform baseline: Expo dependencies retained for broader app strategy.
- Language: TypeScript (strict mode).
- Storage (current): browser localStorage (local-first architecture).
- Deployment: Vercel production.

### Architecture Overview
- `src/pages/*`: Route-level page logic and UX flows.
- `src/components/*`: Shared presentation and reusable UI components.
- `src/context/LanguageContext.tsx`: Global language state and RTL/LTR synchronization.
- `src/lib/site-copy.ts`: Centralized bilingual product copy and labels.
- `src/lib/data-model.ts`: Typed domain schema for profile/wardrobe/outfits/intelligence.
- `src/lib/style-intelligence.ts`: Local persistence + style intelligence recomputation logic.
- `src/lib/closet.ts`: Closet categories, item handling, and category count helpers.
- `styles/globals.css` + page-level `*.module.css`: Global and route-scoped styles.

### Structure Snapshot (high-level)
- `src/pages`: user-facing routes and workflows
- `src/components`: reusable UI system blocks
- `src/context`: global app context providers
- `src/lib`: business/domain logic and data services
- `styles`: global style foundation
- `assets` and `public`: static brand and visual assets
- `scripts`: project utility scripts

## 4) Important Design Decisions (Must Preserve)

### Luxury Black and Gold Style
- Black-first visual base with gold accent hierarchy.
- High-contrast premium look and elevated spacing/typography rhythm.
- Surfaces use depth (gradients, glow, subtle glass effects) rather than flat default UI.

### Premium Fashion Experience
- Product tone is aspirational, polished, and fashion-forward.
- UX should feel curated and intentional, not generic utility UI.
- Messaging must frame ClosetAI as a personal fashion intelligence product, not only a closet tracker.

### Closet Background Identity
- Closet visual identity is a key brand signal.
- Hero/closet background treatment should keep a distinct luxury fashion atmosphere.
- Background identity must remain coherent across core pages and should not regress to plain template styling.

## 5) Features Completed

- Live web application with multi-route user journey.
- Header-driven navigation and active-route behavior.
- Hebrew/English localization with persistent language selection.
- RTL/LTR rendering behavior integration.
- Smart Closet base with categories and counts.
- Add-item UX with image upload preparation and preview.
- Seasonal tagging for wardrobe items.
- Local data bundle structure (profile, wardrobe, outfit history, intelligence).
- Style intelligence snapshot generation from recorded user interactions.
- Profile intelligence section displaying learning readiness signals.

## 6) Features Currently Being Developed

### Smart Closet
In progress focus:
- Deepening closet intelligence beyond static listing (relationship and recommendation readiness).
- Expanding item metadata quality and usage signals.

### Photo Upload Preparation
In progress focus:
- Current upload flow and preview are implemented as preparation.
- Camera/recognition pipeline is prepared in UX but not fully integrated.

### Data Storage Preparation
In progress focus:
- Strong typed local data model and services are implemented.
- Architecture is intentionally prepared for future backend/auth/database migration.

## 7) Things That Must NOT Be Changed or Removed

These are hard constraints for future work unless explicitly re-approved:

1. Existing working features must not be broken or removed.
2. Current luxury design direction (black/gold premium identity) must be preserved.
3. Current navigation structure and route hierarchy must remain stable.
4. Bilingual + RTL/LTR behavior must remain fully supported.
5. Smart Closet foundation flows already working in production must remain intact.

## 8) Future Roadmap

### AI Stylist
- Move from foundational recommendations toward richer context-aware personalized styling.
- Improve recommendation quality using historical outfit and closet behavior.

### Weather Intelligence
- Integrate weather data into outfit generation logic.
- Use temperature/conditions as first-class recommendation constraints.

### User Style Learning
- Expand behavior-based learning from feedback and outfit history.
- Improve inferred style profile accuracy over time.

### Virtual Try-On
- Add try-on simulation capability as a premium feature layer.
- Align with wardrobe item recognition and fit visualization strategy.

### Database Integration
- Migrate local-first models to cloud-backed persistent storage.
- Add authentication/user identity and cross-device synchronization.
- Keep existing typed contracts as migration anchors.

---

## Working Rule for Future Contributors

When adding new features:
- Extend the existing architecture, do not rewrite it.
- Keep premium brand consistency in copy and UI decisions.
- Maintain route and navigation continuity.
- Preserve currently working behavior before introducing new complexity.
- Ship incrementally with production validation after meaningful changes.
