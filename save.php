<?php

function save_posted_data($data_file, $data) {
	$f = fopen($data_file, "w");
	if (!preg_match("/^<\?xml /i", $data)) {
		fwrite($f, '<?xml version="1.0" encoding="utf-8"?>');
		fwrite($f, "\n");
	}
	fwrite($f, $data);
	fwrite($f, "\n");
	fclose($f);
}

function rotate_archives($data_file) {
	for ($i=10; --$i; $files[] = "$data_file.$i");
	$files[] = $data_file;
	while ($files[1]) {
		if (file_exists($files[1]))
			rename($files[1], $files[0]);
		array_shift($files);
	}
}

$data_file = "data.xml";
rotate_archives($data_file);
save_posted_data($data_file, $HTTP_RAW_POST_DATA);
echo "size=" . filesize($data_file) . ", md5=" . md5_file($data_file);
?>
