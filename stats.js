// utf-8

function create_stats_view(dest) {
	var div = create_div(dest, "stats");
	var txt = "";
	txt += "Totaux";
	txt += "<div><u>Jours</u></div>";
	txt += "<div><u>Heures</u></div>";
	txt += "Moyennes";
	txt += "<div><u>Heures <u>/ j</u></u></div>";
	txt += "<div><u>Projets<u>/ j</u></u></div>";
	div.innerHTML = txt;
	div.data_map = {
		tot_days: 0, tot_hours: 1, avg_hours_day: 2,
		avg_projs_day: 3 };
	create_counters(div);
	document.stats = div;
	update_stats();
}

function create_counters(div) {
	var map = div.data_map;
	for (var i in map) {
		var span = document.createElement("span");
		span.id = i;
		div.children[map[i]].appendChild(span);
	}
}

function update_stats() {
	var table = document.table;
	if (table.children.length == 1) {
		for (var i in document.stats.data_map)
			set_value(i, "--");
		return;
	}
	var tot_days = 0;
	var projects = {};
	for (var i=1, state; i < table.children.length; i++) {
		state = table.children[i].state;
		prev  = table.children[i-1].state;
		if (state.date != prev.date)
			tot_days += 1;
		if (!projects[state.project])
			projects[state.project] = state.duration;
		else
			projects[state.project] += state.duration;
	}
	var nb_entries = table.children.length - 1;
	var nb_projects = tot_hours = 0;
	for (var p in projects) {
		nb_projects += 1;
		tot_hours += projects[p];
	}
	set_value("tot_days", tot_days);
	set_value("tot_hours", tot_hours.toFixed(0));
	set_value("avg_hours_day",  (tot_hours/tot_days).toFixed(1));
	set_value("avg_projs_day",  (nb_entries/tot_days).toFixed(1));
}

function set_value(id, val) {
	document.getElementById(id).innerHTML = val;
}
