# EasyTravel Frontend - Copilot Instructions

## Project Overview
**EasyTravel** is a React 19 + Vite travel booking platform with tours, hotels, and blogs. Multi-language support (EN/VI), role-based access (tourists, tour guides, hotel managers, admins), and integrates with a backend REST API at `http://localhost:8080`.

## Architecture

### Core Structure
- **`src/pages/`**: Top-level page routes (Home, Tour, Hotel, Blog, Profile, Admin, HotelManager, TourGuide)
- **`src/components/pages/`**: Composable page sections grouped by feature (Home/, Booking/, DetailTour/, etc.)
- **`src/components/layout/`**: Header and Footer wrapping all pages
- **`src/apis/`**: API functions (AccountAPI, Tour, Hotel, Room, Blog, Booking, Home)
- **`src/contexts/`**: LangContext for i18n and language state
- **`src/i18n/`**: Translation dictionaries (dict.en.js, dict.vi.js) with nested key structure

### Data Flow Patterns
1. **API→State→Component**: Pages fetch via API functions → useState hooks → pass to sub-components
2. **Context for i18n**: LangProvider wraps all routes in App.jsx. Use `const { t } = useLang()` to translate
3. **JWT Authentication**: Stored in localStorage as "jwt". Read via `getToken()` and `getUserFromToken()` from utils/auth.js
4. **Event Listeners**: JWT changes trigger `window.dispatchEvent(new Event("jwt-changed"))` for Header sync

### Key Integration Points

#### Authentication Flow
- Login/Signup modals in Header dispatch to app state: `onOpenLogin()`, `onOpenSignup()`
- Tokens stored as "jwt" in localStorage; APIs read via `Authorization: Bearer ${token}`
- Account detail endpoint requires token; throws `NO_TOKEN` error code if missing
- Role detection: decode JWT payload with `getUserFromToken()` to check roles (admin, hotel_manager, tour_guide)

#### API Response Format
Backend uses HATEOAS pattern:
```javascript
// Example: getPopularHotels() returns:
{ _embedded: { hotels: [...], tours: [...], blogs: [...] } }
// Access via: data?._embedded?.hotels || []
```

#### Multi-Language Pattern
```javascript
// Use keys with dot notation: "home.hero.title", "header.login"
// LangContext.t() falls back to English if translation missing
const { lang, t } = useLang();
// Change language: call setLang("vi") or setLang("en")
// Auto-saved to localStorage["lang"]
```

#### Date Handling
- Use `react-datepicker` for date inputs (see BookingStep1.jsx)
- Date strings from API are ISO format: `"2025-01-15T10:00:00"`
- Parse with `new Date()` and format with `date.split("T")[0]` for display
- Track disabled/booked dates via API (getRoomBookedDates)

#### Image Paths
- Local images: `/images/category/filename` (public/ folder)
- AWS S3: `https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/[bucket]`
- Image buckets in use: `/room`, `/tour`, `/hotel`, `/blog`, etc.
- Always use fallback for broken images

#### Currency Formatting
```javascript
// Vietnamese Dong (₫)
const formatVND = (n) => `${Number(n || 0).toLocaleString("vi-VN")}₫`;
// Use in price displays across tours, hotels, bookings
```

## Code Conventions

### Component Structure
- Functional components with hooks (React 19)
- Page components: `export function PageName()` or `export default function`
- Sub-components: destructure props, no default exports unless single-purpose
- State management: useState for local, LangContext for global language, APIs for server state

