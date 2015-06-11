var LAYER_ID = 1;
var SUFFIX = Math.random().toString().substring(2);
function layerId () {
    var id = LAYER_ID;
    LAYER_ID++;

    return id;
}

function toggleActive (context, element) {
    var current = context.getElementsByClassName("active"), i;

    for (i = 0; i < current.length; i++) {
        current[i].classList.remove("active");
    }

    element.classList.add("active");
}

function createLayer (create_layer_tab) {
    var layer_id = layerId();
    var name = "Layer " + layer_id;
    var formal_name = "layer-" + layer_id + "-" + SUFFIX;
    var last_tab = document.querySelector('#layer-select li:last-child');
    var tabs = document.getElementById('layer-select');
    var layers = document.getElementById('layers');

    var tab_template = document.getElementById("layer-tab-template").innerHTML.trim();
    var layer_template = document.getElementById("layer-template").innerHTML.trim();
    var new_layer_tab = document.createElement('div');
    var new_layer = document.createElement('div');

    new_layer_tab.innerHTML = tab_template;
    new_layer_tab = new_layer_tab.firstChild;
    new_layer_tab.dataset.layerName = formal_name;
    new_layer_tab.textContent = name;

    new_layer.innerHTML = layer_template;
    new_layer = new_layer.firstChild;
    new_layer.dataset.layerName = formal_name;
    new_layer.getElementsByClassName("name")[0].textContent = name;

    tabs.insertBefore(new_layer_tab, last_tab);
    layers.appendChild(new_layer);

    toggleActive(tabs, new_layer_tab);
    toggleActive(layers, new_layer);

    return new_layer;
}

function switchLayer (target_layer_tab) {
    var tabs = document.getElementById('layer-select');
    var layers = document.getElementById('layers');
    var formal_name = target_layer_tab.dataset.layerName;
    var target_layer = layers.querySelector("[data-layer-name=" + formal_name + "]");

    toggleActive(tabs, target_layer_tab);
    toggleActive(layers, target_layer);
}

document.getElementById('files').addEventListener('change', function (e) {
    var file = e.target.files[0];
    var reader;

    if (! file.type.match('image.*')) { return false; }

    reader = new FileReader();

    reader.onload = function (e) {
        var layer = document.getElementById('layers').getElementsByClassName('active')[0];
        var canvas = layer.getElementsByTagName('canvas')[0];

        puzzlescript.addLayerFromImage(e.target.result, canvas);
        document.getElementById("puzzlescript").innerHTML = puzzlescript.toString();
    };

    reader.readAsDataURL(file);
});

document.getElementById('layer-select').addEventListener('click', function (e) {
    var target = e.target;
    var canvas;

    if (target && target.id === "create-layer") {
        return createLayer(target);
    }

    if (target && target.tagName === "LI") {
        return switchLayer(target);
    }

    return true;
});
