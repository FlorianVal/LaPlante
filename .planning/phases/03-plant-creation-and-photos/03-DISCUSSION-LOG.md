# Phase 3: Plant Creation and Photos - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in 03-CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-03
**Phase:** 03-plant-creation-and-photos
**Areas discussed:** Formulaire d'ajout, Upload photo, Recurrence par defaut, Feedback apres creation

---

## Formulaire d'ajout

| Option | Description | Selected |
|--------|-------------|----------|
| Modal centre | Formulaire par-dessus le timeline. Simple, pas de navigation. | ✓ |
| Drawer/Slide-over | Panneau glissant depuis le bas ou le cote. | |
| Inline dans le timeline | Nouvelle ligne avec champs editables directement. | |

**User's choice:** Modal centre
**Notes:** Simple, reste dans le contexte visuel, facile a refermer.

### Declencheur

| Option | Description | Selected |
|--------|-------------|----------|
| Bouton + fixe | Toujours visible en haut a droite. | ✓ |
| Double: EmptyState + bouton fixe | EmptyState pour premier contact, bouton fixe ensuite. | |
| EmptyState uniquement | Bouton seulement quand pas de plantes. | |

**User's choice:** Bouton + fixe

### Champs

| Option | Description | Selected |
|--------|-------------|----------|
| 3 champs: nom, photo, recurrence | Simple et direct pour usage domestique. | ✓ |
| 2 champs + photo optionnelle cachee | Moins intimidant mais moins discoverable. | |

**User's choice:** 3 champs (nom, photo, recurrence)

---

## Upload photo

| Option | Description | Selected |
|--------|-------------|----------|
| Selection de fichier | Choix d'image existante. Simple, fonctionne partout. | ✓ |
| Camera + fichier | Acces camera tablette + fichier. Plus complet. | |
| URL/chemin manuel | Pas convivial pour usage domestique. | |

**User's choice:** Selection de fichier

### Apercu

| Option | Description | Selected |
|--------|-------------|----------|
| Oui, apercu avant envoi | Rassurant, l'utilisateur voit ce qu'il envoie. | ✓ |
| Pas d'apercu | Plus simple mais moins convivial. | |

**User's choice:** Oui, apercu avant envoi

---

## Recurrence par defaut

| Option | Description | Selected |
|--------|-------------|----------|
| Presets + champ personnalise | Boutons 3j/7j/14j + champ libre. Rapide et flexible. | ✓ |
| Champ numerique seul | Minimaliste. | |
| Slider | Visuel mais moins precis. | |

**User's choice:** Presets + champ personnalise

### Valeur par defaut

| Option | Description | Selected |
|--------|-------------|----------|
| 7 jours | Plus courant pour plantes d'interieur. | ✓ |
| Aucune valeur par defaut | Doit choisir explicitement. | |
| 3 jours | Plus frequent pour certaines plantes. | |

**User's choice:** 7 jours

---

## Feedback apres creation

| Option | Description | Selected |
|--------|-------------|----------|
| Toast discret | Message bref en bas, pas d'interruption. | ✓ |
| Scroll vers la nouvelle plante | Direct mais derange le positionnement. | |
| Fermeture simple, pas de toast | Juste la fermeture du modal. | |

**User's choice:** Toast discret
**Notes:** Rafraichissement immediat du timeline (bypass polling 60s).

---

## Claude's Discretion

- Modal styling et dimensions (utiliser design tokens existants).
- Composant toast: position, duree, animation.
- Limites de taille fichier et formats d'image acceptes.
- Repertoire de stockage photos et convention de nommage.
- Etats d'erreur du formulaire.
- Integration du bouton "+" dans le layout Timeline.

## Deferred Ideas

Aucune — la discussion est restee dans le perimetre de la phase.
