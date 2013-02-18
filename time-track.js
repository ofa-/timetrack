// utf-8

var local_storage_item = "time-track.data";

function init() {
	var container = create_div(document.body, "container");
	create_inputs_view(container);
	create_table_view(container);
	handle_options(location.search.substr(1))
	populate_table_view();
	update_puncher();
}

function handle_options(opt) {
	if (opt == "*") {
		set_local_store(load_data("data.xml"));
		show_table(true);
	}
	else
	if (opt == "0") {
		set_local_store(empty_data_doc());
	}
	else
	if (opt.match(/^[1-9]$/)) {
		set_local_store(load_data("data.xml." + opt));
		show_table(true);
	}
	else
	if (opt == "t") {
		show_table(true);
	}
}

function add_row(table, data) {
	var row = document.createElement("tr");
	if (table.children.length == 1)
		table.appendChild(row);
	else
		table.insertBefore(row, table.children[1]);
	update_row(row, data, true);
	return row;
}

function update_row(row, data, create) {
	row.state = compute_state(row, data);
	var state = row.state;
	var content = [
		date_str(state.date),
		time_str(state.start),
		num_str(state.duration),
		state.project,
		hd_str(state.sum_hours, state.sum_days),
	];
	for (var i in content) {
		if (create)
			row.appendChild(document.createElement("td"));
		row.children[i].innerHTML = content[i];
	}
}

function hd_str(hours, days) {
	if (! Math.round(hours))
		return "";
	else
		return hours.toFixed(1) +" / " + days + "j";
}

function num_str(n) {
	return parseFloat(n) ? n.toFixed(2) : "";
}

function date_str(d) {
	d = new Date(d);
	if (!d.getTime())
		return "";
	return pad(d.getDate()) + "." + pad(d.getMonth()+1) + "." +
		pad(d.getFullYear() - 2000);
}

function iso_date(d) {
	d = d.split('.');
	d[2] = 2000 + (d[2] ? d[2]|0 : new Date().getFullYear()-2000);
	return new Date(d[2]+"/"+d[1]+"/"+d[0]).getTime();
}

function iso_date_str(d) {
	if (d.indexOf('.') != -1)
		d = iso_date(d);
	d = new Date(d);
	return d.getFullYear()+"/"+pad(d.getMonth()+1)+"/"+pad(d.getDate());
}

function time_str(time) {
	time = (time+":0:0:0").split(":");
	return pad(time[0])+":"+pad(time[1]);
}

function pad(x) {
	x = "00" + x;
	return x.substring(x.length-2);
}

function trim(s) {
	return s.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
}

function compute_state(row, data) {
	var state = {};
	state.date	= iso_date_str(data.date);
	state.start	= time_str(data.start);
	state.duration	= parseFloat("0"+data.duration);
	state.project	= trim(data.project);
	state.sum_hours = state.duration;
	state.sum_days  = 1;
	
	if (row.project_butt || data.duration == "--") {
		state.duration = "--";
		state.sum_hours = 0;
		return state;
	}

	for (var r=row; r=r.nextSibling; ) {
		if (r.state.project == state.project) {
			state.sum_hours += r.state.sum_hours;
			state.sum_days = r.state.sum_days;
			if (r.state.date != state.date)
				state.sum_days += 1;
			break;
		}
	}
	return state;
}

function create_div(dest, id) {
	var e = document.createElement("div");
	e.id = id;
	dest.appendChild(e);
	return e;
}

function create_table_view(dest) {
	var div = create_div(dest, "data");
	var txt = "<table style='display:none'>";
	txt += "<tr>";
	txt += "<td>Date</td>";
	txt += "<td>Heure</td>";
	txt += "<td>Durée</td>";
	txt += "<td>Projet</td>";
	txt += "<td>Cumul</td>";
	txt += "</tr>";
	txt += "</table>";
	
	div.innerHTML = txt;
	document.table = div.firstChild;
	document.table.data_map = { date: 0, start: 1, duration: 2, project: 3 };
	document.table.firstChild.state = {};
}

function create_inputs_view(dest) {
	var div = create_div(dest, "inputs");
	var txt = "";
	txt += "<div id='puncher'></div>";
	txt += "<div id='function_buttons' style=''>";
	txt += "<input value='+' type='button' id='add_button'/>";
	txt += "<input value='E' type='button' id='edit_button'/>";
	txt += "<input value='P' type='button' id='park_button'/>";
	txt += "<input value='S' type='button' id='stats_button'/>";
	txt += "<input value='T' type='button' id='table_button'/>";
	txt += "</div>";
	txt += "<div id='edit_mode' style='display:none'>";
	txt += "<input type='input' style='display:none' id='project_name'/>";
	txt += "<input value='save'   type='button' id='save_button'/>";
	txt += "<input value='cancel' type='button' id='cancel_button'/>";
	txt += "</div>";

	div.innerHTML = txt;
	document.getElementById("add_button").onclick = add_button_click;
	document.getElementById("edit_button").onclick = edit_button_click;
	document.getElementById("save_button").onclick = end_edit;
	document.getElementById("cancel_button").onclick = end_edit;
	document.getElementById("table_button").onclick = toggle_table;
}

