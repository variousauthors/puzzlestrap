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
            Object.keys(colors).join(" "),
            map.join("\n")
        ].join("\n"));
    };

    // add a colour to the list and return the corresponding
    // index (symbol), eg 0 for the first color 1 for the second etc
    puzzle_tile.addColor = function addColor (hex) {
        var symbol, color = "#" + hex;

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

    puzzle_tile.getName = function getName () {

        return name || (name = [
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
    instance.findOrCreate = function findOrCreate (tile_name) {
        var symbol = instance.lookup[tile_name];

        if (symbol !== undefined) {

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

    return instance;
},

Objects = function Objects () {
    var instance = {};

    instance.toString = function toString () {
        var tiles = [], keys = Object.keys(instance);

        keys.forEach(function (key) {
            tiles.push(instance[key].toString());
        });

        return tiles.join("\n");
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

    return instance;
},

Layers = function Layers () {};

document.addEventListener('DOMContentLoaded', function () {
    "use strict";

    var upload = new ImageContext("assets/images/example.gif", 17, 13),
        image_data,canvas, ctx,
        TILE_DIM = 5, INTS_PER_CHUNK = 4,
        tile_data_size, step, bigstep, pixel_data = [], pixel_image, pw, ph, clamped_array,
        tile_name, legend = new Legend(), tile_map = new Levels(), objects = new Objects();

    upload.drawImage();
    image_data = upload.getImageData();

    step = upload.pdim; // each pixel unit
    bigstep = step * TILE_DIM; // each tile

    // for each tile in the image
    // TODO the indices x and y should be subsequent integers, and then
    // we should use multiplication to take them to pixel addresses
    for (var y = 0; y < upload.img.height; y = y + bigstep) {
        tile_map[y / bigstep] = [];

        for (var x = 0; x < upload.img.width; x = x + bigstep) {
            var p = new PuzzleTile();

            // read in the colour of the top-left pixel of every PIXEL_DIM square
            for (var j = 0; j < bigstep; j = j + step) {
                for (var i = 0; i < bigstep; i = i + step) {
                    var hex = image_data.readPixelDataHex(x + i, y + j),
                        symbol = p.addColor(hex); // grab the ascii for this hex colour

                    p.pushSymbol(symbol); // add it to the tile

                    // make tile
                    // pixel_data = pixel_data.concat(image_data.readPixelData(x + i, y + j));
                }
            }

            tile_name = p.getName(); // TODO replace with a proper hash

            // TODO this should be an instance
            symbol = legend.findOrCreate(tile_name); // look up or generate the legend

            tile_map[y / bigstep][x / bigstep] = symbol;

            // if a tile is new
            if (objects[tile_name] === undefined) {
                objects[tile_name] = p;
                // Layers[0].push(tile_name);
            }
        }
    }

    console.log(objects.toString());
    console.log(Object.keys(objects).length);
    console.log(legend.toString());
    console.log(legend.length);
    console.log(tile_map.toString());
    console.log(tile_map.length);

    pw = upload.img.width/upload.pdim;
    ph = upload.img.height/upload.pdim;

    clamped_array = new Uint8ClampedArray(pixel_data, pw, ph);
    pixel_image = new ImageData(clamped_array, pw, ph);

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    ctx.putImageData(pixel_image, upload.img.width, upload.img.height);
});
