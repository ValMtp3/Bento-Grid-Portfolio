# Chiffremento CLI — étude de cas

> Étude de cas Chiffremento CLI : chiffrement authentifié de fichiers en Go, format v4 à enveloppe DEK/KEK, Argon2id et releases signées.

- URL canonique : https://valentin-fiess.fr/projets/chiffremento-cli
- Dernière mise à jour : 2026-11-17
- Auteur : Valentin Fiess

Étude de cas : Chiffremento CLI, un outil en ligne de commande en Go pour chiffrer et
déchiffrer des fichiers et des dossiers, utilisable via une interface guidée
plein écran ou des flags pour les scripts.

Le format v4 apporte un engagement de clé (témoin de 32 octets sur la clé
maîtresse, comparé avant tout déchiffrement, ce qui ferme l'attaque par oracle
de partitionnement) et une enveloppe DEK/KEK : la clé de contenu est scellée
dans l'en-tête, donc changer de mot de passe ne réécrit que 117 octets
d'en-tête sans relire le fichier. Chiffrement authentifié AES-256-GCM ou
ChaCha20-Poly1305 en streaming, clés dérivées en Argon2id dont les paramètres
sont inscrits dans le fichier pour qu'un chiffrement ancien reste lisible après
durcissement. Dossiers empaquetés en tar au fil du chiffrement, compression
zstd, écriture atomique. Distribution en cask Homebrew via GoReleaser, releases
signées avec cosign, SBOM et attestation de provenance.

Stack : Go, AES-256-GCM, ChaCha20-Poly1305, Argon2id, zstd, GoReleaser, cosign.

---

Index du site : https://valentin-fiess.fr/llms.txt · Toutes les pages sont disponibles en Markdown en ajoutant `.md` à leur URL.
