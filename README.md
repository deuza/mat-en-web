# ♟️ Puzzle Trainer - Mats en X coups

Interface web d'entraînement aux puzzles de mats, propulsée par la base de données Lichess.

## 🚀 Installation rapide

### 1. Prérequis
- Serveur web avec PHP 7.4+ (Apache, Nginx...)
- Python 3 avec `python-chess` (pour générer les puzzles)

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
python3 -venv venv
source venv/bin/activate
pip install python-chess

# Télécharger et extraire les puzzles Lichess
./download_puzzles.sh
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
├── extract.py          # Script d'extraction des puzzles
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

- L'échiquier s'oriente automatiquement selon la couleur qui joue
- La promotion propose le choix entre Dame, Tour, Fou et Cavalier
- Les stats de session sont en mémoire (pas de persistance)
- Aucune dépendance externe sauf jQuery et Chessboard.js (CDN)

## 🙏 Crédits

- Puzzles : [Lichess.org](https://lichess.org/) - Base de données ouverte
- Échiquier : [chessboard.js](https://chessboardjs.com/)
- Logique : [chess.js](https://github.com/jhlywa/chess.js)

---
*Bon jeu ! 🎯*
