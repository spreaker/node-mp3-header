# Node.js MP3 Header Parsing

`npm install mp3-header`

### Full working example

```js
const fs        = require("fs");
const Mp3Header = require("mp3-header").Mp3Header;

const MAX_FRAME_LENGTH = 2881; // Theoretical max mp3 frame length

fs.open( "filename.mp3", 'r', function(err, fd) {
    var buffer = new Buffer(MAX_FRAME_LENGTH);

    fs.read(fd, buffer, 0, MAX_FRAME_LENGTH, 0, function(err, bytesRead, buffer) {

        if (err) {
            return fs.close(fd);
        }

        var header = new Mp3Header(buffer);
        if (header.parsed && header.is_valid) {
            console.info("MP3 Sample Rate: ", header.mpeg_samplerate);
        }

        fs.close(fd);
    });
});
```

### Classes

The package exports two classes for parsing MP3 file headers: `Mp3Header` and `XingHeader`. Both do essentially the same thing, the difference being that `XingHeader` also parses info related to the Xing table of the MP3 file.

### Properties

Once you parse a header, these are the properties you can access from the package classes:


| Parameter                  | Type     | Present in   | Example   |
| -------------------------- | -------- | ------------ | --------- |
| `parsed`                   | Boolean  | Both         | `true`    |
| `is_valid`                 | Boolean  | Both         | `true`    |
| `mpeg_version`             | Integer  | Both         | `2`       |
| `mpeg_layer`               | Integer  | Both         | `3`       |
| `mpeg_has_padding`         | Boolean  | Both         | `true`    |
| `mpeg_channels`            | Integer  | Both         | `1` (mono) or `2` (stereo)    |
| `mpeg_bitrate`             | Integer  | Both         | `128000`  |
| `mpeg_samplerate`          | Integer  | Both         | `44100`   |
| `mpeg_num_samples`         | Integer  | Both         | `1152`    |
| `mpeg_frame_length`        | Integer  | Both         | `384`     |
| `xing_offset`              | Integer  | `XingHeader` | `21`     |
| `xing_frames`              | Integer  | `XingHeader` | `223`     |
| `xing_bytes`               | Integer  | `XingHeader` | `43008`     |
| `xing_keyword`             | String   | `XingHeader` | `Xing` (VBR) or `Info` (CBR)     |
| `xing_flags`               | Integer  | `XingHeader` |           |
| `xing_has_frames`          | Boolean  | `XingHeader` | `true`    |
| `xing_has_bytes`           | Boolean  | `XingHeader` | `true`    |
| `xing_has_toc`             | Boolean  | `XingHeader` | `true`    |
| `xing_frames_offset`       | Integer  | `XingHeader` |           |
| `xing_bytes_offset`        | Integer  | `XingHeader` |           |
| `xing_toc_offset`          | Integer  | `XingHeader` |           |

### Run test suite

`grunt test`

### More info

* [https://www.codeproject.com/Articles/8295/MPEG-Audio-Frame-Header](https://www.codeproject.com/Articles/8295/MPEG-Audio-Frame-Header)
* [http://gabriel.mp3-tech.org/mp3infotag.html](http://gabriel.mp3-tech.org/mp3infotag.html)

### License

MIT
