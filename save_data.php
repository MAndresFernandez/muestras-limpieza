<?php
// save_data.php
header('Content-Type: application/json');

// Configuración de seguridad básica
// En un entorno de producción, considerar usar variables de entorno o un archivo de config seguro.
$SECRET_TOKEN = 'redrabbit_admin_token_2025';

// Verificar el método de solicitud
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// Obtener los headers
$headers = getallheaders();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';

// Validar el token
if ($token !== $SECRET_TOKEN) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

// Recibir el cuerpo de la petición (el JSON completo)
$input_data = file_get_contents('php://input');
$json_data = json_decode($input_data, true);

if ($json_data === null && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON provided']);
    exit;
}

// Guardar los datos de vuelta en data.json
$file_path = 'data.json';
$result = file_put_contents($file_path, json_encode($json_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

if ($result === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to write to data.json']);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Data saved successfully']);
?>
