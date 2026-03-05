[![GitHub last commit](https://img.shields.io/github/v/release/deuza/mat-en-web?style=plastic)](https://github.com/deuza/mat-en-web/commits/main)
![GitHub Release Date](https://img.shields.io/github/release-date/deuza/mat-en-web)
[![GitHub last commit](https://img.shields.io/github/last-commit/deuza/mat-en-web?style=plastic)](https://github.com/deuza/mat-en-web/commits/main)
![GitHub commit activity](https://img.shields.io/github/commit-activity/t/deuza/mat-en-web)
[![License: WTFPL](https://img.shields.io/badge/license-WTFPL_2.0-lightgrey.svg?style=plastic)](https://www.wtfpl.net/)
[![License: CC0](https://img.shields.io/badge/license-CC0_1.0-lightgrey.svg?style=plastic)](https://creativecommons.org/publicdomain/zero/1.0/)
![Hack The Planet](https://img.shields.io/badge/hack-the--planet-black?style=flat-square\&logo=gnu\&logoColor=white)
![Built With Love](https://img.shields.io/badge/built%20with-%E2%9D%A4%20by%20DeuZa-red?style=plastic)  

# ♟️ Mat En Web - Mats en X coups

Interface web d'entraînement aux puzzles de mats, propulsée par la base de données Lichess.

<p align="center">
  <img src="https://github.com/deuza/mat-en-web/releases/download/v1.0.4/mew1.png"/>
  <img src="https://github.com/deuza/mat-en-web/releases/download/v1.0.4/mew2.png"/>
  <img src="https://github.com/deuza/mat-en-web/releases/download/v1.0.4/mew3.png"/>
  <img src="https://github.com/deuza/mat-en-web/releases/download/v1.0.4/mew4.png"/>
</p>

---

## Table des matières

1. [Prérequis système](#1-prérequis)
2. [Installation de l'environnement Python](#2-déploiement)
3. [Accès au serveur web et utilisation](#3-accès)
4. [Extraction et transformation des puzzles](#4-mise-à-jour-des-fichier-des-exercices)
5. [Informations techniques](#5-infos-techniques)
6. [Remerciements](#6-remerciements)

## 🚀 Installation rapide

### 1. Prérequis
- Serveur web avec PHP 7.4+ (Apache, Nginx...)
- Python 3 avec `python-chess` (pour générer les puzzles)
- git version 2.39.5

Pour générer les puzzles :
- wget | GNU Wget 1.21.3 built on linux-gnu.
- zstd | Zstandard CLI (64-bit) v1.5.4, by Yann Collet 
- python3 | Python 3.11.2

### 2. Déploiement
```bash

# Se placer dans le répertoire racine de votre serveur ou le sous-répertoire de votre choix pour cloner le dossier hébergeant l'application
cd /var/www/html/

# Clonez le dépôt
git clone https://github.com/deuza/mat-en-web.git

# Vérification de l'interface avec les fichiers d'exemples https://<votre site>/mat-en-web/

# Placez vous dans le nouveau répertoire
cd mat-en-web/

# Créer l'environnement Python pour installer python-chess servant à générer les positions FEN des puzzles
python3 -m venv venv 
source venv/bin/activate
pip install python-chess

# Télécharger et extraire les puzzles Lichess
./download_puzzles.sh

# Sortir de l'environnement Python
deactivate
```

### 3. Accès
Ouvrir dans un navigateur : `http://votre-serveur/mat-en-web/`

## 📁 Structure des fichiers

```
puzzle-trainer/
├── index.php           # Interface principale
├── puzzle.php          # API JSON (charge un puzzle random)
├── app.js              # Logique JavaScript du jeu
├── style.css           # Styles CSS
├── chess.js            # Bibliothèque chess.js (locale)
├── mat1.csv            # Puzzles mat en 1 coup (à générer)
├── mat2.csv            # Puzzles mat en 2 coups (à générer)
├── mat3.csv            # Puzzles mat en 3 coups (à générer)
├── mat4.csv            # Puzzles mat en 4 coups (à générer)
├── mat5.csv            # Puzzles mat en 5 coups (à générer)
├── download_puzzles.sh # Script de téléchargement Lichess
├── extract.py          # Script d'extraction des puzzles en jouant le 1er coup
├── LICENSE             # Creative Commons Zero v1.0 Universal
└── README.md           # Ce fichier
```

## 🎮 Utilisation

1. **Sélectionner un niveau** : Mat en 1, 2, 3, 4 ou 5 coups
2. **Jouer** : Glisser-déposer les pièces pour trouver le mat
3. **Mauvais coup** : Réessayer ou voir la solution
4. **Bon coup** : L'adversaire répond automatiquement
5. **Mat trouvé** : 🎉 Charger un nouveau puzzle

### Raccourcis clavier
- `N` : Nouveau puzzle
- `F` : Retourner l'échiquier
- `S` : Afficher la solution
- `Échap` : Annuler la promotion

### 4. Mise à jour des fichier d'exercices

```bash
# Placez vous dans le répertoire contenant les exercices
cd /var/www/html/mat-en-web/

# Activer l'environnement Python pour utiliser python-chess pour générer les positions FEN des puzzles via le script extract.py
source venv/bin/activate

# Télécharger et extraire les puzzles Lichess
./download_puzzles.sh

# Sortir de l'environnement Python
deactivate
```

### 5. Infos techniques

## 🔧 Format des fichiers CSV

```
PuzzleId,FEN,Solution,URL,OpeningTags
000rZ,2kr1b1r/p1p2pp1/...,d6h2,https://lichess.org/...,Scandinavian_Defense
```

- **PuzzleId** : Identifiant unique Lichess
- **FEN** : Position après le coup de l'adversaire (au joueur de trouver le mat)
- **Solution** : Coups en notation UCI séparés par des espaces
- **URL** : Lien vers le puzzle sur Lichess
- **OpeningTags** : Ouverture(s) associée(s)

## 📝 Notes techniques

- L'échiquier s'oriente automatiquement selon la couleur qui a le trait
- La promotion d'un Pion propose le choix entre Dame, Tour, Fou et Cavalier
- Les stats de session sont uniquement en mémoire (aucune persistance)
- Dépendance externe jQuery et Chessboard.js (CDN)

## 🌐 Ressources externes

- **Base Lichess** : https://database.lichess.org/
- **Documentation python-chess** : https://python-chess.readthedocs.io/
- **Notation UCI** : https://www.chessprogramming.org/UCI
- **Version CLI** : [mat-en](https://github.com/deuza/mat-en/)

## Soucis connus

- Utilisation via les téléphones mobiles

### 6. Remerciements

- Puzzles : [Lichess.org](https://lichess.org/) - Base de données ouverte
- Échiquier : [chessboard.js](https://chessboardjs.com/)
- Logique : [chess.js](https://github.com/jhlywa/chess.js)
- Version CLI : [mat-en](https://github.com/deuza/mat-en/)

---
*Bon jeu ! 🎯*
