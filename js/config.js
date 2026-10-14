window.RADIO_CONFIG = {
    RADIO_NAME: 'Radio Lahze',
    URL_STREAMING: 'http://www.radiofaaz.com:8000/radiofaaz',

    RADIOS: [
        {
            id: 0,
            name: 'Radio Lahze',
            url: 'http://www.radiofaaz.com:8000/radiofaaz',
            metadata: 'faaz'
        },
        {
            id: 1,
            name: 'Radio Shoma',
            url: 'https://n12.radiojar.com/rzcfw4cbsxquv?rj-ttl=5&rj-tok=AAABoRabscAAMNyEN531GZmlYw',
            metadata: 'shoma'
        },
        {
            id: 2,
            name: 'Radio Navahang',
            url: 'https://navairan.com/;stream.nsv',
            metadata: 'navahang'
        },
        {
            id: 3,
            name: 'Radio Shadi',
            url: 'https://ice9.securenetsystems.net/SHADI?playSessionID=E6B93A54-076D-44EB-20F9-B67C13966A59',
            metadata: 'shadi'
        },
        {
            id: 4,
            name: 'Relaxing Piano',
            url: 'https://relaxing-piano.stream.laut.fm/relaxing-piano',
            metadata: 'piano'
        },
        {
            id: 5,
            name: 'Radio Varzesh',
            url: 'http://s6.cdn3.iranseda.ir:1935/liveedge/radio-varzesh/chunklist_w83714761.m3u8',
            metadata: 'varzesh'
        },
        {
            id: 6,
            name: 'Radio Javan',
            url: 'http://s6.cdn3.iranseda.ir:1935/liveedge/radio-javan/chunklist_w9784270.m3u8',
            metadata: 'javan'
        },
        {
            id: 7,
            name: 'Radio Ava',
            url: 'http://s2.cdn1.iranseda.ir:1935/liveedge/radio-avaa/chunklist_w903692364.m3u8',
            metadata: 'ava'
        },
        {
            id: 8,
            name: 'Tehran Music',
            url: 'https://live.iranradio.ir:8000/live-en.mp3',
            metadata: 'tehran'
        }
    ]
};

// Assign mode automatically based on station ID.
window.RADIO_CONFIG.RADIOS.forEach(station => {
    station.mode = station.id <= 4 ? 'Business' : 'Economy';
});

window.AI_RADIO_MAP = {
    sad: 1,
    stress: 2,
    happy: 3,
    neutral: 4,
    narahat: 5,
    moztareb: 6,
    khoshal: 7,
    khonsa: 8
};

window.AI_MOOD_NAMES = {
    sad: 'Sad',
    stress: 'stress',
    happy: 'Happy',
    neutral: 'Neutral',
    narahat: 'Narahat',
    moztareb: 'Moztareb',
    khoshal: 'Khoshal',
    khonsa: 'Khonsa'
};