### Styling
- **Tailwind CSS** for all styling (primary: #007AFF, secondary: #FFC107)
- Custom fonts: "poppins" (default) and "podcast" from tailwind.config.js
- CSS files in `src/assets/styles/` for shared styles (Footer.css, Header.css)
- Hover effects: `hover:text-orange-500`, `hover:scale-[1.02]`, `transition-transform duration-300`
- Responsive: `md:` prefix for tablets/desktop, mobile-first design

### API Function Patterns
```javascript
// Location: src/apis/[Feature].jsx
export async function fetchData(params) {
  try {
    const res = await fetch(`${API_BASE}/endpoint`, options);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    // Transform and validate
    return data?._embedded?.items || [];
  } catch (error) {
    console.error("Lỗi API: fetchData", error);
    throw error;
  }
}
```
- Always include try-catch
- Check `res.ok` before parsing JSON
- Return empty arrays for missing data to prevent map() errors
- Use destructuring with fallback: `data?._embedded?.resources || []`

### File Naming
- Pages: PascalCase.jsx (Home.jsx, HotelDetail.jsx)
- Components: PascalCase.jsx (BlogCard.jsx, BookingStep1.jsx)
- API files: FeatureName.jsx (Tour.jsx, AccountAPI.jsx, Booking.jsx)
- Utils: camelCase.js (auth.js, formatPrice.js, formatter.js)
- Contexts: FeatureContext.jsx (LangContext.jsx)

### Key Utility Functions
- **`getToken()`**: Read JWT from localStorage["jwt"]
- **`getUserFromToken()`**: Decode JWT payload to get user object with roles
- **`useLang()`**: Hook to access `{ lang, setLang, t }` from LangContext
- **`formatPrice()`, `formatter.js`**: Utility functions (check implementations before using)

## Development Workflows

### Build & Run
```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (HMR enabled, auto-refresh)
npm run build        # Production build to dist/
npm run lint         # ESLint check (eslint .)
npm run preview      # Preview production build
```

### Backend Requirements
- Backend must be running at `http://localhost:8080`
- All API URLs hardcoded in api files (no .env support currently)
- Common endpoints: `/hotels`, `/tours`, `/blogs`, `/account/*`, `/booking/*`, `/room/*`

### Hot Module Replacement (HMR)
- Vite auto-refreshes on file save
- React Fast Refresh preserves component state
- If issues, restart dev server: `npm run dev`

## Common Task Patterns

### Adding a New Feature Page
1. Create `src/pages/FeatureName.jsx` - fetch data in useEffect, render sections
2. Create `src/components/pages/FeatureName/` - one component per section
3. Add route to `App.jsx`: `<Route path="/feature-name" element={<FeatureName />} />`
4. Add translation keys to `src/i18n/dict.*.js` with nested structure
5. Add navigation link to Header (src/components/layout/Header.jsx)

### Adding API Integration
1. Export function in `src/apis/Feature.jsx` following error handling pattern
2. Call in page component within useEffect with dependency array
3. Handle loading/error states with useState
4. Transform API response before display (arrays from _embedded, date formatting, image paths)

### Adding Multi-Language Support
1. Add keys to both dict.en.js and dict.vi.js with same structure
2. Import and use: `const { t } = useLang()`
3. Call translator: `t("section.subsection.key")`
4. Verify fallback: if VI key missing, uses EN version automatically

### Handling Authentication
1. Check token on mount: `const token = getToken(); if (!token) navigate("/login")`
2. API calls include: `Authorization: Bearer ${token}` header
3. Handle 401 responses: clear JWT and redirect to login
4. Listen for auth changes: `window.addEventListener("jwt-changed", callback)`

## Important Notes

### Do NOT
- Modify API base URLs in code (request backend team to change base config)
- Create TypeScript files (project is JSX only, no TS)
- Use external state management (Redux, Zustand) - stick to hooks + context
- Hardcode environment values - all config at top of API files
- Ignore accessibility - test with keyboard and screen reader

### Must Do
- Always provide fallback UI while data loads (loading spinner or skeleton)
- Validate user role before showing admin/manager pages (check JWT payload)
- Test multi-language by toggling language switcher in Header
- Preserve JWT across page refreshes (stored in localStorage)
- Handle API errors gracefully with user-friendly messages in Vietnamese + English

### Translation Key Structure Example
```javascript
// dict.en.js
export const en = {
  header: { login: "Login", logout: "Log out" },
  home: { hero: { title: "Welcome", subtitle: "..." } },
};
// Access: t("header.login") → "Login"
```

## Debugging Tips
- Check browser localStorage for "jwt" and "lang" values
- Network tab: verify API base URL is correct, inspect Authorization header
- React DevTools: inspect LangContext value, confirm language changes
- Console: API errors logged with "Lỗi API: [function name]"
- Test with both languages to catch missing translation keys
