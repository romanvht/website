<?php
$githubToken = getenv('GITHUB_TOKEN');
$action = isset($_GET['action']) ? $_GET['action'] : null;
$repo = isset($_GET['repo']) ? $_GET['repo'] : null;

if (!$action) {
    echo json_encode(['error' => 'No action provided']);
    exit;
}

switch ($action) {
    case 'list_repos':
        $url = "https://api.github.com/users/romanvht/repos";
        $response = getRepos($url, $githubToken);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($response);
    break;

    case 'get_readme':
        $url = "https://api.github.com/repos/romanvht/{$repo}/readme";
        $response = getRepo($url, $githubToken);

        header('Content-Type: text/plain; charset=utf-8');
        echo $response;
    break;
}

function getRepo($url, $token) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');

    $headers = [
        'Authorization: Bearer ' . $token,
        'Accept: application/vnd.github.v3.raw',
        'User-Agent: romanvht.ru api'
    ];

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $result = curl_exec($ch);
    $error  = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    if ($error) {
        echo json_encode([
            'error' => true,
            'message' => $error,
            'http_code' => $httpCode
        ]);
        exit;
    }

    return $result;
}

function getRepos($url, $token) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

    $headers = [
        'Authorization: Bearer ' . $token,
        'Accept: application/vnd.github.v3+json',
        'User-Agent:  romanvht.ru api'
    ];

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $result = curl_exec($ch);
    $error  = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    if ($error) {
        return [
            'error' => true,
            'message' => $error,
            'http_code' => $httpCode
        ];
    }

    $decoded = json_decode($result, true);
    if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
        return [
            'raw_response' => $result,
            'error' => false,
            'http_code' => $httpCode
        ];
    }

    return [
        'error' => false,
        'repos' => $decoded,
        'http_code' => $httpCode
    ];
}
