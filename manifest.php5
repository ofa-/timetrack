<?php
  header('Content-Type: text/cache-manifest');
  echo "CACHE MANIFEST\n";
  $my_name = basename($_SERVER["SCRIPT_NAME"]);
  $network = "save.php|data.xml";
  $hashes = "";
  $dir = new RecursiveDirectoryIterator("./");
  foreach(new RecursiveIteratorIterator($dir) as $file) {
	if (!$file->IsFile())
		continue;
	if (preg_match(":$my_name|$network:", $file))
		continue;
	echo substr($file, 2) . "\n";
	$hashes .= md5_file($file);
  }
  $hashes .= md5_file("$my_name"); 
  $trailer = "NETWORK:|$network|*|# $my_name|# hash: " . md5($hashes);
  echo join("\n", explode("|", $trailer)) . "\n";
?>
