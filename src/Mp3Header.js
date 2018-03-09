/**
 * Bitrates table:
 * the bitrate value is calculated based on the mpeg version and layer
 */
const BITRATES = {
    1: {
        1: [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 0],
        2: [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, 0],
        3: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
        4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    2: {
        1: [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256, 0],
        2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
        3: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
        4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
}

/**
 * Sample rate table:
 * the sample rate value is calculated based on the mpeg version
 */
const SAMPLE_RATES = {
    1: [44100, 48000, 32000, 0],
    2: [22050, 24000, 16000, 0]
}

/**
 * Samples per frame table:
 * the number of samples per frame is calculated based on the mpeg version and layer
 */
const SAMPLES_PER_FRAME = {
    1: {0: 0, 1: 384, 2: 1152, 3: 1152},
    2: {0: 0, 1: 384, 2: 1152, 3: 576}
}

module.exports = class Mp3Header {

    constructor(buffer) {

        this.buffer   = buffer;
        this.parsed   = false;
        this.header   = null;
        this.is_valid = false;

        this._parse();
    }

    _parse() {

        if (this.parsed) {
            return;
        }

        // Not enough data to read the header
        if (this.buffer.length < 4) {
            return;
        }

        this.parsed = true;

        // Read the first 4 bytes
        var header = [this.buffer.readUInt8(0), this.buffer.readUInt8(1), this.buffer.readUInt8(2), this.buffer.readUInt8(3)];
        this.is_valid = this._isMpegHeader(header);
        if (!this.is_valid) {
            return;
        }

        this.header             = header;
        this.mpeg_version       = this._getMpegVersion(header[1] >> 3);
        this.mpeg_layer         = this._getMpegLayer(header[1] >> 1);

        if (!this.mpeg_version || !this.mpeg_layer) {
            this.is_valid = false;
            return;
        }

        this.mpeg_has_padding   = (header[2] & 0x02) >> 1 == 0x01;
        this.mpeg_channels      = this._getMpegChannels(header[3] >> 6);
        this.mpeg_bitrate       = this._getMpegBitrate(this.mpeg_version, this.mpeg_layer, header[2] >> 4);
        this.mpeg_samplerate    = this._getMpegSampleRate(this.mpeg_version, header[2] >> 2);
        this.mpeg_num_samples   = this._getMpegNumSamples(this.mpeg_version, this.mpeg_layer);
        this.mpeg_frame_length  = this._getMpegFrameLength(
            this.mpeg_has_padding,
            this.mpeg_samplerate,
            this.mpeg_layer,
            this.mpeg_bitrate,
            this.mpeg_num_samples
        );
    }

    _isMpegHeader(header) {
        return (((header[0] & 0xFF) << 8)  | ((header[1] & 0xF0))) == 0xFFF0;
    }

    _getMpegVersion(num) {

       /*
        00 - MPEG Version 2.5 (unofficial)
        01 - reserved
        10 - MPEG Version 2 (ISO/IEC 13818-3)
        11 - MPEG Version 1 (ISO/IEC 11172-3)
        */

        if ((num & 0x03) == 0x03) {
            return 1;
        }

        if ((num & 0x02) == 0x02) {
            return 2;
        }

        return 0;
    }

    _getMpegLayer(num) {

        /**
         00 - reserved
         01 - Layer III
         10 - Layer II
         11 - Layer I
        */

        if ((num & 0x03) == 0x03) {
            return 1;
        }

        if ((num & 0x02) == 0x02) {
            return 2;
        }

        if ((num & 0x01) == 0x01) {
            return 3;
        }

        return 0;
    }

    _getMpegChannels(num) {

        /*
        00 - Stereo
        01 - Joint stereo (Stereo)
        10 - Dual channel (2 mono channels)
        11 - Single channel (Mono)
        */

        if ((num & 0x03) == 0x03) {
            return 1;
        }

        return 2;
    }

    _getMpegBitrate(version, layer, num) {

        return BITRATES[version][layer][num & 0x0F] * 1000;
    }

    _getMpegSampleRate(version,  num) {

        return SAMPLE_RATES[version][num & 0x03];
    }

    _getMpegNumSamples(version, layer) {

        return SAMPLES_PER_FRAME[version][layer];
    }

    _getMpegFrameLength(has_padding, sample_rate, layer, bitrate, num_samples) {

        var padding = has_padding ? 1 : 0;
        if (sample_rate == 0) {
            return 0;
        }

        if (layer == 1) {
            return Math.floor(12.0 * bitrate / sample_rate + padding) * 4;
        }

        return Math.floor(num_samples * (bitrate / 8) / sample_rate) + padding;
    }
}