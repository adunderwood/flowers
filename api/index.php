<?php
$env = parse_ini_file('.env');

$protocol = $env["API_PROTOCOL"];
$hostname = $env["API_URL"];
$port = $env["API_PORT"];

$url = $protocol . "://" . $hostname . ":" . $port;

// create curl resource
$ch = curl_init();

// set url
curl_setopt($ch, CURLOPT_URL, $url);

//return the transfer as a string
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

// $output contains the output string
$output = curl_exec($ch);

echo $output;

// close curl resource to free up system resources
curl_close($ch);
?>