function toggle_table() {
	show_table("toggle");
}

function show_table(show) {
	var main  = document.getElementById("container");
	var table = document.table.style;
	if (show == "toggle")
		show = (table.display == "none");
	if (show) {
		table.display = "";
		main.setAttribute("class", "fit-table");
	}
	else {
		table.display = "none";
		main.setAttribute("class", "");
	}
}

function inputs_keydown(e) {
	var keyCode = e ? (e.which ? e.which : e.keyCode) : event.keyCode;
	if (keyCode == 13)
		document.getElementById("save_button").click();
	if (keyCode == 27)
		document.getElementById("cancel_button").click();
}

function edit_function_mode(on) {
	func_butts = document.getElementById("edit_button").parentNode;
	edit_butts = document.getElementById("save_button").parentNode;
	if (on) {
		func_butts.style.display = "none";
		edit_butts.style.display = "";
		document.body.onkeydown = inputs_keydown;
	}
	else {
		func_butts.style.display = "";
		edit_butts.style.display = "none";
		document.body.onkeydown = null;
	}
	document.edit_mode = on;
}

function add_button_click(e) {
	var input = document.getElementById("project_name");
	input.style.display = "";
	input.value = "";
	input.style.width = "40%";
	set_save_cancel_width("25%");
	edit_function_mode(true);
	input.focus();
}

function edit_button_click(e) {
	var table = document.table;
	if (table.children.length == 1) {
		warn("rien à editer");
		return;
	}
	table.was_hidden = (table.style.display == "none");
	if (table.was_hidden)
		show_table(true);
	transform_table(table);
	edit_function_mode(true);
	var dur_cell = table.children[1].children[table.data_map.duration];
	dur_cell.firstChild.focus();
}

function end_edit(e) {
	var butt = e.target;
	var save = (butt.id == "save_button");
	var input = butt.parentNode.firstChild;
	var add_mode = (input.style.display == "");

	if (add_mode)
		end_add_project(save, input);
	else
		end_edit_table(save);

	edit_function_mode(false);
	if (save && add_mode)
		document.getElementById("add_button").focus();
}

function end_edit_table(save) {
	var table = document.table;
	var show = ! table.was_hidden;
	if (save)
		save_edits(table);
	else
		restore_table(table);
	show_table(show);
}

function end_add_project(save, input) {
	var table = document.table;
	if (save) {
		add_entry(table, input.value);
		update_puncher();
		save_table(table);
	}
	input.style.display = "none";
	set_save_cancel_width("50%");
}

function set_save_cancel_width(width) {
	var b;
	b = document.getElementById("save_button");
	b.style.width = width;
	b = document.getElementById("cancel_button");
	b.style.width = width;
}

function add_entry(table, project) {
	var now = new Date();
	var data  = {
		date: date_str(now),
		start: now.toTimeString(),
		duration: "",
		project: project
	};
	return add_row(table, data);
}

function save_edits(table) {
	transform_table(table);
	update_values(table);
	update_puncher();
	save_table(table);
}

function restore_table(table) {
	var div  = table.parentNode;
	var dest = div.parentNode;
	var tmp  = document.createElement("div");
	create_table_view(tmp);
	populate_table_view();
	update_puncher();
	dest.replaceChild(tmp.firstChild, div);
}

function warn(message) {
	var butt = document.getElementById("add_button");
	butt.saved = butt.value;
	butt.value = message;
	setTimeout(function () { butt.value = butt.saved; }, 1000);
}

function transform_table(table) {
	for (var i=1; i < table.children.length; i++) {
		var row = table.children[i];
		for (var x in table.data_map)
			toggle_table_elt(row.children[table.data_map[x]]);
		toggle_row_butt(table.children[i]);
	}
}

function update_values(table) {
	var row = table.lastChild;
	while(row.previousSibling) {
		update_row(row, data_from_row(row));
		row = row.previousSibling;
	}
}

function save_table(table) {
	var doc = empty_data_doc();
	var row = table.lastChild;
	while(row.previousSibling) {
		add_data_item(doc, row.state, table.data_map);
		row = row.previousSibling;
	}
	save_data(doc);
}

function data_from_row(row) {
	var data = {};
	var data_map = row.parentNode.data_map;
	for (x in data_map)
		data[x] = row.children[data_map[x]].innerHTML;
	return data;
}

function toggle_table_elt(elt) {
	if (elt.firstChild && elt.firstChild.nodeType != 3)
		elt.innerHTML = elt.firstChild.value;
	else
		elt.innerHTML = "<input value='"+elt.innerHTML+"'/>";
}

function toggle_row_butt(row) {
	var butt = row.lastChild.lastChild;
	if (butt && butt.value) {
		butt.parentNode.removeChild(butt);
	}
	else {
		butt = document.createElement("input");
		butt.type = "button";
		butt.value = "x";
		butt.id = "del_button";
		butt.onclick = row_delete_click;
		row.lastChild.appendChild(butt);
	}
}

