# Node.js MP3 Header Parsing

`npm install mp3-header`

### Full working example (mp3)

```js
const fs        = require("fs");
const Mp3Header = require("mp3-header").Mp3Header;

const HEADER_LENGTH = 4;

fs.open("filename.mp3", 'r', function(err, fd) {

    var buffer  = new Buffer(HEADER_LENGTH);

    // The offset in the mp3 file where there is a valid MP3 frame
    var offset  = 0;

    fs.read(fd, buffer, 0, HEADER_LENGTH, offset, function(err, bytesRead, buffer) {

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

### Full working example (XING)

```js
const fs         = require("fs");
const XingHeader = require("mp3-header").XingHeader;

const MAX_FRAME_LENGTH = 2881; // Theoretical max mp3 frame length

fs.open( "filename.mp3", 'r', function(err, fd) {

    var buffer  = new Buffer(MAX_FRAME_LENGTH);

    // The offset in the mp3 file where there is a valid Xing header
    var offset  = 0;

    fs.read(fd, buffer, 0, MAX_FRAME_LENGTH, offset, function(err, bytesRead, buffer) {

        if (err) {
            return fs.close(fd);
        }

        var header = new XingHeader(buffer);
        if (header.parsed && header.is_valid) {
            console.info("Number of audio frames: ", header.xing_frames);
        }

        fs.close(fd);
    });
});
```

### Classes

The package exports two classes for parsing MP3 file headers: `Mp3Header` and `XingHeader`.

`Mp3Header` is the one that takes care of parsing the MPEG header of an MP3 audio frame, and provides informations about the encoding.

`XingHeader` is an extension `Mp3Header` that also takes care of parsing the metadata related to the Xing table of the MP3 file.

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
| `xing_frames_offset`       | Integer  | `XingHeader` |           |
| `xing_bytes_offset`        | Integer  | `XingHeader` |           |

### Run test suite

`grunt test`

### More info

* [https://www.codeproject.com/Articles/8295/MPEG-Audio-Frame-Header](https://www.codeproject.com/Articles/8295/MPEG-Audio-Frame-Header)
* [http://gabriel.mp3-tech.org/mp3infotag.html](http://gabriel.mp3-tech.org/mp3infotag.html)

### License

MIT
