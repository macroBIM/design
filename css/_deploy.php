<?php
/*
  css/_deploy.php — GitHub(macroBIM/design) 의 css/ 폴더를 이 서버의 /www/css/ 로 가져온다.
  사이트 전체가 같이 쓰는 공용 파일 자리 (머리줄 · 푸터 site.css 등).

  서버에 한 번만 올린다:  /www/css/_deploy.php   (/www/css 폴더는 PHP 가 쓸 수 있게 707)
  키는 스토어와 같은 것:  /config/store_deploy.php 의 key
  design 저장소는 공개라 GitHub 토큰은 필요 없다.

  design 저장소의 .github/workflows/deploy-css.yml 이 부른다.
    POST https://www.macrobim.com/css/_deploy.php
    헤더  X-Deploy-Key: <key>
          X-Deploy-Branch: main | dev
  main → /www/css/      (실제 사이트)
  dev  → /www/css/dev/  (시험: /dev/ 가 부른다. 실제 사이트에 섞이지 않게)
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

$branch = isset($_SERVER['HTTP_X_DEPLOY_BRANCH']) ? $_SERVER['HTTP_X_DEPLOY_BRANCH'] : 'main';
if ($branch !== 'main' && $branch !== 'dev') deploy_fail(400, 'branch must be main or dev');
$target = $branch === 'dev' ? __DIR__ . '/dev' : __DIR__;
$repo   = 'macroBIM/design';
$subdir = 'css';
$self   = basename(__FILE__);

$tmpZip = tempnam(sys_get_temp_dir(), 'css_');
$fh = fopen($tmpZip, 'wb');
$ch = curl_init('https://api.github.com/repos/' . $repo . '/zipball/' . rawurlencode($branch));
curl_setopt_array($ch, array(
    CURLOPT_FILE           => $fh,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS      => 5,
    CURLOPT_CONNECTTIMEOUT => 20,
    CURLOPT_TIMEOUT        => 120,
    CURLOPT_HTTPHEADER     => array('Accept: application/vnd.github+json', 'User-Agent: macrobim-css-deploy')
));
$ok     = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err    = curl_error($ch);
curl_close($ch);
fclose($fh);
if (!$ok || $status !== 200) { @unlink($tmpZip); deploy_fail(502, 'download failed (HTTP ' . $status . ') ' . $err); }

$zip = new ZipArchive();
if ($zip->open($tmpZip) !== true) { @unlink($tmpZip); deploy_fail(500, 'zip open failed'); }

$ver = $branch;
$first = $zip->getNameIndex(0);
if ($first !== false && preg_match('/-([0-9a-f]{7,})\//', $first, $m)) $ver = substr($m[1], 0, 7);

$written = 0;
for ($i = 0; $i < $zip->numFiles; $i++) {
    $name  = $zip->getNameIndex($i);
    $parts = explode('/', $name, 2);
    if (count($parts) < 2) continue;
    $rel = $parts[1];
    if (strpos($rel, $subdir . '/') !== 0) continue;
    $rel = (string)substr($rel, strlen($subdir) + 1);
    if ($rel === '' || substr($rel, -1) === '/') continue;
    if (strpos($rel, 'dev/') === 0) continue;   // 서버의 dev/ 자리는 dev 브랜치 몫
    if ($rel === $self || strpos($rel, '..') !== false || $rel[0] === '/' || strpos($rel, "\0") !== false) continue;

    $data = $zip->getFromIndex($i);
    if ($data === false) { $zip->close(); @unlink($tmpZip); deploy_fail(500, 'read failed: ' . $rel); }

    $dest = $target . '/' . $rel;
    $dir  = dirname($dest);
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) { $zip->close(); @unlink($tmpZip); deploy_fail(500, 'mkdir failed: ' . $rel); }
    if (is_file($dest) && md5_file($dest) === md5($data)) continue;
    $tmp = $dest . '.deploy-tmp';
    if (file_put_contents($tmp, $data) === false || !rename($tmp, $dest)) {
        @unlink($tmp); $zip->close(); @unlink($tmpZip);
        deploy_fail(500, 'write failed: ' . $rel);
    }
    $written++;
}
$zip->close();
@unlink($tmpZip);

echo "OK written=" . $written . " branch=" . $branch . " v=" . $ver . "\n";