function row_delete_click(e) {
	var row  = e.target.parentNode.parentNode;
	if (row.project_butt)
		toggle_puncher_butt(row.project_butt);
	row.parentNode.removeChild(row);
}

function sort_table(col) {
	var table = document.table;
	var sorter = [];
	for (var i=1, row; i<table.children.length; i++) {
		row = table.children[i];
		sorter.push({r:row, v:row.children[table.data_map[col]]});
	}
	sorter.sort(function(a, b) {return a.v - b.v;});
	for (var i=0; i<sorter.length; i++)
		table.appendChild(sorter[i].r);
}

function update_puncher() {
	var puncher = document.getElementById("puncher");
	var projects = table_get_projects();
	var txt = "";
	for (var p in projects) {
		txt += "<input type='button' value='" + p + "'/> ";
	}
	puncher.innerHTML = txt;
	var butts = puncher.getElementsByTagName("input");
	for (var i=0, butt; i < butts.length; i++) {
		butts[i].onclick = puncher_click;
	}
	puncher_set_current(butts, projects);
}

function table_get_projects() {
	var table = document.table;
	var projects = {};
	for (var i=1, row, proj; i<table.children.length; i++) {
		row = table.children[i];
		proj = row.state.project;
		if (projects[proj])
			continue;
		if (row.state.duration == "--")
			projects[proj] = row;
		else
			projects[proj] = false;
	}
	return projects;
}

function puncher_set_current(butts, projects) {
	for (var i=0, butt, row; i<butts.length; i++) {
		butt = butts[i];
		row = projects[butt.value];
		if (row) {
			butt.row = row;
			toggle_puncher_butt(butt);
			return;
		}
	}
}

function puncher_click(e) {
	var butt = e.target;
	var table = document.table;

	if (document.edit_mode)
		return;

	if (butt.active) {
		var data = data_from_row(butt.row);
		var nb_ms = new Date() - (butt.parentNode.start|0);
		if (nb_ms > 5000) {
			var t = butt.row.state.date + " " + data.start + ":00";
			nb_ms = new Date() - new Date(t);
		}
		data.duration = (nb_ms/1000/60/60).toFixed(2);
		butt.row.project_butt = null;
		update_row(butt.row, data);
	}
	else {
		if (butt.parentNode.current)
			butt.parentNode.current.click();
		butt.row = add_entry(table, butt.value);
		butt.parentNode.start = new Date();
	}
	toggle_puncher_butt(butt);
	save_table(table);
}

function toggle_puncher_butt(butt) {
	if (butt.active) {
		butt.active = false;
		butt.parentNode.current = null;
		butt.row.project_butt = null;
		butt.row.setAttribute("class", "");
		butt.setAttribute("class", "");
	}
	else {
		butt.active = true;
		butt.parentNode.current = butt;
		butt.row.project_butt = butt;
		butt.row.setAttribute("class", "running");
		butt.setAttribute("class", "running");
	}
}

function populate_table_view() {
	var table = document.table;
	var data  = get_local_store();
	if (!data) data = load_data("data.xml");
	var items = data.getElementsByTagName("item");
	for (var i=0, data; i<items.length; i++) {
		data = data_from_item(items[i]);
		add_row(table, data);
	}
}

function load_data(filename) {
	try {
		return load_from_server(filename);
	}
	catch (e) {
		return empty_data_doc();
	}
}

function save_data(doc) {
	set_local_store(doc);
	try {
		save_to_server(doc);
	}
	catch (e) {
	}
}

function load_from_server(data_file) {
	var req = new XMLHttpRequest();
	req.open("GET", data_file, false);
	req.send(null);
	req.responseXML.getElementsByTagName("data")[0].nodeName;
	return req.responseXML;
}

function save_to_server(doc) {
	var req = new XMLHttpRequest();
	req.open("POST", "save.php", true);
	req.send(doc);
}

function empty_data_doc() {
	return new DOMParser().parseFromString("<data/>", "text/xml");
}

function add_data_item(doc, data_item, data_map) {
	var data = doc.documentElement;
	data.appendChild(data.parentNode.createElement("item"));
	for (var i in data_map)
		data.lastChild.setAttribute(i, data_item[i]);
}

function data_from_item(xml_item) {
	var data_item = {};
	var attr = xml_item.attributes;
	for (var i=0; i<attr.length; i++)
		data_item[attr[i].name] = attr[i].value;
	return data_item;
}

function get_local_store() {
	var xml_str = localStorage.getItem(local_storage_item);
	if (xml_str)
		return new DOMParser().parseFromString(xml_str, "text/xml");
	else
		return null;
}

function set_local_store(xml_doc) {
	var xml_str = new XMLSerializer().serializeToString(xml_doc.documentElement);
	localStorage.setItem(local_storage_item, xml_str);
}

function clear_local_store() {
	localStorage.setItem(local_storage_item, "");
}
