<?php
/*
  dev/_deploy.php — GitHub(macroBIM/design) dev 브랜치를 이 서버의 /www/dev/ 로 가져온다.

  서버에 한 번만 올린다:  /www/dev/_deploy.php   (/www/dev 폴더는 PHP 가 쓸 수 있게 707)
  키는 스토어와 같은 것을 쓴다:  /config/store_deploy.php 의 key
  design 저장소는 공개라 GitHub 토큰은 필요 없다.

  design 저장소의 .github/workflows/deploy-dev.yml 이 dev 에 올라올 때마다 부른다.
    POST https://www.macrobim.com/dev/_deploy.php
    헤더  X-Deploy-Key: <key>
  가져오는 것: 저장소의 dev/ 아래 파일 + 맨 위의 layout_style.css, layout_body_test.js
  이 파일(_deploy.php)은 건드리지 않고, 저장소에 없는 서버 파일은 지우지 않는다.
*/

header('Content-Type: text/plain; charset=utf-8');

function deploy_fail($code, $msg) {
    http_response_code($code);
    echo "FAIL " . $msg . "\n";
    exit;
}

$configPath = dirname(dirname(__DIR__)) . '/config/store_deploy.php';
if (!is_file($configPath)) deploy_fail(500, 'config not found');
$cfg = require $configPath;
if (!is_array($cfg) || empty($cfg['key'])) deploy_fail(500, 'config incomplete');

if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') deploy_fail(405, 'POST only');
$given = isset($_SERVER['HTTP_X_DEPLOY_KEY']) ? $_SERVER['HTTP_X_DEPLOY_KEY'] : '';
if (!is_string($given) || !hash_equals((string)$cfg['key'], $given)) deploy_fail(403, 'bad key');
if (!function_exists('curl_init') || !class_exists('ZipArchive')) deploy_fail(500, 'curl or ZipArchive missing');

$repo   = 'macroBIM/design';
$branch = 'dev';
$extra  = array('layout_style.css', 'layout_body_test.js');
$self   = basename(__FILE__);

$tmpZip = tempnam(sys_get_temp_dir(), 'dev_');
$fh = fopen($tmpZip, 'wb');
$ch = curl_init('https://api.github.com/repos/' . $repo . '/zipball/' . rawurlencode($branch));
curl_setopt_array($ch, array(
    CURLOPT_FILE           => $fh,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS      => 5,
    CURLOPT_CONNECTTIMEOUT => 20,
    CURLOPT_TIMEOUT        => 120,
    CURLOPT_HTTPHEADER     => array('Accept: application/vnd.github+json', 'User-Agent: macrobim-dev-deploy')
));
$ok     = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err    = curl_error($ch);
curl_close($ch);
fclose($fh);
if (!$ok || $status !== 200) { @unlink($tmpZip); deploy_fail(502, 'download failed (HTTP ' . $status . ') ' . $err); }

$zip = new ZipArchive();
if ($zip->open($tmpZip) !== true) { @unlink($tmpZip); deploy_fail(500, 'zip open failed'); }

// 최상위 폴더 이름 "macroBIM-design-<sha>" 의 sha 를 캐시 버전으로 쓴다
$ver = 'dev';
$first = $zip->getNameIndex(0);
if ($first !== false && preg_match('/-([0-9a-f]{7,})\//', $first, $m)) $ver = substr($m[1], 0, 7);

$written = 0;
for ($i = 0; $i < $zip->numFiles; $i++) {
    $name  = $zip->getNameIndex($i);
    $parts = explode('/', $name, 2);
    if (count($parts) < 2 || $parts[1] === '' || substr($parts[1], -1) === '/') continue;
    $rel = $parts[1];

    if (strpos($rel, 'dev/') === 0) {
        $out = (string)substr($rel, 4);
    } elseif (in_array($rel, $extra, true)) {
        $out = $rel;
    } else {
        continue;
    }
    if ($out === '' || $out === $self || strpos($out, '..') !== false || $out[0] === '/' || strpos($out, "\0") !== false) continue;

    $data = $zip->getFromIndex($i);
    if ($data === false) { $zip->close(); @unlink($tmpZip); deploy_fail(500, 'read failed: ' . $rel); }
    if ($out === 'index.html') $data = str_replace('__V__', $ver, $data);

    $dest = __DIR__ . '/' . $out;
    $dir  = dirname($dest);
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) { $zip->close(); @unlink($tmpZip); deploy_fail(500, 'mkdir failed: ' . $out); }
    if (is_file($dest) && md5_file($dest) === md5($data)) continue;
    $tmp = $dest . '.deploy-tmp';
    if (file_put_contents($tmp, $data) === false || !rename($tmp, $dest)) {
        @unlink($tmp); $zip->close(); @unlink($tmpZip);
        deploy_fail(500, 'write failed: ' . $out);
    }
    $written++;
}
$zip->close();
@unlink($tmpZip);

echo "OK written=" . $written . " branch=" . $branch . " v=" . $ver . "\n";
