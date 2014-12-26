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
    var puzzle_tile = {};

    puzzle_tile.toString = function toString () {
        return "";
    };

    return {};
};

document.addEventListener('DOMContentLoaded', function () {
    "use strict";

    var upload = new ImageContext("assets/images/example.gif", 17, 13),
        image_data,canvas, ctx,
        TILE_DIM = 5, INTS_PER_CHUNK = 4,
        tile_data_size, step, bigstep, pixel_data = [], pixel_image, pw, ph, clamped_array;

    upload.drawImage();
    image_data = upload.getImageData();

    step = upload.pdim; // each pixel unit
    bigstep = step * TILE_DIM; // each tile

    console.log(step, bigstep);

    for (var y = 0; y < upload.img.height; y = y + bigstep) {
        for (var x = 0; x < upload.img.width; x = x + bigstep) {
            var p = new PuzzleTile();
            // read in the colour of the top-left pixel of every PIXEL_DIM square
            for (var j = 0; j < bigstep; j = j + step) {
                for (var i = 0; i < bigstep; i = i + step) {
                    var hex = image_data.readPixelDataHex(x + i, y + j);
                    // make tile
                    // pixel_data = pixel_data.concat(image_data.readPixelData(x + i, y + j));
                }
            }

            console.log(hex);
            console.log(p.toString());
        }
    }


    pw = upload.img.width/upload.pdim;
    ph = upload.img.height/upload.pdim;

    clamped_array = new Uint8ClampedArray(pixel_data, pw, ph);
    pixel_image = new ImageData(clamped_array, pw, ph);

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    ctx.putImageData(pixel_image, upload.img.width, upload.img.height);
});
