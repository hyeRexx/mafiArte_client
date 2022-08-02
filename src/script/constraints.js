const constraints = [
    true, // test - high quality
    { // default
        width: {ideal: 640}, 
        height: {ideal: 360},
        frameRate: {ideal: 30}
    },
    { // 2명
        width: {ideal: 640, max: 640}, 
        height: {ideal: 360, max: 480},
        frameRate: {ideal: 30, max: 30}
    },
    { // 3명
        width: {max: 640}, 
        height: {max: 360},
        frameRate: {max: 27}
    },
    { // 4명
        width: {ideal: 320, max: 352}, 
        height: {ideal: 240, max: 288},
        frameRate: {ideal: 30, max: 30}
    },
    { // 5명
        width: {max: 320}, 
        height: {max: 240},
        frameRate: {ideal: 24, max: 27}
    },
    { // 6명
        width: {max: 320}, 
        height: {max: 240},
        frameRate: {ideal: 21, max: 24}
    },
    { // 7명
        width: {max: 176}, 
        height: {max: 144},
        frameRate: {max: 30}
    },
    { // 8명
        width: {max: 176}, 
        height: {max: 144},
        frameRate: {max: 24}
    }
];

const limits = [
    { // test - high
        maxBitrate: null,
        maxFramerate: 30
    },
    { // default
        maxBitrate: 500 * 1000,
        maxFramerate: 30
    },
    { // 2명
        maxBitrate: 500 * 1000,
        maxFramerate: 30
    },
    { // 3명
        maxBitrate: 500 * 1000,
        maxFramerate: 27
    },
    { // 4명
        maxBitrate: 500 * 1000,
        maxFramerate: 30
    },
    { // 5명
        maxBitrate: 300 * 1000,
        maxFramerate: 27
    },
    { // 6명
        maxBitrate: 270 * 1000,
        maxFramerate: 24
    },
    { // 7명
        maxBitrate: 128 * 1000,
        maxFramerate: 30
    },
    { // 8명
        maxBitrate: 128 * 1000,
        maxFramerate: 24
    }
];
export {constraints, limits};