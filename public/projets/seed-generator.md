# Seed Generator — étude de cas

> Étude de cas Seed Generator : un générateur de phrases BIP-39 hors ligne en Go, zéro dépendance, vérifiable plutôt que cru sur parole.

- URL canonique : https://valentin-fiess.fr/projets/seed-generator
- Dernière mise à jour : 2026-11-17
- Auteur : Valentin Fiess

Étude de cas : Seed Generator, un générateur de phrases BIP-39 hors ligne écrit en Go,
avec zéro dépendance externe.

Le parti pris est la vérifiabilité plutôt que la confiance : la racine d'entropie
reste crypto/rand, les sources auxiliaires (jitter CPU, télémétrie du runtime,
souris, micro, caméra) ne sont mélangées que comme diversifiants via
HKDF-SHA-512, jamais en remplacement du CSPRNG. Au démarrage, le binaire rejoue
les 96 vecteurs de test officiels contre ses quatre dictionnaires embarqués et
refuse de démarrer si un seul échoue. L'interface web locale est liée au
loopback, vérifie l'en-tête Host contre le DNS rebinding et sert ses flux SSE
par tickets à usage unique.

Stack : Go standard library, crypto/rand, HKDF-SHA-512, SSE, CSP stricte.

---

Index du site : https://valentin-fiess.fr/llms.txt · Toutes les pages sont disponibles en Markdown en ajoutant `.md` à leur URL.
