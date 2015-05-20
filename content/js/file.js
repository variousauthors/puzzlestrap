
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
