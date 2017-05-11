const XingHeader = require("./XingHeader");
const fs         = require("fs");

describe("XingHeader Parsing", function() {

    const fixtures_path = "/../fixtures";
    const expected_data = require(`./${fixtures_path}/file_metadata`);
    const MAX_FRAME_LENGTH = 2881; // Theoretical max mp3 frame length

    for (const data of expected_data) {

        const mode = data.channels > 1 ? "stereo" : "mono";

        it(`Should properly parse Xing info from MP3 file encoded as ${data.type} ${mode} ${data.samplerate}khz ${data.bitrate}kbps`, function(done) {

            fs.open( __dirname + fixtures_path + "/" + data.filename, 'r', function(err, fd) {
                if (err) {
                    fail(`Fixture file ${filename} can't be opened.`);
                    done();
                    return;
                }

                var buffer = new Buffer(MAX_FRAME_LENGTH);
                var offset = 0;

                fs.read(fd, buffer, 0, MAX_FRAME_LENGTH, offset, function(err, bytesRead, buffer) {

                    if (err) {
                        return fs.close(fd, function() {
                            fail(`Fixture file ${filename} can't be read.`);
                            done();
                        });
                    }

                    var header = new XingHeader(buffer);
                    if (!header.parsed || !header.is_valid) {
                        fail(`Fixture file ${filename} doesn't have a valid MPEG header.`);
                        done();
                        return;
                    }

                    expect(header.mpeg_layer).toBe(3);
                    expect(header.mpeg_channels).toBe(data.channels);
                    expect(header.mpeg_samplerate).toBe(data.samplerate);
                    expect(header.mpeg_frame_length).toBe(data.frame_length);
                    expect(header.mpeg_has_padding).toBeFalsy();
                    expect(header.mpeg_num_samples).toBe(1152);
                    expect(header.mpeg_bitrate).toBe(data.bitrate*1000);

                    expect(header.xing_offset).toBe(data.xing_offset);
                    expect(header.xing_frames).toBe(data.xing_frames);
                    expect(header.xing_bytes).toBe(data.xing_bytes);
                    expect(header.xing_has_frames).toBeTruthy();
                    expect(header.xing_has_bytes).toBeTruthy();
                    expect(header.xing_frames_offset).toBe(data.xing_offset + 8);
                    expect(header.xing_bytes_offset).toBe(data.xing_offset + 12);

                    fs.close(fd, function() {
                        done();
                    });
                });
            });
        });
    }

});