/**
 * app.js - Puzzle Trainer
 * Logique de jeu pour les mats en X coups
 */

// Variables globales
let game = null;
let board = null;
let currentPuzzle = null;
let currentLevel = null;
let solutionMoves = [];
let currentMoveIndex = 0;
let isPlayerTurn = true;
let pendingMove = null; // Pour la promotion
let boardOrientation = 'white';

// Stats de session
let stats = {
    attempted: 0,
    solved: 0
};

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser chess.js
    if (typeof Chess === 'undefined') {
        showStatus('Erreur: Chess.js non chargé', 'error');
        return;
    }
    game = new Chess();

    // Attacher les événements aux boutons de niveau
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const level = parseInt(this.dataset.level);
            startLevel(level);
        });
    });

    // Attacher les événements aux boutons de promotion
    document.querySelectorAll('.promotion-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const piece = this.dataset.piece;
            completePromotion(piece);
        });
    });

    console.log('✓ Puzzle Trainer initialisé');
});

// ============================================
// GESTION DES NIVEAUX
// ============================================

function startLevel(level) {
    currentLevel = level;
    
    // Masquer le sélecteur, afficher la zone de jeu
    document.getElementById('levelSelector').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
    
    // Initialiser l'échiquier si nécessaire
    if (!board) {
        initializeBoard();
    }
    
    // Charger un puzzle
    loadNewPuzzle();
}

function backToMenu() {
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('levelSelector').style.display = 'block';
    showStatus('Sélectionnez un niveau pour commencer', 'info');
}

// ============================================
// ÉCHIQUIER
// ============================================

function initializeBoard() {
    if (typeof Chessboard === 'undefined') {
        showStatus('Erreur: Chessboard.js non chargé', 'error');
        return;
    }

    const config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    };

    board = Chessboard('board', config);
    console.log('✓ Échiquier initialisé');
}

