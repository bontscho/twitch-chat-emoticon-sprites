# Twitch Chat Emoticons CSS Sprites Generator

Generates CSS Spritesheet for given Twitch Channel(s). The example here includes the spritesheet for the channel [WagamamaTV](http://twitch.tv/wagamamatv).

## Demo & Usage

Open the `showcase.html` for a demo and class reference.

Usage:

```html
<i class="twitch Kappa"></i>
<i class="twitch BibleThump"></i>
```

## Dependencies

* ImageMagick

on Ubuntu: `sudo apt-get install imagemagick`

## Installation

`npm install`

## Generate Usage

`node generate.js [-gns] [channel1, channel2, ...]`

### Options

* `g` (global): Reads global emoticons (over 9000! _NOT_ recommended, this can take hours and the spritesheet is 15.5MB!)
* `n` (no-cleanup): Keeps downloaded Images
* `s` (showcase): Generates showcase.html with all images

## Examples

1. Generates Spritesheet with the emoticons from the channel `myusername`:

```
node generate.js myusername
```

2. Generates Spritesheet with the emoticons from the channels `myuser1` and `myuser2`, keeps the downloaded images and generates the `showcase.html` to demonstrate all icons:

```
node generate.js -ns myuser1 myuser2

----------

Images are property of Twitch.