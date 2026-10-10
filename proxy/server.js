const express = require('express');
const cors = require('cors');
const app = express();

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const PORT = 3000;

const STREAMS = {
    shoma: 'https://n12.radiojar.com/rzcfw4cbsxquv?rj-ttl=5&rj-tok=AAABoRabscAAMNyEN531GZmlYw',
    navahang: 'https://navairan.com/;stream.nsv',
    shadi: 'https://ice9.securenetsystems.net/SHADI?playSessionID=E6B93A54-076D-44EB-20F9-B67C13966A59',
    piano: 'https://relaxing-piano.stream.laut.fm/relaxing-piano',
    iran: 'http://s1.cdn1.iranseda.ir:1935/liveedge/radio-iran/playlist.m3u8',
    payam: 'http://s1.cdn1.iranseda.ir:1935/liveedge/radio-payam/playlist.m3u8',
    ava: 'http://s2.cdn1.iranseda.ir:1935/liveedge/radio-avaa/chunklist_w903692364.m3u8',
    quran: 'https://radio.mp3islam.com/listen/abdulbasit/radio.mp3'
};

async function getIcyMetadata(url) {
    const response = await fetch(url, {
        headers: {
            'Icy-MetaData': '1',
            'User-Agent': 'VLC/3.0.20'
        }
    });

    if (!response.ok || !response.body) {
        throw new Error(`Stream error: ${response.status}`);
    }

    console.log('Stream URL:', url);
    console.log('ICY-MetaInt:', response.headers.get('icy-metaint'));

    const icyMetaInt = response.headers.get('icy-metaint');

    if (!icyMetaInt) {
        await response.body.cancel();
        throw new Error('ICY metadata is not supported by this stream');
    }

    const metaInt = parseInt(icyMetaInt, 10);

    const reader = response.body.getReader();

    let audioBytes = metaInt;
    let metadataLength = null;
    let metadataBuffer = new Uint8Array(0);

    while (true) {
        const { value, done } = await reader.read();

        if (done) {
            throw new Error('Stream ended');
        }

        let offset = 0;

        while (offset < value.length) {

            if (audioBytes > 0) {
                const skip = Math.min(
                    audioBytes,
                    value.length - offset
                );

                audioBytes -= skip;
                offset += skip;
                continue;
            }

            if (metadataLength === null) {
                metadataLength = value[offset] * 16;
                offset++;

                if (metadataLength === 0) {
                    audioBytes = metaInt;
                    metadataLength = null;
                    metadataBuffer = new Uint8Array(0);
                    continue;
                }
            }

            const remainingMetadata =
                metadataLength - metadataBuffer.length;

            const availableBytes =
                value.length - offset;

            const take = Math.min(
                remainingMetadata,
                availableBytes
            );

            const chunk = value.slice(
                offset,
                offset + take
            );

            const combined = new Uint8Array(
                metadataBuffer.length + chunk.length
            );

            combined.set(metadataBuffer);
            combined.set(chunk, metadataBuffer.length);

            metadataBuffer = combined;

            offset += take;

            if (metadataBuffer.length < metadataLength) {
                continue;
            }

            const metadata = new TextDecoder().decode(
                metadataBuffer
            );

            const match = metadata.match(
                /StreamTitle='([^']*)'/
            );

            if (match && match[1]) {
                return match[1].trim();
            }

            audioBytes = metaInt;
            metadataLength = null;
            metadataBuffer = new Uint8Array(0);
        }
    }
}

app.get('/metadata/:station', async (req, res) => {
    const station = req.params.station;
    const url = STREAMS[station];

    if (!url) {
        return res.status(404).json({
            error: 'Unknown station'
        });
    }

    try {
        const title = await getIcyMetadata(url);

        res.json({
            station,
            title
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Metadata proxy running on http://localhost:${PORT}`);
});