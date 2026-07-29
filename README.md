[Uploading LISEZMOI.md…]()
# Comptes — application de gestion financière

Application web installable (PWA) conçue pour un iPhone. Tout fonctionne hors ligne
et **les données ne quittent jamais l'appareil**.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | L'application entière : interface, calculs, stockage. Aucune dépendance externe. |
| `manifest.webmanifest` | Nom, icône et mode plein écran pour l'installation. |
| `sw.js` | Service worker : met l'application en cache pour le fonctionnement hors ligne. |
| `icon-*.png` | Icônes de l'écran d'accueil. |
| `mes-chiffres.json` | **Privé.** Vos montants réels, à importer une fois sur le téléphone. **Ne jamais déposer sur GitHub.** |

---

## Installation sur l'iPhone

Le service worker et l'installation en plein écran exigent une adresse en `https://`.
Le plus simple est GitHub Pages, gratuit et en cinq minutes.

> **Le dépôt doit être public.** Sur un compte GitHub gratuit, Pages ne fonctionne
> que sur un dépôt public. Ce n'est pas un problème : `index.html` ne contient aucun
> montant, et vos opérations restent dans IndexedDB sur le téléphone. En revanche,
> `mes-chiffres.json` ne doit jamais être déposé.

1. Créer un dépôt GitHub **public**.
2. Y déposer les fichiers — **tous sauf `mes-chiffres.json`** — à la racine.
3. Dans le dépôt : **Settings → Pages → Source: Deploy from a branch → main / (root)**.
4. Attendre une minute, GitHub affiche l'adresse `https://<compte>.github.io/<depot>/`.
5. Ouvrir cette adresse **dans Safari** sur l'iPhone (pas Chrome : seul Safari sait installer une PWA sur iOS).
6. Bouton Partager → **Sur l'écran d'accueil** → Ajouter.

L'icône apparaît sur l'écran d'accueil et l'application s'ouvre en plein écran, sans barre Safari.

### Pour essayer d'abord sur ordinateur

```bash
cd <dossier>
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000`. En `http://` le service worker ne s'active pas,
mais tout le reste fonctionne.

---

## Charger vos chiffres

L'application publiée démarre vide : structure des comptes et des catégories en place,
tous les montants à zéro. Vos vrais chiffres arrivent par le fichier privé.

1. Envoyer `mes-chiffres.json` sur le téléphone (AirDrop, courriel, iCloud Drive)
   et l'enregistrer dans **Fichiers**.
2. Dans l'application : **Réglages → Restaurer une sauvegarde** → choisir le fichier.

Tout se met en place d'un coup :

| | |
|---|---|
| Comptes | Compte courant · Compte épargne 6 000 $ · deux comptes EUR |
| Budgets | Loyer 900 $/quinzaine · Abonnements 200 $/mois · Courses 700 $/quinzaine · Consommation 300 $/quinzaine |
| Récurrentes | Paie +3 300 $/quinzaine · Loyer −900 $/quinzaine · Échéance prêt −1 179 €/mois |
| Prêt | 60 000 € empruntés, 43 182,25 € restants, 0,9 %, 1 179 €/mois |
| Objectif | 10 000 $ pour le 15 septembre 2026, à partir de 6 000 $ |

Restent deux vérifications dans **Réglages** :

- **Cycle de paie** — la date proposée est le jeudi 23 juillet 2026. Mettre votre vraie date de paie.
- **Comptes** — ajuster les soldes de départ sur le relevé bancaire du jour.

Les mêmes réglages permettent de tout saisir à la main si vous préférez ignorer le fichier.

---

## Points de conception

**Un mois ne fait pas deux quinzaines.** Une année compte 26 quinzaines et 12 mois.
Un budget mensuel de 200 $ vaut donc 92,31 $ par quinzaine, pas 100 $. L'application
applique ce facteur partout ; chaque budget reste saisi dans son unité naturelle.

**Le repère de rythme.** Sur chaque jauge de budget, le trait vertical marque la part
de la quinzaine déjà écoulée. Une barre au-delà du trait signale une dépense en avance
sur le rythme, avant tout dépassement.

**L'échéancier est recalculé, pas stocké.** Chaque échéance confirmée décompose la
mensualité en capital et intérêts au taux en vigueur, puis décrémente le capital restant.
Corriger le capital restant dû dans Réglages recale immédiatement toute la projection.

**Le taux de change.** Récupéré une fois par jour auprès de la Banque centrale européenne
(api.frankfurter.app, sans clé ni compte). Hors ligne, le dernier taux connu est conservé
et sa date reste affichée.

---

## Sauvegardes

Les données vivent dans IndexedDB, sur cet appareil uniquement. Il n'existe aucune copie
ailleurs. **Réglages → Exporter une sauvegarde** produit un fichier JSON à conserver
(iCloud Drive, courriel, n'importe où). À faire une fois par mois, et avant tout
changement de téléphone.

Effacer les données de site dans Safari supprime tout. La restauration se fait par
**Réglages → Restaurer une sauvegarde**.

## Publier une mise à jour

Après avoir remplacé un fichier sur GitHub, incrémenter la version du cache dans
`sw.js` (`const CACHE = 'comptes-v1'` → `'comptes-v2'`). Sans cela, le service worker
continue de servir l'ancienne version depuis le cache du téléphone.

---

## Évolutions prévues sans refonte

Le modèle de données a été pensé pour accueillir, le moment venu :

- **Import CSV** des relevés bancaires — les opérations ont déjà la forme attendue.
- **Investissements** — les comptes acceptent un nouveau type sans toucher au reste.
- **Synchronisation** — la couche de stockage est isolée derrière un seul objet `Store`.
- **Plusieurs objectifs** — `goal` devient un tableau.
