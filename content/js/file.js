function toggleActive(context, element) {
    var current = context.getElementsByClassName("active"), i;

    for (i = 0; i < current.length; i++) {
        current[i].classList.remove("active");
    }

    element.classList.add("active");
}

function createLayer (create_layer_tab) {
    var tabs = document.getElementById('layer-select');
    var template = document.getElementById("layer-template").innerHTML.trim();
    var new_layer = document.createElement('div');

    new_layer.innerHTML = template;
    new_layer = new_layer.firstChild;

    tabs.insertBefore(new_layer, create_layer_tab);
    toggleActive(tabs, new_layer);
}

function switchLayer (target_layer_tab) {
    var tabs = document.getElementById('layer-select');

    toggleActive(tabs, target_layer_tab);
}

document.getElementById('files').addEventListener('change', function (e) {
    var file = e.target.files[0];
    var reader;

    if (! file.type.match('image.*')) { return false; }

    reader = new FileReader();

    reader.onload = function (e) {
        Main(e.target.result);
    };

    reader.readAsDataURL(file);
});

document.getElementById('layer-select').addEventListener('click', function (e) {
    var target = e.target;

    if (target && target.id === "create-layer") {
        return createLayer(target);
    }

    if (target && target.tagName === "LI") {
        return switchLayer(target);
    }

    return true;
});
