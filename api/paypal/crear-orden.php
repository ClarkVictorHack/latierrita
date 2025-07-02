<?php
// Configuración de PayPal

$clientId = 'BAA9dIdaO89f8zanzO-8S1Rsz7F7Vx16kiP2IfcmjZhonAuzDpwE8MPgz0CHZr4f0vAgIGj95q-CqJYxho';
$clientSecret = 'EN6SKqkXYJHOatV0n0tT_3jb1OpVqJuPsc-92ag4tgW5_Nl2R9fTNEP8hAPZIdiOa8RJbDlHfSpD_6y8';
$paypalApi = 'https://api-m.paypal.com'; // Producción

// Obtener datos del pedido desde el frontend
$body = json_decode(file_get_contents('php://input'), true);
$total = isset($body['producto']['precio']) ? floatval($body['producto']['precio']) : 0.0;

if ($total <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Total inválido']);
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

// Crear la orden en PayPal
$order = [
    'intent' => 'CAPTURE',
    'purchase_units' => [
        [
            'amount' => [
                'currency_code' => 'USD',
                'value' => number_format($total, 2, '.', '')
            ],
            'description' => $body['producto']['nombre'] ?? 'Pedido La Tierrita'
        ]
    ]
];

$ch = curl_init("$paypalApi/v2/checkout/orders");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: Bearer $accessToken"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($order));
$result = curl_exec($ch);
if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al crear la orden']);
    exit;
}
curl_close($ch);

header('Content-Type: application/json');
echo $result;
