const Mp3Header = require("./Mp3Header");

module.exports = class XingHeader extends Mp3Header {

    constructor(buffer) {
        super(buffer);
    }

    _parse() {
        super._parse();

        if (!this.parsed || !this.is_valid) {
            return;
        }

        // Not enough data
        if (this.buffer.length < this.mpeg_frame_length) {
            this.parsed   = false;
            this.is_valid = false;
            return;
        }

        this.parsed   = true;
        this.is_valid = false;

        // If this header don't contains a Xing/Info tag, nothing to do
        this.xing_offset  = this.header.length + this._getXingKeywordOffsetFromHeader(this.mpeg_version, this.mpeg_channels);
        this.xing_keyword = this.buffer.toString("ascii", this.xing_offset, this.xing_offset + 4);
        if (this.xing_keyword !== "Xing" && this.xing_keyword != "Info") {
            this.is_valid = false;
            return;
        }

        this.is_valid = true;

        this.xing_flags_offset    = this.xing_offset + 4;
        this.xing_flags           = this.buffer.readUInt8(this.xing_flags_offset + 3);
        this.xing_has_frames      = this.xing_flags & 0x01 == 0x01;
        this.xing_has_bytes       = this.xing_flags & 0x02 == 0x02;
        this.xing_has_toc         = this.xing_flags & 0x03 == 0x03;
        this.xing_frames_offset   = this.xing_flags_offset + 4;
        this.xing_bytes_offset    = this.xing_flags_offset + (this.xing_has_frames ? 4 : 0) + 4;
        this.xing_toc_offset      = this.xing_flags_offset + (this.xing_has_frames ? 4 : 0) + (this.xing_has_bytes ? 4 : 0) + 4;
        this.xing_frames          = this.xing_has_frames ? this.buffer.readInt32BE(this.xing_frames_offset) : 0;
        this.xing_bytes           = this.xing_has_bytes ? this.buffer.readInt32BE(this.xing_bytes_offset) : 0;

        /*
         * toc (table of contents) gives seek points for random access
         * the ith entry determines the seek point for i-percent duration
         * seek point in bytes = (toc[i]/256.0) * total_bitstream_bytes
         * e.g. half duration
         * seek point = (toc[50]/256.0) * total_bitstream_bytes
         */
    }

    _getXingKeywordOffsetFromHeader(version, channels) {

        if (version === 1) {
            return channels === 1 ? 17 : 32;
        }

        return channels === 1 ? 9 : 17;
    }
}