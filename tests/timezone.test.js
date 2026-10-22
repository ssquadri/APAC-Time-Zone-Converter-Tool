const test = require('node:test');
const assert = require('node:assert/strict');
const { formatTime } = require('../timezone.js');

test('formats midnight', () => {
    assert.equal(formatTime(0), '12:00 AM');
});

test('formats noon', () => {
    assert.equal(formatTime(12), '12:00 PM');
});

test('formats a half-hour time', () => {
    assert.equal(formatTime(13.5), '1:30 PM');
});

test('formats an evening time', () => {
    assert.equal(formatTime(20), '8:00 PM');
});