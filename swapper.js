var fileInput, li_prototype, playlist_ol, p_scale, ams_max_file_id, my_files = [];
const swpr_gcode = `;


`,
	ini_gcode = ";\n",
	model_settings_template = '<?xml version="1.0" encoding="UTF-8"?>\n<config>\n  <plate>\n    <metadata key="plater_id" value="1"/>\n    <metadata key="plater_name" value="Automatic Plate Changing"/>\n    <metadata key="locked" value="false"/>\n    <metadata key="gcode_file" value="Metadata/plate_1.gcode"/>\n    <metadata key="thumbnail_file" value="Metadata/plate_1.png"/>\n    <metadata key="top_file" value="Metadata/top_1.png"/>\n    <metadata key="pick_file" value="Metadata/pick_1.png"/>\n    <metadata key="pattern_bbox_file" value="Metadata/plate_1.json"/>\n  </plate>\n</config> ';
var enable_md5 = !0,
	open_in_bbs = !1,
	last_file = !1,
	instant_processing = !1;
 
function initialize_page() {
	fileInput = document.getElementById("file"), li_prototype = document.getElementById("list_item_prototype"), playlist_ol = document.getElementById("playlist_ol"), err = document.getElementById("err"), p_scale = document.getElementById("progress_scale"), update_progress(-1);
	var e, t;
	document.body;
	const a = document.getElementById("b1"), //drop_zone
		n = document.getElementById("b1");
	["dragend", "dragleave", "drop"].forEach(e => {
		a.addEventListener(e, dragOutHandler, event), n.addEventListener(e, dragOutHandler, event)
	}), a.addEventListener("dragover", () => dragOverHandler(event, event.target));
	for (e of a.children) e.addEventListener("dragover", () => dragOverHandler(event, event.target.parentElement));
	n.addEventListener("dragover", () => dragOverHandler(event, event.target));
	for (t of n.children) t.addEventListener("dragover", () => dragOverHandler(event, event.target.parentElement));
	n.addEventListener("drop", () => dropHandler(event, !0)), a.addEventListener("drop", () => dropHandler(event, !1)), a.addEventListener("click", () => {
		fileInput.click(), instant_processing = !1
	}), fileInput.addEventListener("change", function (e) {
		var t = e.target.files;
		console.log("FILES:"), console.log(t);
		for (var a = 0; a < t.length; a++) last_file = a + 1 == t.length, handleFile(t[a]);
		console.log("FILES processing done...")
	})
}
let replace_txt;
function onSelectFileChanged(fileContent,index){
	localStorage.setItem("selectFileIndex", index);  
	replace_txt = fileContent;
	//console.log("replace_txt:" + replace_txt+","+localStorage.getItem("selectFileIndex"));
}

function dropHandler(a, e) {
	a.preventDefault(), Array.from(document.getElementsByClassName("drop_zone_active"))
		.forEach(function (e, t, a) {
			e.classList.remove("drop_zone_active")
		}), instant_processing = e, a.dataTransfer.items ? [...a.dataTransfer.items].forEach((e, t) => {
			"file" === e.kind && (e = e.getAsFile(), last_file = t + 1 == a.dataTransfer.items.length, handleFile(e))
		}) : [...a.dataTransfer.files].forEach((e, t) => {
			last_file = t + 1 == a.dataTransfer.files.length, handleFile(e)
		})
}

function focusDropzone() {
	document.getElementById("drop_zones_wrapper")
		.classList.add("focused")
}

function defocusDropzone() {
	document.getElementById("drop_zones_wrapper")
		.classList.remove("focused")
}

function dragOverHandler(e, t) {
	console.log("File(s) in drop zone"), t.classList.add("drop_zone_active"), e.preventDefault()
}

function dragOutHandler(e) {
	e.target.classList.remove("drop_zone_active"), e.preventDefault()
}

