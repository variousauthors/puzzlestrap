NEXTSTEPS
---------

- PuzzleTile
  - name: string
  - colors: array of hex
  - map: string (array of char)
  - data: Uint8ClampedArray

- would like a hash function to hash up a tile by its colors and map (unique)

currently the step is the width of a tile pixel,
but now we will increase the outer step to 5 times that
so we can read in one PuzzleTile at a time

bigstep is pixel dim times tile dim
step is pixel dim

tiles = {}
legend = {}

for y from 0 to image height in bigsteps
    for x from 0 to image width in bigsteps
        p = new PuzzleTile
        map_index = indexFrom(x, y)

        for j from y to y + tile_pixel_dim (20) in steps (4)
            p.map[j] = ""

            for i from x to x + tile_pixel_dim (20) in steps (4)
                data = readPixelData(i, j)

                // colors are unique
                hex = constructHex(data)
                p.colors[hex] = p.colors.length + 1 (a map from hex to number)

                p.map[j][i] = p.colors[hex] (populate the map; javascript ith index of a string)

        p.name = mix(p.map) // get a hash
        tiles[p.name] = p // unique tile
        legend[p.name] = unicodeFromHash(p.name)
        map[map_index] = legend[p.name] // a unicode char

// we have a legend, a map, and a tileset
