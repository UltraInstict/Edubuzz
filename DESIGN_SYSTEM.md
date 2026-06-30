# Edubuzz Design System

## Palette

| Role | Tailwind Class |
|---|---|
| Primary CTA / links / active | `green-800` (#166534) |
| Primary hover | `green-900` (#14532d) |
| Primary light (badges, tags) | `green-50` bg + `green-800` text |
| Borders — ALL borders | `gray-200` (#e5e7eb) |
| Text primary | `gray-900` (#111827) |
| Text secondary | `gray-600` (#6b7280) |
| Text muted | `gray-500` (#9ca3af) |
| Page background | `white` (cards) / `gray-50` (section bgs, ad slots) |
| Success / active badge | `green-50` bg + `green-800` text |
| Warning / pending badge | `amber-50` bg + `amber-800` text |
| Error badge | `red-50` bg + `red-800` text |
| Info badge | `blue-50` bg + `blue-800` text |

No `bg-brand`, `text-muted`, `border-border` aliases. Use standard Tailwind classes directly.

## Components

### Primary Button
```
bg-green-800 text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-green-900 transition-colors
```

### Secondary Button
```
border border-green-800 text-green-800 text-sm font-medium px-5 py-2.5 rounded-md hover:bg-green-50 transition-colors
```

### Card
```
bg-white border border-gray-200 rounded-md p-5
```

### Input / Select / Textarea
```
w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-800
```

### Label
```
block text-sm font-medium text-gray-700 mb-1
```

### Page Container (wide)
```
max-w-6xl mx-auto px-4 py-8
```

### Page Container (narrow)
```
max-w-2xl mx-auto px-4 py-10
```

### Badge / Tag (green)
```
inline-flex items-center px-2 py-0.5 rounded-md bg-green-50 text-green-800 text-xs font-medium
```

### Table Header Row
```
bg-gray-50 border-b-2 border-gray-200
```

### Table Row
```
border-b border-gray-200 hover:bg-gray-50
```

### Section Heading
```
text-xl font-semibold text-gray-900
```

### Page Heading
```
text-2xl font-bold text-gray-900
```

## Radii

Only `rounded-md` for cards, inputs, buttons, badges, tags.
Exception: `rounded-full` only for status pill badges.

## Typography Scale

| Token | Size | Usage |
|---|---|---|
| `text-xs` | 0.75rem | Badges, breadcrumbs, table headers, meta |
| `text-sm` | 0.875rem | Body, inputs, buttons, links |
| `text-base` | 1rem | Card titles, job titles |
| `text-lg` | 1.125rem | Pricing amounts |
| `text-xl` | 1.25rem | Section headings |
| `text-2xl` | 1.5rem | Page headings |

Font weights: `font-medium` (500) for buttons/badges, `font-semibold` (600) for headings, `font-bold` (700) for page titles.
