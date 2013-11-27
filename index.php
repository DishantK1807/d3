<!DOCTYPE html>
<html>
  	<head>
    	<title>d3.js example</title>
    	<script type="text/javascript" src="http://d3js.org/d3.v3.min.js"></script>
  		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
  		<link rel="stylesheet/less" type="text/css" href="less/main.less" />
	</head>
	<body>
		<div id="chart_container">
			<select id="json_sources" name="json_sources">
				<?php 
					$dir= __DIR__ . DIRECTORY_SEPARATOR . 'json';
					$iterator = new DirectoryIterator($dir);
					foreach ($iterator as $fileinfo) {
					    if($fileinfo->isFile()) {
					        echo '<option value="json/' . $fileinfo->getFilename() . '">' . $fileinfo->getFilename() . '</option>';
					    }
					}
				?> 
			</select>
			<div class="sidebar">
				<h2>Markets</h2>
				<ul id="market_menu"></ul><br>
				<h2>Stocks</h2>
				<ul id="stock_list"></ul>
			</div>
			<div class="chart_wrapper">
				<h2 id="market_title"></h2>
				<div id="chart"></div>
			</div>
			<div class="clearFix"></div>
		</div>
		<script type="text/javascript" src="js/less.js"></script>
		<script type="text/javascript" src="js/main.js"></script>
	</body>
</html>