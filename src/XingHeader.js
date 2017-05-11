const Mp3Header = require("./Mp3Header");

/**
 * The offsets of the "Xing"/"Info" keyword, relative to the end of the MP3 header.
 * The value changes based on the MPEG version and the number of channels
 */
const XING_OFFSETS = {
    1: { 1: 17, 2: 32 },
    2: { 1: 9,  2: 17 }
};

module.exports = class XingHeader {

    constructor(buffer) {

        this.mp3       = new Mp3Header(buffer);
        this.parsed    = false;
        this.is_valid  = false;

        this._parse();
    }

    _parse() {

        if (this.parsed) {
            return;
        }

        if (!this.mp3.parsed || !this.mp3.is_valid) {
            return;
        }

        // Copy "mpeg_*" properties from the mp3 header
        for (var key in this.mp3) {
            if (key.indexOf("mpeg_") === 0) {
                this[key] = this.mp3[key]
            }
        }

        // Not enough data
        if (this.mp3.buffer.length < this.mp3.mpeg_frame_length) {
            return;
        }

        this.parsed   = true;
        this.is_valid = false;

        // If this header don't contains a Xing/Info tag, nothing to do
        this.xing_offset  = this.mp3.header.length + XING_OFFSETS[this.mp3.mpeg_version][this.mp3.mpeg_channels];
        this.xing_keyword = this.mp3.buffer.toString("ascii", this.xing_offset, this.xing_offset + 4);
        if (this.xing_keyword !== "Xing" && this.xing_keyword != "Info") {
            return;
        }

        this.is_valid = true;

        this.xing_flags_offset    = this.xing_offset + 4;
        this.xing_flags           = this.mp3.buffer.readUInt8(this.xing_flags_offset + 3);
        this.xing_has_frames      = this.xing_flags & 0x01 == 0x01;
        this.xing_has_bytes       = this.xing_flags & 0x02 == 0x02;
        this.xing_frames_offset   = this.xing_flags_offset + 4;
        this.xing_bytes_offset    = this.xing_flags_offset + (this.xing_has_frames ? 4 : 0) + 4;
        this.xing_frames          = this.xing_has_frames ? this.mp3.buffer.readInt32BE(this.xing_frames_offset) : 0;
        this.xing_bytes           = this.xing_has_bytes ? this.mp3.buffer.readInt32BE(this.xing_bytes_offset) : 0;
    }
}