function update_progress(e) {
	console.log("progress at:", e), e < 0 ? (console.log("Progressbar: " + e), p_scale.style.width = "0%", p_scale.parentElement.style.opacity = 0) : (p_scale.parentElement.style.opacity = 1, p_scale.style.width = e + "%")
}
window.addEventListener("DOMContentLoaded", () => {
	initialize_page()
});
const err_default = "Please use sliced files in *.3mf or *.gcode.3mf formats. Usage of plane *.gcode files is not supported.",
	err00 = "File not readable. \n" + err_default,
	err01 = "No sliced data found. \n" + err_default;

function reject_file(e) {
	alert(e), my_files.pop()
}

function adj_field_length(e, t, a) {
	trg_val = "" == e.value ? e.placeholder : e.value, e.style.width = Math.min(a, Math.max(t, trg_val.length + 2)) + "ch"
}

function custom_file_name(e) {
	"" == e.value && (e.value = e.placeholder, e.select())
}

function handleFile(y) {
	var v = my_files.length,
		e = document.getElementById("file_name");
	e.placeholder = 0 == v ? y.name.split(".gcode.")
		.join(".")
		.split(".3mf")[0] : "mix", adj_field_length(e, 5, 26), my_files.push(y), JSZip.loadAsync(y)
			.then(async function (f) {
				parser = new DOMParser;
				var e = f.file("Metadata/model_settings.config")
					.async("text"),
					p = parser.parseFromString(await e, "text/xml")
						.getElementsByTagName("plate");
				if (0 == p.length) reject_file(err01);
				else if (0 == p[0].querySelectorAll("[key='gcode_file']")
					.length) reject_file(err01);
				else {
					document.getElementById("drop_zones_wrapper")
						.classList.add("mini_drop_zone"), document.getElementById("action_buttons")
							.classList.remove("hidden"), document.getElementById("statistics")
								.classList.remove("hidden");
					for (var e = f.file("Metadata/slice_info.config")
						.async("text"), _ = parser.parseFromString(await e, "text/xml"), u = 0; u < p.length; u++) ! function () {
							var e = p[u].querySelectorAll("[key='gcode_file']")[0].getAttribute("value");
							if ("" != e) {
								console.log("plate_name found", e);
								var n = f.file(e);
								if (n) {
									var t, a, l = li_prototype.cloneNode(!0),
										o = (l.removeAttribute("id"), playlist_ol.appendChild(l), l.getElementsByClassName("f_name")[0]),
										s = l.getElementsByClassName("p_name")[0],
										i = l.getElementsByClassName("p_icon")[0],
										r = l.getElementsByClassName("f_id")[0],
										d = l.getElementsByClassName("p_time")[0],
										c = l.getElementsByClassName("p_filaments")[0],
										m = l.getElementsByClassName("p_filament_prototype")[0],
										l = (l.classList.remove("hidden"), o.textContent = y.name, o.title = y.name, s.textContent = e.split("Metadata")
											.join("")
											.split(".gcode")
											.join(""), s.title = e, r.title = v, r.innerText = "[" + v + "]", p[u].querySelectorAll("[key='thumbnail_file']")[0].getAttribute("value")),
										o = (console.log("icon_name", l), f.file(l)),
										s = (console.log("img_file", o), o.async("blob")
											.then(function (e) {
												i.src = URL.createObjectURL(e)
											}), "[key='index'][value='" + (u + 1) + "']"),
										e = _.querySelectorAll(s);
									t = (0 < e.length ? e[0].parentElement : _.getElementsByTagName("plate")[0])
										.getElementsByTagName("filament");
									for (var g = 0; g < t.length; g++) a = m.cloneNode(!0), c.appendChild(a), a.getElementsByClassName("f_color")[0].style.backgroundColor = t[g].getAttribute("color"), a.getElementsByClassName("f_slot")[0].innerText = t[g].getAttribute("id"), a.getElementsByClassName("f_type")[0].innerText = t[g].getAttribute("type"), a.getElementsByClassName("f_used_m")[0].innerText = t[g].getAttribute("used_m"), a.getElementsByClassName("f_used_g")[0].innerText = t[g].getAttribute("used_g"), a.className = "p_filament";
									n.async("string")
										.then(async function (e) {
											var t = "total estimated time: ",
												t = e.indexOf(t) + t.length,
												e = e.slice(t, e.indexOf("\n", t)),
												t = 0,
												a = (d.innerText = e)
													.match(/\d+[s]/),
												t = a ? parseInt(a) : 0;
											t = (t = (t += 60 * ((a = e.match(/\d+[m]/)) ? parseInt(a) : 0)) + 60 * ((a = e.match(/\d+[h]/)) ? parseInt(a) : 0) * 60) + 60 * ((a = e.match(/\d+[d]/)) ? parseInt(a) : 0) * 60 * 24, d.title = await t, update_statistics(), console.log("plate_name:" + n.name + " time-string", e)
										})
								}
							}
						}();
					var t = _.getElementsByTagName("filament"),
						a = (console.log("filaments.length", t.length), 0);
					console.log("filaments:", t);
					for (u = 0; u < t.length; u++) t[u].id > a && (a = t[u].id), console.log("filaments[i].id:", t[u].id), console.log("max_id:", a);
					last_file && (makeListSortable(playlist_ol), instant_processing) && export_3mf()
				}
			},
				function (e) {
					var t = document.createElement("div");
					t.className = "alert alert-danger", t.textContent = "Error reading " + y.name + ": " + e.message, err.appendChild(t), reject_file(err00)
				})
}

