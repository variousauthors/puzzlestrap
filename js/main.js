var AugmentedImageData = function AugmentedImageData (ctx, x, y, w, h) {
    var dataObject, CHUNK_SIZE = 4;

    dataObject = ctx.getImageData(x, y, w, h);

    dataObject.readPixelDataHex = function readPixelDataHex (x, y) {
        var index = x + (w * y), result;
        index = index * CHUNK_SIZE;

        result = dataObject.data[index + 0].toString(16) +
            dataObject.data[index + 1].toString(16) +
            dataObject.data[index + 2].toString(16);

        return result
    };

    // return an array containing the data for a single pixel
    dataObject.readPixelData = function readPixelData (x, y) {
        var index = x + (w * y);
        index = index * CHUNK_SIZE;

        return [
            dataObject.data[index + 0],
            dataObject.data[index + 1],
            dataObject.data[index + 2],
            dataObject.data[index + 3]
        ];
    };

    return dataObject
},

/* an image an its context constructed from a source or from image data */
/* @params src -- original image source
 * @params w, h -- width height in screen pixels of original image
 * */
ImageContext = function ImageContext (src, w, h) {
    "use strict";

    var canvas, ctx, img, upload, TILE_DIM = 5;

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    img = new Image();

    // tile width and height, and source
    upload = {
        src: src,
        w: w,
        h: h,
        img: img
    };

    img.src = upload.src;

    // the image object knows its pixel height and width
    // use this to determine the height/width of our tile
    upload.tw = img.width / upload.w;
    upload.th = img.height / upload.h;

    if (upload.tw !== upload.th) { throw "the image is bad"; }

    // tile dimension in screen pixels, and pixel dimension in screen pixels
    upload.tdim = upload.tw;
    upload.pdim = upload.tw / TILE_DIM;

    upload.getImageData = function getImageData () {
        var data = new AugmentedImageData(ctx, 0, 0, img.width, img.height);

        return data;
    };

    upload.drawImage = function drawImage () {
        return ctx.drawImage(img, 0, 0);
    };

    return upload;
},

PuzzleTile = function PuzzleTile () {
    var puzzle_tile = {}, colors = {}, color_index = 0, map = [], current_row = 0,
        cached_string, name;

    puzzle_tile.toString = function toString () {

        return cached_string || (cached_string = [
            name,
            Object.keys(colors).map(function (c) { return "#" + c; }).join(" "),
            map.join("\n")
        ].join("\n"));
    };

    // add a colour to the list and return the corresponding
    // index (symbol), eg 0 for the first color 1 for the second etc
    puzzle_tile.addColor = function addColor (hex) {
        var symbol, color = hex;

        if (colors[color] !== undefined) return colors[color];

        symbol = color_index;
        colors[color] = color_index;
        color_index = color_index + 1;

        return symbol;
    };

    puzzle_tile.pushSymbol = function pushSymbol (symbol) {
        // if the map is full, return false
        if (current_row > 4) return false;

        if (map[current_row] === undefined) {
            map[current_row] = "";
        }

        map[current_row] += symbol;

        // move to the next row when this row is full
        if (map[current_row].length === 5) {
            current_row = current_row + 1;
        }

        return true;
    };

    // TODO we need to think about what to do when the user adds a new tile identical
    // to an existing tile, on a new layer. The hash needs to be augmented, in that case.
    // it may be enough to just add the layer index... but we would need to pass that in
    // UGH it seems like we will need layer and tile to be entangled... unless layer is
    // in charge of naming tiles! That way the relationship is unidirectional.
    // When we add a tile to a layer, the layer names it. Before that, the name could
    // just raise
    //
    // TODO also, we should start running this through an MD5 hash so that the names will
    // all be the same length (purely asthetic)
    puzzle_tile.getName = function getName () {
        if (name === undefined) { throw "getName would return 'undefined' because the tile is not yet named."}

        return name;
    };

    puzzle_tile.setName = function setName (layer) {
        return (name = [
            layer,
            Object.keys(colors).join(""),
            map.join("")
        ].join(""));
    };

    return puzzle_tile;
},

