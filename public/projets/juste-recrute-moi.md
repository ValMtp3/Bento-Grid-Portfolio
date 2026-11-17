# Juste Recrute Moi — étude de cas

> Étude de cas Juste Recrute Moi : un agrégateur local-first d'offres d'emploi pour le marché français, fork de JustHireMe adapté aux sources hexagonales.

- URL canonique : https://valentin-fiess.fr/projets/juste-recrute-moi
- Dernière mise à jour : 2026-11-17
- Auteur : Valentin Fiess

Étude de cas : Juste Recrute Moi, un agrégateur local-first d'offres d'emploi pour le
marché français, fork de JustHireMe.

L'application récupère les offres depuis plusieurs sources (API France Travail,
ATS directs comme Greenhouse, Lever, Ashby, Workable, SmartRecruiters et
Teamtailor, JobSpy pour Indeed et Google Jobs en best effort, import d'URL en
JSON-LD), les normalise, filtre les lignes faibles, déduplique les doublons,
puis les classe dans un pipeline local. Profil, offres, scores et documents
générés restent stockés localement par défaut ; aucune dépendance payante
n'est obligatoire. Licence AGPL-3.0.

Stack : Tauri, Rust, React, Python / FastAPI.

---

Index du site : https://valentin-fiess.fr/llms.txt · Toutes les pages sont disponibles en Markdown en ajoutant `.md` à leur URL.