function reload(showChinese) {
}

async function export_3mf() {
	update_progress(5), console.log("---export_3mf-----");
	for (var e = [], t = playlist_ol.getElementsByTagName("li"), a = 15 / t.length, n = 0; n < t.length; n++) {
		var l = t[n].getElementsByClassName("f_id")[0].title,
			o = my_files[l],
			s = t[n].getElementsByClassName("p_name")[0].title,
			i = t[n].getElementsByClassName("p_rep")[0].value;
		if (console.log(">>> read file-id:" + l + " plate_name: " + s + " repeats:" + i, o), 0 < i) {
			console.log(">file nr: " + l + " will be added " + i + " times");
			for (var r = await (await JSZip.loadAsync(my_files[l]))
				.file(s)
				.async("text"), d = 0; d < i; d++) console.log("...added " + d), e.push(update_gcode(r))
		}
		update_progress(5 + (n + 1) * a)
	}
	console.log(">>> mylist", e), Promise.all(e)
		.then(async e => {
			console.log("got all responses...");
			var t = await JSZip.loadAsync(my_files[0]);
			(await t.file(/plate_\d+\.gcode\b$/))
				.forEach(async function (e) {
					await t.remove(e.name)
				}), await t.remove("Metadata/custom_gcode_per_layer.xml");
			for (var a = await (await JSZip.loadAsync(my_files[ams_max_file_id]))
				.file("Metadata/project_settings.config")
				.async("text"), a = (t.file("Metadata/project_settings.config", a), t.file("Metadata/model_settings.config", model_settings_template), t.file("Metadata/slice_info.config")
					.async("text")), n = parser.parseFromString(await a, "text/xml"), l = n.getElementsByTagName("plate"); 1 < l.length;) l[l.length - 1].remove();
			(index_node = l[0].querySelectorAll("[key='index']")[0])
				.setAttribute("value", "1"), console.log("xxxx>>>>   plates[0]", l[0]);
			for (var o = l[0].getElementsByTagName("filament"); 0 < o.length;) o[o.length - 1].remove();
			for (var s = document.getElementById("filament_total")
				.childNodes, i = 0; i < s.length; i++) {
				var r = n.createElement("filament");
				l[0].appendChild(r), r.id = s[i].title, r.setAttribute("used_m", "0"), r.setAttribute("used_g", "0")
			}
			a = (new XMLSerializer)
				.serializeToString(n);
			for (console.log("slicer_config_xml_str: ", a), t.file("Metadata/slice_info.config", a), i = 0; i < e.length; i++) e[i] += swpr_gcode, console.log("response " + i + " added");
			for (var d = +document.getElementById("loops")
				.value, c = [], i = 0; i < d; i++) c = c.concat(e);
			c[0] = ini_gcode + c[0];
			var m = "\nM620 S",
				g = [],
				f = [],
				p = [];
			for (i = 0; i < c.length; i++) {
				let e = c[i].indexOf(m);
				for (; - 1 !== e;) {
					g.push(e + 1), f.push(i);
					var _ = c[i].substring(e + 7, e + 10);
					"\n" != _[2] && " " != _[2] || (_ = _.substring(0, 2)), p.push(_), e = c[i].indexOf(m, e + 1)
				}
			}
			for (console.log("ams_flag_index: ", g), console.log("ams_flag_plate: ", f), console.log("ams_flag_string: ", p), i = 0; i < p.length - 1; i++) 255 == p[i] && p[i - 1] == p[i + 1] && (c[f[i]] = disable_gcode_line2(c[f[i]], g[i]), c[f[i + 1]] = disable_gcode_line2(c[f[i + 1]], g[i + 1]), console.log("ams_flag disabled id: ", i), console.log("ams_flag disabled a: ", c[f[i]].substring(g[i], g[i] + 50)), console.log("ams_flag disabled b: ", c[f[i + 1]].substring(g[i + 1], g[i + 1] + 50)));
			var u, a = new Blob(c, {
				type: "text/x-gcode"
			});
			t.file("Metadata/plate_1.gcode", a), console.log("datafile", a), update_progress(25), await chunked_md5(enable_md5 ? a : new Blob([" "]), function (e) {
				u = e, console.log("response", e), console.log("strHash", u), t.file("Metadata/plate_1.gcode.md5", u), t.generateAsync({
					type: "blob",
					compression: "DEFLATE",
					compressionOptions: {
						level: 3
					}
				}, function (e) {
					update_progress(75 + .2 * e.percent.toFixed()), e.currentFile
				})
					.then(function (e) {
						var t = document.getElementById("file_name");
						var name = "AutoSwap";
						download(("" != t.value ? t.value : t.placeholder) + "." + name + ".3mf", datafileurl = URL.createObjectURL(e)), update_progress(100), setTimeout(update_progress(-1), 1e3)
					})
			})
		})
		.catch(e => {
			console.error("Failed to fetch: " + e)
		})
}

