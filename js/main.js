var AugmentedImageData = function (ctx, x, y, h, w) {
    var data;

    data = ctx.getImageData(x, y, h, w);

    // iterate over the image data and extract a single pixel
    // given the top left corner in the image data
    data.readPixel = function (x, y) {

    };

    return data
},

ImageUpload = function (src, w, h) {
    "use strict";

    var canvas, ctx, img, upload;

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
    // use this to determine the height/width of our pixel
    upload.pw = img.width / upload.w;
    upload.ph = img.height / upload.h;

    if (upload.pw !== upload.ph) { throw "the image is bad"; }

    upload.pdim = upload.pw;

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
        image_data = upload.getImageData(),
        TILE_DIM = 5, INTS_PER_CHUNK = 4,
        tile_data_size, p;

    tile_data_size = upload.pdim * TILE_DIM * INTS_PER_CHUNK;

    // read a whole game pixel
    p = image_data.readPixel(0, 150);

    upload.drawImage();

    console.log(upload.pw, upload.ph, image_data.data.length/tile_data_size);
});
