# 🥗 MealMate

Einfacher, schöner Wochenplaner für Mahlzeiten.  
Rezepte verwalten · Per Drag & Drop einplanen · Einkaufsliste automatisch generieren.

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Postgres, Realtime, RLS)
- **@dnd-kit** für Drag & Drop

---

## Lokaler Start

### 1. Supabase-Projekt anlegen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt.
2. Öffne den **SQL Editor** im Dashboard.
3. Führe den gesamten Inhalt von `supabase-schema.sql` aus.

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.local.example .env.local
```

Trage in `.env.local` deine Supabase-Daten ein:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
```

Beides findest du im Supabase-Dashboard unter **Project Settings → API**.

### 3. Dependencies installieren & starten

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) — du landest automatisch auf dem Wochenplan.

---

## Projektstruktur

```
src/
├── app/
│   ├── layout.tsx          # Root-Layout mit Navigation
│   ├── page.tsx            # Redirect → /plan
│   ├── recipes/page.tsx    # Rezeptverwaltung
│   ├── plan/page.tsx       # Wochenplan mit Drag & Drop
│   └── shopping/page.tsx   # Einkaufsliste
├── components/
│   ├── Navigation.tsx
│   ├── ui/                 # Button, Input, Modal, Select, Textarea, TagBadge
│   ├── recipes/            # RecipeCard, RecipeForm, RecipeDetail, RecipeImport
│   ├── plan/               # WeekPlan, DraggableRecipeItem, DroppableSlot
│   └── shopping/           # ShoppingList
├── lib/
│   ├── supabase.ts         # Supabase-Client
│   ├── week.ts             # Wochendatum-Helpers
│   ├── recipeParser.ts     # Text-Import-Parser
│   └── shoppingList.ts     # Einkaufsliste-Generator
└── types/index.ts          # Alle TypeScript-Types
```

---

## Rezept-Import-Format

```
[TITEL]
Kichererbsen-Curry

[PORTIONEN]
1

[TAGS]
vegetarisch, schnell, proteinreich

[ZUTATEN]
Zutat | Menge | Einheit | Kategorie
Kichererbsen | 240 | g | Trockenware
Kokosmilch | 400 | ml | Kühlregal
Paprika | 2 | Stück | Gemüse

[ZUBEREITUNG]
1. Kichererbsen abtropfen lassen.
2. Mit Kokosmilch aufkochen.
```

---

## Nächste Schritte (Post-MVP)

- [ ] Supabase Auth (User-Accounts)
- [ ] PWA-Manifest & Service Worker
- [ ] Rezept aus URL importieren (scraping)
- [ ] Nährwertangaben
- [ ] Rezeptbilder via Supabase Storage
- [ ] Teilen-Funktion für Einkaufsliste

---

## Datenbank-Schema

| Tabelle              | Beschreibung                          |
|----------------------|---------------------------------------|
| `recipes`            | Rezepte mit Titel, Tags, Portionen    |
| `ingredients`        | Zutaten (N:1 zu recipes)              |
| `recipe_steps`       | Zubereitungsschritte (N:1 zu recipes) |
| `plan_entries`       | Wochenplan-Einträge                   |
| `shopping_list_items`| Einkaufsliste pro Woche               |
