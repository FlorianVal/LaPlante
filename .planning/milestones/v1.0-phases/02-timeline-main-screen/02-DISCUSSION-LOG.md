# Phase 2: Timeline Main Screen - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-03
**Phase:** 02-timeline-main-screen
**Areas discussed:** Grid & navigation, Plant row layout, Current marker style, Cell appearance

---

## Grid and Temporal Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| ~14 jours (7 passés + 7 futurs) | Centré sur aujourd'hui, bonne densité pour voir les tendances. | ✓ |
| ~21 jours (7 passés + 14 futurs) | Plus orienté vers l'avenir, deux semaines de futur visibles. | |
| ~30 jours (10 passés + 20 futurs) | Vue large pour le mois à venir, cellules plus petites. | |
| À toi de choisir | Claude décide en fonction de la taille tablette. | |

**User's choice:** ~14 jours (7 passés + 7 futurs)

| Option | Description | Selected |
|--------|-------------|----------|
| Grille fixe sur aujourd'hui | Simplicité maximale, pas de geste de navigation. | |
| Grille scrollable horizontalement | L'utilisateur peut glisser pour voir d'autres jours. | ✓ |

**User's choice:** Grille centrée par défaut sur aujourd'hui mais scrollable horizontalement.
**Notes:** L'utilisateur a précisé que la grille est centrée par défaut mais l'utilisateur peut scroller pour voir les jours.

---

## Plant Row Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Nom à gauche + cellules | Label à gauche (nom + placeholder photo), cellules jour à droite. Compact et familier. | ✓ |
| Nom intégré aux cellules | Le nom est intégré dans la ligne, centré ou chevauchant les cellules. | |

**User's choice:** Nom à gauche + cellules

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholder icône plante | Petit cercle ou carré avec une icône de plante par défaut. | ✓ |
| Nom texte seul | Pas de photo, l'espace photo arrive en Phase 3. | |

**User's choice:** Placeholder icône plante

---

## Current-Date Marker Style

| Option | Description | Selected |
|--------|-------------|----------|
| Ligne verticale fine | Traverse toutes les lignes, discrète mais claire. Heure affichable en haut. | ✓ |
| Colonne surlignée | La colonne aujourd'hui est légèrement teintée/fond coloré. | |
| Les deux combinés | Colonne teintée + ligne verticale. Plus visible mais plus chargé. | |

**User's choice:** Ligne verticale fine

| Option | Description | Selected |
|--------|-------------|----------|
| Oui, afficher l'heure | Afficher l'heure actuelle en haut du marqueur (ex: "14:30"). | ✓ |
| Non, juste le jour | Pas d'heure, juste le marqueur de colonne. | |

**User's choice:** Oui, afficher l'heure

---

## Cell Appearance

| Option | Description | Selected |
|--------|-------------|----------|
| Pastilles compactes | Petits carrés colorés (8-12px), discrets, style points de présence. | |
| Cellule remplie | La cellule entière est colorée (fond vert clair). Plus lisible de loin, style heatmap. | ✓ |
| Icône/coche | Un coche ou symbole vert dans la cellule. Plus explicite mais plus chargé. | |

**User's choice:** Cellule remplie (style heatmap)

| Option | Description | Selected |
|--------|-------------|----------|
| Même style, couleur jaune | Cohérent avec le vert, l'interaction tap viendra en Phase 4. | ✓ |
| Style distinct plus visible | Icône d'alerte, bordure, ou légèrement plus gros. | |

**User's choice:** Même style rempli, couleur jaune/orange

---

## Claude's Discretion

- CSS approach (Tailwind, CSS Modules, plain CSS)
- Empty state design (no plants)
- Date header row format
- Mock data format
- Auto-refresh behavior for kiosk tablet use
- Exact green and yellow color values
- Horizontal scroll behavior details
- Row height and cell width values

## Deferred Ideas

None — discussion stayed within phase scope.
