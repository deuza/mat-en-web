<?php
/**
 * Lichess Puzzle Trainer - Interface Web
 * Entraînement aux mats en X coups
 */
header('Content-Type: text/html; charset=UTF-8');

// Détecter les fichiers CSV disponibles
$availableLevels = [];
for ($i = 1; $i <= 5; $i++) {
    $filename = "mat{$i}.csv";
    if (file_exists($filename)) {
        $count = 0;
        $handle = fopen($filename, 'r');
        if ($handle) {
            while (fgets($handle) !== false) {
                $count++;
            }
            fclose($handle);
        }
        if ($count > 0) {
            $availableLevels[$i] = $count;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>♟️  Mat En Web - Mats en X coups</title>
    
    <!-- Chessboard.js CSS depuis CDN -->
    <link rel="stylesheet" href="https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css">
    
    <!-- Styles personnalisés -->
    <link rel="stylesheet" href="style.css">

    <!-- favicon Lichess -->
    <link rel="icon" href="favicon.ico" type="image/x-icon">

</head>
<body>
    <div class="header">
        <h1>♟️  Mat En Web ♟️</h1>
        <p class="subtitle">Entraînement aux mats • Propulsé par DeuZa</p>
    </div>

    <div id="status" class="status info">Sélectionnez un niveau pour commencer</div>

    <!-- Sélecteur de niveau -->
    <div class="level-selector" id="levelSelector">
        <h3>🎯 Choisissez votre niveau</h3>
        <div class="level-buttons">
            <?php if (empty($availableLevels)): ?>
                <p class="no-puzzles">Aucun fichier de puzzles trouvé.<br>
                Exécutez <code>./download_puzzles.sh</code> pour générer les fichiers.</p>
            <?php else: ?>
                <?php foreach ($availableLevels as $level => $count): ?>
                    <button class="level-btn" data-level="<?= $level ?>">
                        <span class="level-number">Mat en <?= $level ?></span>
                        <span class="level-count"><?= number_format($count, 0, ',', ' ') ?> puzzles</span>
                    </button>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>

    <!-- Zone de jeu (cachée au départ) -->
    <div class="game-area" id="gameArea" style="display: none;">
        
        <!-- Contrôles principaux -->
        <div class="controls">
            <button onclick="loadNewPuzzle()" id="newPuzzleBtn">🎲 Nouveau puzzle</button>
            <button onclick="flipBoard()" id="flipBtn">🔄 Retourner</button>
            <button onclick="showSolution()" id="solutionBtn">💡 Solution</button>
            <button onclick="retryMove()" id="retryBtn" style="display: none;">🔁 Réessayer</button>
            <button onclick="backToMenu()" id="menuBtn">📋 Changer niveau</button>
        </div>

        <div class="main-container">
            <!-- Échiquier -->
            <div class="board-wrapper">
                <div class="coordinates-vertical" id="coordsVertical">
                    <span>8</span><span>7</span><span>6</span><span>5</span>
                    <span>4</span><span>3</span><span>2</span><span>1</span>
                </div>
                <div id="board" class="chess-board"></div>
                <div class="coordinates-horizontal" id="coordsHorizontal">
                    <span>a</span><span>b</span><span>c</span><span>d</span>
                    <span>e</span><span>f</span><span>g</span><span>h</span>
                </div>
            </div>

            <!-- Panel d'info -->
            <div class="info-panel">
                <!-- Informations du puzzle -->
                <div class="section">
                    <h3>🧩 Puzzle en cours</h3>
                    <div class="info-grid">
                        <div class="info-row">
                            <span class="info-label">Niveau:</span>
                            <span class="info-value" id="currentLevel">-</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Au trait:</span>
                            <span class="info-value" id="currentPlayer">-</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Progression:</span>
                            <span class="info-value" id="moveProgress">-</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Ouverture:</span>
                            <span class="info-value opening" id="openingName">-</span>
                        </div>
                    </div>
                </div>

                <!-- Messages de jeu -->
                <div class="section">
                    <h3>💬 Message</h3>
                    <div id="gameMessage" class="game-message">
                        Trouvez le mat !
                    </div>
                </div>

                <!-- Lien Lichess -->
                <div class="section">
                    <h3>🔗 Source</h3>
                    <a href="#" id="lichessLink" target="_blank" class="lichess-link">
                        Voir sur Lichess.org
                    </a>
                </div>

                <!-- Stats de session -->
                <div class="section">
                    <h3>📊 Session</h3>
                    <div class="info-grid">
                        <div class="info-row">
                            <span class="info-label">Tentés:</span>
                            <span class="info-value" id="statAttempted">0</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Réussis:</span>
                            <span class="info-value" id="statSolved">0</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Taux:</span>
                            <span class="info-value" id="statRate">-</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de promotion -->
    <div id="promotionModal" class="modal" style="display: none;">
        <div class="modal-content">
            <h3>Promotion du pion</h3>
            <div class="promotion-pieces">
                <button class="promotion-btn" data-piece="q">♛ Dame</button>
                <button class="promotion-btn" data-piece="r">♜ Tour</button>
                <button class="promotion-btn" data-piece="b">♝ Fou</button>
                <button class="promotion-btn" data-piece="n">♞ Cavalier</button>
            </div>
            <button class="cancel-btn" onclick="cancelPromotion()">Annuler</button>
        </div>
    </div>

    <!-- jQuery (requis pour chessboard.js) -->
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    
    <!-- chess.js local -->
    <script src="chess.js"></script>
    
    <!-- Chessboard.js depuis CDN -->
    <script src="https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js"></script>
    
    <!-- Application principale -->
    <script src="app.js"></script>
</body>
</html>