function onDragStart(source, piece, position, orientation) {
    // Ne pas déplacer si ce n'est pas le tour du joueur
    if (!isPlayerTurn) return false;
    
    // Ne pas déplacer si la partie est terminée
    if (game.game_over()) return false;

    // Ne déplacer que les pièces de la couleur au trait
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

function onDrop(source, target) {
    // Vérifier si c'est une promotion
    const piece = game.get(source);
    if (piece && piece.type === 'p') {
        const targetRank = target.charAt(1);
        if ((piece.color === 'w' && targetRank === '8') ||
            (piece.color === 'b' && targetRank === '1')) {
            // Stocker le coup en attente et afficher le modal
            pendingMove = { from: source, to: target };
            showPromotionModal();
            return; // Ne pas retourner 'snapback', on attend la sélection
        }
    }

    // Coup normal
    return tryMove(source, target, 'q');
}

function tryMove(source, target, promotion) {
    // Tenter le coup
    const move = game.move({
        from: source,
        to: target,
        promotion: promotion
    });

    // Coup illégal
    if (move === null) {
        return 'snapback';
    }

    // Construire le coup UCI pour comparaison
    let uciMove = source + target;
    if (move.promotion) {
        uciMove += move.promotion;
    }

    // Vérifier si c'est le bon coup
    const expectedMove = solutionMoves[currentMoveIndex];
    
    if (normalizeMove(uciMove) === normalizeMove(expectedMove)) {
        // Coup correct !
        onCorrectMove(move);
    } else {
        // Coup incorrect
        onIncorrectMove(move, expectedMove);
    }
}

function onSnapEnd() {
    board.position(game.fen());
}

function normalizeMove(move) {
    return move.toLowerCase().trim();
}

// ============================================
// LOGIQUE DU PUZZLE
// ============================================

async function loadNewPuzzle() {
    showStatus('Chargement du puzzle...', 'info');
    setGameMessage('Chargement...', '');
    
    document.getElementById('retryBtn').style.display = 'none';
    
    try {
        const response = await fetch('puzzle.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ level: currentLevel })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Stocker le puzzle
        currentPuzzle = data.puzzle;
        solutionMoves = currentPuzzle.solution.split(' ');
        currentMoveIndex = 0;
        isPlayerTurn = true;

        // Charger la position
        game.load(currentPuzzle.fen);
        
        // Orienter l'échiquier selon le trait
        const newOrientation = currentPuzzle.turn === 'w' ? 'white' : 'black';
        if (newOrientation !== boardOrientation) {
            boardOrientation = newOrientation;
            board.orientation(newOrientation);
            updateCoordinates(newOrientation);
        }
        
        board.position(currentPuzzle.fen);

        // Mettre à jour l'interface
        updatePuzzleInfo();
        updateProgress();
        setGameMessage('🎯 Trouvez le mat en ' + currentLevel + ' !', '');
        showStatus('Puzzle chargé - À vous de jouer !', 'success');

        // Stats
        stats.attempted++;
        updateStats();

    } catch (error) {
        showStatus('Erreur: ' + error.message, 'error');
        setGameMessage('Erreur de chargement', 'error');
    }
}

function onCorrectMove(move) {
    currentMoveIndex++;
    
    // Vérifier si c'est le dernier coup (mat trouvé)
    if (currentMoveIndex >= solutionMoves.length) {
        onPuzzleSolved();
        return;
    }

    // Il reste des coups - l'adversaire doit répondre
    setGameMessage('✓ Excellent !', 'success');
    
    // Jouer la réponse de l'adversaire après un délai
    isPlayerTurn = false;
    setTimeout(() => {
        playOpponentMove();
    }, 500);
}

function playOpponentMove() {
    const opponentMove = solutionMoves[currentMoveIndex];
    
    // Parser le coup UCI
    const from = opponentMove.substring(0, 2);
    const to = opponentMove.substring(2, 4);
    const promotion = opponentMove.length > 4 ? opponentMove.charAt(4) : undefined;

    // Jouer le coup
    const move = game.move({
        from: from,
        to: to,
        promotion: promotion
    });

    if (move) {
        board.position(game.fen());
        currentMoveIndex++;
        updateProgress();
        
        // Mettre en évidence le coup adverse
        highlightSquare(from, 'opponent');
        highlightSquare(to, 'opponent');
        
        setTimeout(() => {
            clearHighlights();
            setGameMessage('👤 L\'adversaire a joué ' + opponentMove.toUpperCase() + ' - À vous !', 'info');
            isPlayerTurn = true;
        }, 300);
    }
}

function onIncorrectMove(move, expected) {
    // Annuler le coup
    game.undo();
    board.position(game.fen());
    
    setGameMessage('❌ Ce n\'est pas le bon coup !', 'error');
    document.getElementById('retryBtn').style.display = 'inline-block';
    
    isPlayerTurn = true;
}

function onPuzzleSolved() {
    stats.solved++;
    updateStats();
    
    setGameMessage('🎉 Bravo ! Échec et mat !', 'success');
    showStatus('Puzzle résolu ! Chargez-en un autre.', 'success');
    
    isPlayerTurn = false;
}

function retryMove() {
    document.getElementById('retryBtn').style.display = 'none';
    setGameMessage('🔄 Réessayez...', 'info');
    isPlayerTurn = true;
}

function showSolution() {
    const remaining = solutionMoves.slice(currentMoveIndex).join(' ').toUpperCase();
    setGameMessage('💡 Solution: ' + remaining, 'info');
    
    // Jouer visuellement tous les coups restants
    playSolutionAnimated();
}

async function playSolutionAnimated() {
    isPlayerTurn = false;
    
    for (let i = currentMoveIndex; i < solutionMoves.length; i++) {
        const move = solutionMoves[i];
        const from = move.substring(0, 2);
        const to = move.substring(2, 4);
        const promotion = move.length > 4 ? move.charAt(4) : undefined;

        await new Promise(resolve => setTimeout(resolve, 600));

        game.move({ from, to, promotion });
        board.position(game.fen());
    }

    showStatus('Solution affichée. Chargez un nouveau puzzle.', 'warning');
}

// ============================================
// PROMOTION
// ============================================

function showPromotionModal() {
    document.getElementById('promotionModal').style.display = 'flex';
}

function hidePromotionModal() {
    document.getElementById('promotionModal').style.display = 'none';
}

function completePromotion(piece) {
    hidePromotionModal();
    
    if (pendingMove) {
        tryMove(pendingMove.from, pendingMove.to, piece);
        pendingMove = null;
    }
}

function cancelPromotion() {
    hidePromotionModal();
    pendingMove = null;
    board.position(game.fen()); // Remettre la pièce en place
}

// ============================================
// INTERFACE
// ============================================

function flipBoard() {
    board.flip();
    boardOrientation = boardOrientation === 'white' ? 'black' : 'white';
    updateCoordinates(boardOrientation);
}

function updateCoordinates(orientation) {
    const vertCoords = document.getElementById('coordsVertical');
    const horzCoords = document.getElementById('coordsHorizontal');
    
    if (orientation === 'white') {
        vertCoords.innerHTML = '<span>8</span><span>7</span><span>6</span><span>5</span><span>4</span><span>3</span><span>2</span><span>1</span>';
        horzCoords.innerHTML = '<span>a</span><span>b</span><span>c</span><span>d</span><span>e</span><span>f</span><span>g</span><span>h</span>';
    } else {
        vertCoords.innerHTML = '<span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span>';
        horzCoords.innerHTML = '<span>h</span><span>g</span><span>f</span><span>e</span><span>d</span><span>c</span><span>b</span><span>a</span>';
    }
}

function updatePuzzleInfo() {
    document.getElementById('currentLevel').textContent = 'Mat en ' + currentLevel;
    document.getElementById('currentPlayer').textContent = currentPuzzle.turn === 'w' ? 'Blancs' : 'Noirs';
    document.getElementById('openingName').textContent = currentPuzzle.opening || '-';
    document.getElementById('lichessLink').href = currentPuzzle.url;
}

function updateProgress() {
    const playerMoves = Math.ceil((currentMoveIndex + 1) / 2);
    const totalMoves = currentLevel;
    document.getElementById('moveProgress').textContent = playerMoves + ' / ' + totalMoves;
}

function updateStats() {
    document.getElementById('statAttempted').textContent = stats.attempted;
    document.getElementById('statSolved').textContent = stats.solved;
    
    if (stats.attempted > 0) {
        const rate = Math.round((stats.solved / stats.attempted) * 100);
        document.getElementById('statRate').textContent = rate + '%';
    }
}

function setGameMessage(message, type) {
    const el = document.getElementById('gameMessage');
    el.textContent = message;
    el.className = 'game-message' + (type ? ' ' + type : '');
}

function showStatus(message, type) {
    const el = document.getElementById('status');
    el.textContent = message;
    el.className = 'status ' + type;
}

function highlightSquare(square, type) {
    const squareEl = document.querySelector('.square-' + square);
    if (squareEl) {
        squareEl.classList.add('highlight-' + type);
    }
}

function clearHighlights() {
    document.querySelectorAll('.highlight-move, .highlight-opponent').forEach(el => {
        el.classList.remove('highlight-move', 'highlight-opponent');
    });
}

// ============================================
// RACCOURCIS CLAVIER
// ============================================

document.addEventListener('keydown', function(e) {
    // N : Nouveau puzzle
    if (e.key === 'n' || e.key === 'N') {
        if (document.getElementById('gameArea').style.display !== 'none') {
            loadNewPuzzle();
        }
    }
    
    // F : Retourner l'échiquier
    if (e.key === 'f' || e.key === 'F') {
        if (board) flipBoard();
    }
    
    // S : Afficher solution
    if (e.key === 's' || e.key === 'S') {
        if (currentPuzzle) showSolution();
    }
    
    // Échap : Fermer modal de promotion
    if (e.key === 'Escape') {
        cancelPromotion();
    }
});

console.log('✓ Application chargée');
