<?php
// Configuración de PayPal

// Carga las credenciales desde un archivo externo no versionado
// Copia 'credenciales-privadas.example.php' como 'credenciales-privadas.php'
// y coloca allí tu Client ID y Secret reales
require_once __DIR__ . '/credenciales-privadas.php';

// Configuración de MySQL
$db_host = 'localhost';
$db_user = 'TU_USUARIO_DB';
$db_pass = 'TU_PASSWORD_DB';
$db_name = 'TU_NOMBRE_DB';

// Obtener el orderID desde el frontend
$body = json_decode(file_get_contents('php://input'), true);
$orderID = $body['orderID'] ?? '';

if (!$orderID) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta orderID']);
    exit;
}

// Obtener access token de PayPal
function getAccessToken($clientId, $clientSecret, $paypalApi)
{
    $ch = curl_init("$paypalApi/v1/oauth2/token");
    curl_setopt($ch, CURLOPT_USERPWD, "$clientId:$clientSecret");
    curl_setopt($ch, CURLOPT_POSTFIELDS, "grant_type=client_credentials");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Accept: application/json", "Accept-Language: en_US"]);
    $result = curl_exec($ch);
    if (curl_errno($ch))
        return false;
    $json = json_decode($result, true);
    curl_close($ch);
    return $json['access_token'] ?? false;
}

$accessToken = getAccessToken($clientId, $clientSecret, $paypalApi);
if (!$accessToken) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo obtener el token de PayPal']);
    exit;
}

// Capturar la orden en PayPal
$ch = curl_init("$paypalApi/v2/checkout/orders/$orderID/capture");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: Bearer $accessToken"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, '{}');
$result = curl_exec($ch);
if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al capturar la orden']);
    exit;
}
curl_close($ch);

$orderData = json_decode($result, true);

if (!isset($orderData['status']) || $orderData['status'] !== 'COMPLETED') {
    http_response_code(400);
    echo json_encode(['error' => 'El pago no fue completado']);
    exit;
}

// Guardar la venta en MySQL
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO ventas_paypal (order_id, payer_email, amount, status, created_at) VALUES (?, ?, ?, ?, NOW())");
$payer_email = $orderData['payer']['email_address'] ?? '';
$amount = $orderData['purchase_units'][0]['payments']['captures'][0]['amount']['value'] ?? 0;
$status = $orderData['status'] ?? '';
$stmt->bind_param("ssds", $orderID, $payer_email, $amount, $status);
$stmt->execute();
$stmt->close();
$conn->close();

header('Content-Type: application/json');
echo json_encode(['success' => true, 'orderID' => $orderID]);
