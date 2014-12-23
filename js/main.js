var AugmentedImageData = function (ctx, x, y, w, h) {
    var dataObject, CHUNK_SIZE = 4;

    dataObject = ctx.getImageData(x, y, w, h);

    // return an array containing the data for a single pixel
    dataObject.readPixelData = function (x, y) {
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

ImageUpload = function (src, w, h) {
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

    upload.getImageData = function () {
        var data = new AugmentedImageData(ctx, 0, 0, img.width, img.height);

        return data;
    };

    upload.drawImage = function () {
        return ctx.drawImage(img, 0, 0);
    };

    return upload;
};

document.addEventListener('DOMContentLoaded', function () {
    "use strict";

    var upload = new ImageUpload("assets/images/example.gif", 17, 13),
        image_data,canvas, ctx,
        TILE_DIM = 5, INTS_PER_CHUNK = 4,
        tile_data_size, step, pixel_data = [], pixel_image, pw, ph, clamped_array;

    upload.drawImage();
    image_data = upload.getImageData();

    // read a whole game pixel
    step = upload.pdim;

    // read in the colour of the top-left pixel of every PIXEL_DIM square
    for (var y = 0; y < upload.img.height; y = y + step) {
        for (var x = 0; x < upload.img.width; x = x + step) {
            pixel_data = pixel_data.concat(image_data.readPixelData(x, y));
        }
    }

    pw = upload.img.width/upload.pdim;
    ph = upload.img.height/upload.pdim;

    clamped_array = new Uint8ClampedArray(pixel_data, pw, ph);
    pixel_image = new ImageData(clamped_array, pw, ph);

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    ctx.putImageData(pixel_image, upload.img.width, upload.img.height);

    console.log(upload.pw, upload.ph, image_data.data.length/tile_data_size);
});
