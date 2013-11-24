var dropdown = d3.select("#json_sources")
var source = dropdown.node().options[dropdown.node().selectedIndex].value;
var tooltip = d3.select("#chart").append("div").attr("class", "tooltip").style("position", "absolute").style("z-index", "10").style("opacity", 0);

d3.json(source, function(data) {

	var market_list = d3.select('#market_menu').selectAll('li').data(data.markets);

	document.getElementById('market_title').innerHTML = data.markets[0].market;

	updateScales(0);

	var circles = svg.selectAll("circle").data(data.markets[0].stocks);

	var create = function(q){
		// svg.selectAll("circle")
		// .data(data.markets[q].stocks)
		circles
		.enter()
		.append("circle")
		.sort(function (a,b) {return d3.ascending(a.ticker, b.ticker);})
		.transition()
		.delay(function(d, i) {return i / circles.length * 100;})
		.duration(500)
		.attr({
			"class": "circles",
			cy: function(d) { return y(d.average); },
			cx: function(d) { return x(d.prob); },
			r: 20,
			ticker: function(d) { return d.ticker; },
			std: function(d) { return d.std; },
			prob: function(d) { return d.prob; },
			average: function(d) { return d.average; },
			"transform": "translate(70,30)"
			})
		.style("fill", function(d) { return color(d.ticker);})
		.style("opacity", 0.5)
		.attr("r", 8)
		.ease("elastic")
		.attr("id", function(d,i) {return i++;});
	};

	var stockList = function(u){
		d3.select('#stock_list')
			.selectAll('li')
			.data(data.markets[u].stocks)
		    .enter()
		    .append('li')
		    .sort(function (a,b) {return d3.ascending(a.ticker, b.ticker);})
		    .text(function(d) { return d.ticker; })
		    .style("color", function(d) { return color(d.ticker);})
		    .attr("id", function(d,i) {return i++;});
	}

	create();
	stockList(0);

	var marketClick = function(d) {
    	var market_id = $(this).attr('id');
    	svg.selectAll("circle").remove();
    	d3.selectAll('#stock_list li').remove();
    	svg.remove();
    	updateScales(market_id);
    	circles = svg.selectAll("circle").data(data.markets[market_id].stocks);
    	create(market_id);
    	attachHandlers();
    	stockList(market_id);
    	document.getElementById('market_title').innerHTML = data.markets[market_id].market;
	}

	market_list
	    .enter()
	    .append('li')
	    .text(function(d) { return d.market; })
	    .attr("id", function(d,i) {return i++;})
	    .on('click', marketClick);

	// what to do when we mouse over a bubble
	var mouseOn = function() { 
		//var circle = d3.select(this);
		var circle = d3.select(this);

		// Transition to increase size/opacity of bubble
		circle.transition()
			.duration(800).style("opacity", 1)
			.attr("r", 12).ease("elastic");

		// Append lines to bubbles that will be used to show the precise data points.
		//Line from prob
		svg.append("g")
			.attr("class", "guide")
			.append("line")
			.attr("x1", circle.attr("cx"))
			.attr("x2", circle.attr("cx"))
			.attr("y1", +circle.attr("cy") + 10)
			.attr("y2", h - margin.t - margin.b)
			.attr("transform", "translate(70,20)")
			.style("stroke", circle.style("fill"))
			.transition().delay(200).duration(400).styleTween("opacity", 
						function() { return d3.interpolate(0, .5); });

		//Line from average
		svg.append("g")
			.attr("class", "guide")
			.append("line")
			.attr("x1", +circle.attr("cx") )
			.attr("x2", 0)
			.attr("y1", circle.attr("cy"))
			.attr("y2", circle.attr("cy"))
			.attr("transform", "translate(70,30)")
			.style("stroke", circle.style("fill"))
			.transition().delay(200).duration(400).styleTween("opacity", 
						function() { return d3.interpolate(0, .5); });

		svg.selectAll("circle")
		.style("opacity", .2);
	
		//Populate tooltip text
		tooltip
			.html(
        		"Symbol: " + circle.attr("ticker") + "<br/>" +
        		"Probability: " + circle.attr("prob") + "%<br/>" +
        		"Average move: " + circle.attr("average") + "%<br/>" +
        		"STD: " + circle.attr("std")          
	    	)
	    	.transition()
	    	.duration(250)
	    	.style("display", "block")
	    	.style("opacity", 1);

		// function to move mouseover item to front of SVG stage, in case
		// another bubble overlaps it
		d3.selection.prototype.moveToFront = function() { 
		  return this.each(function() { 
			this.parentNode.appendChild(this); 
		  }); 
		};

		// skip this functionality for IE9, which doesn't like it
		if (!$.msie) {circle.moveToFront();	}
	};

	// what happens when we leave a bubble?
	var mouseOff = function() {
		var circle = d3.select(this);

		// go back to original size and opacity
		circle
			.transition()
			.duration(800).style("opacity", .5)
			.attr("r", 8).ease("elastic");

		// fade out guide lines, then remove them
		d3
			.selectAll(".guide").transition().duration(100).styleTween("opacity", function() { return d3.interpolate(.5, 0); })
			.remove();

		svg
			.selectAll("circle")
			.style("opacity", .5);

		tooltip
			.transition()
        	.delay(100)
        	.style("opacity", 0)
        	.style("display", "none");
	};

	var mouseMove = function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");};
	
	function attachHandlers(){
		circles.on("mouseover", mouseOn).on("mouseout", mouseOff).on("mousemove", mouseMove);
	}


	function updateScales(skale){

		var max_val_x = d3.max(data.markets[skale].stocks, function(d) {return +d.prob;});
		var max_val_y = d3.max(data.markets[skale].stocks, function(d) {return +d.average;});
		margin = {t:30, r:20, b:20, l:70 },
		w = parseInt(d3.select('#chart').style('width'), 10),
  		w = w - margin.l - margin.r,
		h = 700 - margin.t - margin.b,
		x = d3.scale.linear().domain([0, max_val_x+10]).range([0, w]),
		y = d3.scale.linear().domain([0, max_val_y+1]).range([h - 60, 0]),
		color = d3.scale.category10();

		svg = d3.select("#chart").append("svg")
		.attr("width", w + margin.l + margin.r)
		.attr("height", h + margin.t + margin.b)
		.attr('transform', 'translate(80, -60)');

		xAxis = d3.svg.axis()
			.scale(x)
			.ticks(10)
			.orient("bottom");

		yAxis = d3.svg.axis()
			.scale(y)
			.ticks(20)
			.orient("left");

		// draw axes and axis labels
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + margin.l + "," + (h - 60 + margin.t) + ")")
			.transition()
			.duration(1000)
			.call(xAxis)
			.style("fill", "#ccc");

		svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + margin.l + "," + margin.t + ")")
			.transition()
			.duration(1000)
			.call(yAxis)
			.style("fill", "#ccc");

		svg.append("text")
			.attr("class", "x label")
			.attr("text-anchor", "end")
			.attr("x", w / 2 + 100)
			.attr("y", h + margin.t)
			.text("Probability in percent")
			.style("fill", "#ccc");

		svg.append("text")
			.attr("class", "y label")
			.attr("text-anchor", "end")
			.attr("x", (-h + margin.b + 100) / 2)
			.attr("y", 0)
			.attr("dy", ".75em")
			.attr("transform", "rotate(-90)")
			.text("Average move in percent")
			.style("fill", "#ccc");
	};

	attachHandlers();

});

		