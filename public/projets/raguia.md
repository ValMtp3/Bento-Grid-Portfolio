# Raguia — étude de cas

> Étude de cas Raguia : un RAG multi-tenant sécurisé. Pourquoi PGVector plutôt qu'une base vectorielle dédiée, et pourquoi le filtrage des permissions se fait au retrieval.

- URL canonique : https://valentin-fiess.fr/projets/raguia
- Dernière mise à jour : 2026-09-01
- Auteur : Valentin Fiess

Étude de cas d'architecture : Raguia, un assistant RAG multi-tenant sécurisé.

Le document explique deux arbitrages techniques : pourquoi PGVector a été
retenu plutôt qu'une base vectorielle dédiée, et pourquoi le filtrage des
permissions est appliqué au moment du retrieval plutôt qu'après génération.

Stack du projet : FastAPI, PostgreSQL avec l'extension PGVector, React et
Docker.

---

Index du site : https://valentin-fiess.fr/llms.txt · Toutes les pages sont disponibles en Markdown en ajoutant `.md` à leur URL.