function update_gcode(originalString) {
	if (replace_txt) {
	} else {
		return originalString;
	}
	let substringToFind = "set_gcode_claim_speed_level : 0";

	if (originalString.includes(substringToFind)) {
		let index = originalString.lastIndexOf(substringToFind);
		let remainingText = originalString.slice(index + substringToFind.length);
		let newString = originalString.slice(0, index) + substringToFind + "\r\n" + replace_txt + remainingText;
		return newString;
	} else {
		console.log("The specified substring was not found.");
	}
	return originalString;
}
function disable_gcode_line2(e, t) {
	return e;
}

function disable_gcode_line(e, t) {
	return t > e.length - 1 ? e : e.substring(0, t) + ";" + e.substring(t + 1)
}

function disable_gcode_block(e, t) {
	if (t > e.length - 1) return e;
	for (var a = e.substring(t)
		.search(/\n[^\s]/), n = ";Auto plate swap - AMS block removed"; n.length < a - 1;) n += "/";
	return n += "\n", e.substring(0, t) + n + e.substring(t + a)
}

function chunked_md5(a, t) {
	var n = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
		l = 2097152,
		o = Math.ceil(a.size / l),
		s = 0,
		i = new SparkMD5.ArrayBuffer,
		r = new FileReader;

	function d() {
		var e = s * l,
			t = e + l >= a.size ? a.size : e + l;
		r.readAsArrayBuffer(n.call(a, e, t))
	}
	r.onload = function (e) {
		console.log("read chunk nr", s + 1, "of", o), i.append(e.target.result), update_progress(25 + 50 / o * ++s), s < o ? d() : (e = i.end(), console.log("finished loading"), console.info("computed hash", e), t(e))
	}, r.onerror = function () {
		console.warn("oops, something went wrong.")
	}, d()
}

function download(e, t) {
	var a = document.createElement("a");
	console.log("datafileurl", t), a.setAttribute("href", t), a.setAttribute("download", e), a.style.display = "none", document.body.appendChild(a), a.click(), document.body.removeChild(a), console.log("download_started")
}

