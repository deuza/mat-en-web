<?php
/**
 * puzzle.php - API pour charger un puzzle aléatoire
 * Reçoit: POST {level: 1-5}
 * Retourne: JSON {fen, solution, url, opening, error?}
 */

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Réponse d'erreur
function errorResponse($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

// Vérifier la méthode
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Méthode non autorisée. Utilisez POST.', 405);
}

// Lire le JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['level'])) {
    errorResponse('Paramètre "level" manquant');
}

$level = intval($input['level']);

// Valider le niveau
if ($level < 1 || $level > 5) {
    errorResponse('Niveau invalide. Choisissez entre 1 et 5.');
}

// Vérifier le fichier
$filename = "mat{$level}.csv";

if (!file_exists($filename)) {
    errorResponse("Fichier {$filename} introuvable. Exécutez download_puzzles.sh", 404);
}

// Compter les lignes
$totalLines = 0;
$handle = fopen($filename, 'r');
if (!$handle) {
    errorResponse("Impossible d'ouvrir {$filename}", 500);
}

while (fgets($handle) !== false) {
    $totalLines++;
}
fclose($handle);

if ($totalLines === 0) {
    errorResponse("Le fichier {$filename} est vide", 404);
}

// Choisir une ligne aléatoire
$randomLine = mt_rand(0, $totalLines - 1);

// Relire pour récupérer la ligne
$handle = fopen($filename, 'r');
$currentLine = 0;
$puzzleLine = null;

while (($line = fgets($handle)) !== false) {
    if ($currentLine === $randomLine) {
        $puzzleLine = trim($line);
        break;
    }
    $currentLine++;
}
fclose($handle);

if (!$puzzleLine) {
    errorResponse("Erreur lors de la lecture du puzzle", 500);
}

// Parser la ligne CSV
// Format: PuzzleId,FEN,Solution,URL,OpeningTags
$fields = str_getcsv($puzzleLine);

if (count($fields) < 4) {
    errorResponse("Format CSV invalide", 500);
}

$puzzleId = $fields[0];
$fen = $fields[1];
$solution = $fields[2];
$url = $fields[3];
$opening = isset($fields[4]) ? $fields[4] : '';

// Formater l'ouverture (remplacer les underscores)
$opening = str_replace('_', ' ', $opening);

// Valider le FEN basiquement
if (strpos($fen, '/') === false || strpos($fen, ' ') === false) {
    errorResponse("FEN invalide dans le puzzle", 500);
}

// Déterminer qui joue (pour l'orientation)
$fenParts = explode(' ', $fen);
$turn = isset($fenParts[1]) ? $fenParts[1] : 'w';

// Réponse
echo json_encode([
    'success' => true,
    'puzzle' => [
        'id' => $puzzleId,
        'fen' => $fen,
        'solution' => $solution,
        'url' => $url,
        'opening' => $opening,
        'turn' => $turn,
        'level' => $level
    ]
]);
