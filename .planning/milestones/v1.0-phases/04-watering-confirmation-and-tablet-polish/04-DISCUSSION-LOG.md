# Phase 4: Watering Confirmation and Tablet Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-03
**Phase:** 04-watering-confirmation-and-tablet-polish
**Areas discussed:** Interaction de confirmation, Tablet polish et UX kiosque, Après confirmation, Robustesse persistance

---

## Interaction de confirmation

| Option | Description | Selected |
|--------|-------------|----------|
| Tap sur la cellule jaune | Tap directement sur la cellule overdue dans la timeline. Zone de tap = la cellule (48x48px). Simple, direct. | ✓ |
| Bouton dédié dans la row | Un bouton/icone "water" apparaît à côté du nom quand overdue. Plus grand tap target mais ajoute du visuel. | |
| Tap sur n'importe quelle cellule jaune | Si plusieurs cellules jaunes existent, chacune est tappable. | |

**User's choice:** Tap sur la cellule jaune
**Notes:** Direct, la cellule jaune crie "tap moi"

## Taille des tap targets

| Option | Description | Selected |
|--------|-------------|----------|
| Garder 48x48px | Dans les recommandations d'accessibilité (44px Apple, 48dp Google) | |
| Agrandir les cellules | Agrandir à 56x56px ou plus | |

**User's choice:** Cellules rectangulaires plus larges que hautes (réponse libre)
**Notes:** L'utilisateur veut des cellules légèrement rectangulaires — plus larges que hautes

## Feedback visuel au tap

| Option | Description | Selected |
|--------|-------------|----------|
| Transition jaune→vert | La cellule jaune devient verte avec une petite transition (0.2-0.3s). Pas de toast. | ✓ |
| Transition + toast | Transition + toast discret "Plante arrosée" | |
| Changement instantané | La cellule change immédiatement, pas d'animation | |

**User's choice:** Transition jaune→vert
**Notes:** Le changement visuel suffit, pas besoin de toast

## Mode kiosque

| Option | Description | Selected |
|--------|-------------|----------|
| Mode kiosque permanent | La tablette affiche le timeline en permanence. Pas d'écran de veille. | ✓ |
| Usage occasionnel | L'utilisateur ouvre l'app quand il veut vérifier. | |

**User's choice:** Mode kiosque permanent

## Accès LAN

| Option | Description | Selected |
|--------|-------------|----------|
| 0.0.0.0 + IP locale | Le serveur écoute sur toutes les interfaces. La tablette accède via http://IP:PORT. | ✓ |
| Hostname local | Utiliser un hostname local (ex: laplante.local) via mDNS | |

**User's choice:** 0.0.0.0 + IP locale

## Zoom sur tablette

| Option | Description | Selected |
|--------|-------------|----------|
| Désactiver le zoom | Viewport meta tag avec user-scalable=no, maximum-scale=1 | ✓ |
| Zoom autorisé | Laisser le zoom natif | |

**User's choice:** Désactiver le zoom

## Refresh après confirmation

| Option | Description | Selected |
|--------|-------------|----------|
| Refresh immédiat | Appeler usePlants.refresh() immédiatement après le POST. L'utilisateur voit le changement tout de suite. | ✓ |
| Attendre le polling | Attendre le prochain cycle de polling (max 60s) | |

**User's choice:** Refresh immédiat

## Persistance

| Option | Description | Selected |
|--------|-------------|----------|
| Tests de vérification | Phase 4 inclut des tests pour vérifier persistence existante. Pas de nouvelle feature. | ✓ |
| Tests + améliorations | En plus des tests, améliorer si des problèmes sont découverts | |

**User's choice:** Tests de vérification

## Claude's Discretion

- Exact rectangular cell dimensions
- How tap handler is wired into DayCell
- Transition animation CSS details
- Server host/port configuration for LAN
- Testing approach for persistence verification
- Cursor/tap highlight on overdue cells

## Deferred Ideas

None — discussion stayed within phase scope.