function update_statistics() {
	update_filament_usage(), update_total_time()
}

function update_filament_usage() {
	var e = [],
		t = [],
		a = -1,
		n = document.getElementById("filament_total"),
		l = playlist_ol.getElementsByClassName("p_filament");
	console.log("my_fil_data.length: " + l.length), console.log("my_fil_data", l);
	for (var o = 0; o < l.length; o++) {
		var s = l[o].getElementsByClassName("f_slot")[0].innerText - 1,
			i = (e[s] || (e[s] = 0), t[s] || (t[s] = 0), +l[o].parentElement.parentElement.getElementsByClassName("p_rep")[0].value);
		console.log("repeats", i), e[s] += i * l[o].getElementsByClassName("f_used_m")[0].innerText, t[s] += i * l[o].getElementsByClassName("f_used_g")[0].innerText, console.log("slot", s), console.log("f_used_m.innerText", 10 * l[o].getElementsByClassName("f_used_m")[0].innerText), a < s && 0 < i && (a = s, ams_max_file_id = l[o].parentElement.parentElement.getElementsByClassName("f_id")[0].title, console.log("f_id element: ", l[o].parentElement.parentElement.getElementsByClassName("f_id")), console.log("file id with highest AMS slot=", ams_max_file_id))
	}
	const r = +document.getElementById("loops")
		.value;
	e = e.map(e => e * r), t = t.map(e => e * r), console.log("loops: ", r);
	n.innerHTML = "";
	var txt = "Consumables ";
	for (var d, c = 0; c < e.length; c++) e[c] && t[c] && ((d = document.createElement("div"))
		.innerHTML = txt + (c + 1) + ": <br>" + Math.round(100 * e[c]) / 100 + "m <br> " + Math.round(100 * t[c]) / 100 + "g", d.title = c + 1, n.appendChild(d))
}

function update_total_time() {
	for (var e = document.getElementById("total_time"), t = +document.getElementById("loops")
		.value, a = document.getElementById("used_plates"), n = 0, l = 0, o = playlist_ol.getElementsByTagName("li"), s = 0; s < o.length; s++) {
		var i = o[s].getElementsByClassName("p_rep")[0].value;
		0 < i ? (l += i * o[s].getElementsByClassName("p_time")[0].title, o[s].classList.remove("inactive"), n += +i) : o[s].classList.add("inactive")
	}
	n *= t, e.innerText = (l *= t)
		.toDHMS(), a.innerText = n
}

function makeListSortable(e) {
	e.classList.add("slist");
	let l = e.getElementsByTagName("li"),
		o = null;
	for (let n of l) n.draggable = !0, n.ondragstart = e => {
		(o = n)
			.classList.add("targeted");
		for (var t of l) t != o && t.classList.add("hint")
	}, n.ondragenter = e => {
		n != o && n.classList.add("active")
	}, n.ondragleave = () => {
		n.classList.remove("active")
	}, n.ondragend = () => {
		for (var e of l) e.classList.remove("hint"), e.classList.remove("active"), e.classList.remove("targeted")
	}, n.ondragover = e => {
		e.preventDefault()
	}, n.ondrop = e => {
		if (e.preventDefault(), n != o) {
			let t = 0,
				a = 0;
			for (let e = 0; e < l.length; e++) o == l[e] && (t = e), n == l[e] && (a = e);
			n.parentNode.insertBefore(o, n.nextSibling), t < a ? n.parentNode.insertBefore(o, n.nextSibling) : n.parentNode.insertBefore(o, n)
		}
	};
	console.log("list was made sortable")
}
Number.prototype.toDHMS = function () {
	var e = Math.floor(this / 86400),
		t = Math.floor((this - 3600 * e * 24) / 3600),
		a = Math.floor((this - 3600 * e * 24 - 3600 * t) / 60);
	return (e ? e + "d " : "") + (t ? t + "h " : "") + a + "m " + (this - 3600 * e * 24 - 3600 * t - 60 * a) + "s "
};