Legend = function Legend () {
    // TODO I'm not sure where the printable characters start, but
    var instance = {}, CHAR_OFFSET = 161;

    // indexed by char with values of string
    instance.legend = {};
    instance.lookup = {}; // the lookup maps strings back to char
    instance.length = 0;

    // look up the tile in the legend, if it exists
    // return the legend symbol, otherwise create it
    instance.create = function create (tile_name) {
        var symbol = instance.lookup[tile_name];

        if (symbol !== undefined) {
            // NOP

        } else {

            symbol = instance.length + CHAR_OFFSET;
                // add a symbol to the legend, with the next character
            instance.legend[symbol] = tile_name;
            instance.lookup[tile_name] = symbol;
            instance.length = instance.length + 1;
        }

        return symbol;
    };

    // prints the legend
    instance.toString = function toString () {
        var lines = [], i, symbol;

        for (i = 0; i < instance.length; i++) {
            symbol = CHAR_OFFSET + i;
            lines.push([String.fromCharCode(symbol), "=", instance.legend[symbol]].join(" "));
        }

        return lines.join("\n");
    };

    instance.headerString = function headerString () {
        return "=======\nLEGEND\n=======";
    };

    return instance;
},

Prelude = function Prelude () {
    var instance = {};

    instance.toString = function toString () {
        return "title Your Title Here\nauthor Your Name Here\nhomepage www.example.com";
    };

    return instance;
},

Objects = function Objects () {
    var instance = {};

    instance.objects = {};
    instance.length = 0;

    // returns true if the given tile was added
    // TODO this validation is essentially redundant now that layers is in charge of uniqueness
    instance.add = function addObject (tile_name, tile) {
        if (instance.objects[tile_name] !== undefined) {
            return false;
        }

        instance.objects[tile_name] = tile;
        instance.length = instance.length + 1;

        return true;
    };

    instance.toString = function toString () {
        var tiles = [], keys = Object.keys(instance.objects);

        keys.forEach(function (key) {
            tiles.push(instance.objects[key].toString() + "\n");
        });

        tiles.push("Background\ntransparent\n");
        tiles.push("Player\ntransparent\n");

        return tiles.join("\n");
    };

    instance.headerString = function headerString () {
        return "========\nOBJECTS\n========";
    };

    return instance;
},

Levels = function Levels () {
    var instance = [];

    instance.toString = function toString () {
        var lines = [], y;
        for (y = 0; y < instance.length; y++) {
            // the array of char codes needs to be passed to fromcharcode as plain
            // args, hence this nonsense
            lines.push(String.fromCharCode.apply(String, instance[y]));
        }

        return lines.join("\n");
    };

    instance.headerString = function headerString () {
        return "=======\nLEVELS\n=======";
    };

    return instance;
},

Sounds = function Sounds () {
    var instance = {};

    instance.headerString = function headerString () {
        return "=======\nSOUNDS\n=======";
    };

    return instance;
};

Rules = function Ruels () {
    var instance = {};

    instance.headerString = function headerString () {
        return "======\nRULES\n======";
    };

    return instance;
};

WinConditions = function WinConditions () {
    var instance = {};

    instance.headerString = function headerString () {
        return "==============\nWINCONDITIONS\n==============";
    };

    return instance;
};

CollisionLayers = function CollisionLayers () {
    var instance = {};

    instance.layers = [];
    instance.length = 0;

    instance.newLayer = function newLayer () {
        instance.layers[instance.length] = {};
        instance.length = instance.length + 1;
    };

    instance.add = function add (tile) {
        var tile_name, layer, unique = false;

        // if the user wants to add, they probably want a layer to add to
        if (instance.length === 0) { throw new Error("You must call newLayer at least once before trying to add tiles to a layer." )}

        tile_name = tile.setName({ layer: instance.length });
        layer = instance.layers[instance.length - 1]

        // validate uniqueness of the tile for this layer
        if (layer[tile_name] === undefined) {
            layer[tile_name] = true;
            unique = true;

        }

        return unique;
    };

    // TODO determine uniqueness of tile on the given layer
    instance.hasTile = function hasTile (layer, tile) {
        return true;
    };

    instance.toString = function toString () {
        var lines = ["Background", "Player"], i;

        for (i = 0; i < instance.layers.length; i++) {
            var tile_names = Object.keys(instance.layers[i]);

            lines.push(tile_names.join(", "));
        }

        return lines.join("\n");
    };

    instance.headerString = function headerString () {
        return "===============\nCOLLISIONLAYERS\n===============";
    };

    return instance;
};

