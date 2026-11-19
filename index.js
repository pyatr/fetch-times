#!/usr/bin/env node
'use strict';

import { Buffer } from 'node:buffer';

const DEFAULT_COUNT = 10;
const DEFAULT_TIMEOUT_MS = 30000;

async function requestUrl(url) {
    const startedAt = Date.now();
    const response = await fetch(url, {
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
        headers: { Accept: 'application/octet-stream' },
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
    }

    if (!response.body) {
        throw new Error(`No response body for ${url}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    return {
        waitMs: Date.now() - startedAt,
        bytes: buffer.length,
    };
}

async function main() {
    const url = process.argv[2];
    const count = parseInt(process.argv[3] || DEFAULT_COUNT, 10);

    let totalRequestTimeMs = 0;
    let totalBytes = 0;

    for (let i = 1; i <= count; i++) {
        const result = await requestUrl(url);
        totalRequestTimeMs += result.waitMs;
        totalBytes += result.bytes;
        console.log(`Request ${i}/${count}: wait=${result.waitMs}ms, bytes=${result.bytes}`);
    }

    let averageRequestTime = totalRequestTimeMs / count;
    let averageDownloadSpeed = totalBytes / totalRequestTimeMs;

    console.log(`Average request time: ${averageRequestTime} ms`);
    console.log(`Total downloaded data volume: ${totalBytes} bytes`);
    console.log(`Average download speed: ${(averageDownloadSpeed * 1000 / 1024 / 1024).toFixed(2)} MB/s`);
}

main().catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});
