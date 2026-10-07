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
    shadi: 'https://ice9.securenetsystems.net/SHADI?playSessionID=E6B93A54-076D-44EB-20F9B67C13966A59'
};

const SIMORGH_MOUNT = 'jl8n7thgcdftv';

let simorghMetadata = {
    title: '',
    history: []
};

async function connectSimorghMetadata() {
    const url = `https://api.zeno.fm/mounts/metadata/subscribe/${SIMORGH_MOUNT}`;

    try {
        const response = await fetch(url);

        if (!response.ok || !response.body) {
            throw new Error(`Zeno SSE error: ${response.status}`);
        }

        console.log('Simorgh metadata connected');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();

            if (done) {
                throw new Error('Zeno SSE connection closed');
            }

            buffer += decoder.decode(value, { stream: true });

            const events = buffer.split('\n\n');
            buffer = events.pop() || '';

            for (const event of events) {
                const dataLine = event
                    .split('\n')
                    .find(line => line.startsWith('data:'));

                if (!dataLine) {
                    continue;
                }

                try {
                    const data = JSON.parse(
                        dataLine.substring(5).trim()
                    );

                    if (data.streamTitle) {
                    const newTitle = data.streamTitle.trim();

                    if (newTitle !== simorghMetadata.title) {
                        simorghMetadata.title = newTitle;

                        simorghMetadata.history.unshift(newTitle);

                        simorghMetadata.history =
                            simorghMetadata.history.slice(0, 10);
                    }

                    console.log(
                        'Simorgh:',
                        simorghMetadata.title
                    );
                }

                } catch (error) {
                    console.error(
                        'Simorgh metadata parse error:',
                        error
                    );
                }
            }
        }
    } catch (error) {
        console.error(
            'Simorgh metadata connection error:',
            error
        );

        setTimeout(connectSimorghMetadata, 5000);
    }
}

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

    const metaInt = parseInt(
        response.headers.get('icy-metaint') || '8192',
        10
    );

    const reader = response.body.getReader();

    let audioBytes = metaInt;

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

            const metadataLength = value[offset] * 16;
            offset++;

            if (metadataLength === 0) {
                audioBytes = metaInt;
                continue;
            }

            if (offset + metadataLength > value.length) {
                throw new Error('Metadata split across chunks');
            }

            const metadataBytes = value.slice(
                offset,
                offset + metadataLength
            );

            offset += metadataLength;

            const metadata = new TextDecoder().decode(metadataBytes);

            const match = metadata.match(/StreamTitle='([^']*)'/);

            if (match && match[1]) {
                return match[1].trim();
            }

            audioBytes = metaInt;
        }
    }
}

app.get('/metadata/simorgh', (req, res) => {
    res.json({
        station: 'simorgh',
        title: simorghMetadata.title,
        history: simorghMetadata.history
    });
});

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
    connectSimorghMetadata();
});