PuzzleScript = function PuzzleScript () {
    var legend = new Legend();
    var levels = new Levels();
    var objects = new Objects();
    var layers = new CollisionLayers();
    var rules = new Rules();
    var sounds = new Sounds();
    var win_conditions = new WinConditions();
    var prelude = new Prelude();
    var instance = {
        legend: legend,
        levels: levels,
        objects: objects,
        layers: layers,
        rules: rules,
        sounds: sounds,
        win_conditions: win_conditions,
        prelude: prelude
    };

    instance.toString = function toString () {
        return [
            instance.prelude.toString(),
            instance.objects.headerString(),
            instance.objects.toString(),
            instance.legend.headerString(),
            instance.legend.toString(),
            instance.sounds.headerString(),
            instance.layers.headerString(),
            instance.layers.toString(),
            instance.rules.headerString(),
            instance.win_conditions.headerString(),
            instance.levels.headerString(),
            instance.levels.toString()
        ].join("<br><br>").replace(/\n/g, "<br>");
    };

    instance.insertTile = function insertTile (tile) {
        // the collision layers will determine uniqueness
        // pass the tile to the layers, it names the tile and
        // checks uniqueness. If it is a new tile, the tile
        // is added to the layer and insert into layer returns true
        // otherwise it returns false
        // if the tile is new, then we can add it to:
        // Objects, Legend (TODO presumably appending)
        var generic_tile_name, symbol;

        if (layers.add(tile) === true) {
            // the tile is unique to this layer, so it is a new tile
            objects.add(tile);
        }
    };

    return instance;
};

document.addEventListener('DOMContentLoaded', function () {
    "use strict";

    var TILE_DIM = 5, INTS_PER_CHUNK = 4;
    var upload = new ImageContext("assets/images/example.gif", 17, 13);
    var puzzle_script = new PuzzleScript();
    var layers = puzzle_script.layers, levels = puzzle_script.levels, legend = puzzle_script.legend, objects = puzzle_script.objects;

    // TODO this should be PuzzleScript.layerFromImageContext(upload)

    // TODO when adding a new layer, we need to revise the existing symbols, to include
    // the elements that are above them
    // in other words, that symbol in the legend needs to have an and added to it
    //
    // TODO we also need to ensure that the new tiles have unique names

    (function (upload) {
        var image_data, step, bigstep;

        // start a new layer
        layers.newLayer();

        upload.drawImage();
        image_data = upload.getImageData();

        step = upload.pdim; // each pixel unit
        bigstep = step * TILE_DIM; // each tile

        // for each tile in the image
        // TODO the indices x and y should be subsequent integers, and then
        // we should use multiplication to take them to pixel addresses
        for (var y = 0; y < upload.img.height; y = y + bigstep) {
            levels[y / bigstep] = [];

            for (var x = 0; x < upload.img.width; x = x + bigstep) {
                var p = new PuzzleTile(), tile_name;

                // read in the colour of the top-left pixel of every PIXEL_DIM square
                for (var j = 0; j < bigstep; j = j + step) {
                    for (var i = 0; i < bigstep; i = i + step) {
                        // TODO we need to ignore transparent pixels
                        var hex = image_data.readPixelDataHex(x + i, y + j),
                            symbol = p.addColor(hex); // grab the ascii for this hex colour

                        p.pushSymbol(symbol); // add it to the tile
                    }
                }

                // TODO we need to do this ONLY if the tile is not transparent
                tile_name = puzzle_script.insertTile(p);

                // TODO this could be pulled into the levels object as a function of x, y, tile
                symbol = levels[y / bigstep][x / bigstep];

                if (symbol === undefined) {
                    // create a new symbol for this map cell
                    levels[y / bigstep][x / bigstep] = legend.create(tile_name);

                } else {
                    // there is already a symbol at this map position, so add the tile to it
                    legend.compose(symbol, tile_name);
                }
            }
        }
    }(upload));

    // TODO this should use PuzzleScript.toString()
    document.getElementById("puzzlescript").innerHTML = puzzle_script.toString();
});
