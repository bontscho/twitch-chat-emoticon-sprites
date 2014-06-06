var argv    = require('minimist')(process.argv.slice(2), { boolean: ["g", "s", "n"] }),
    Builder = require( 'node-spritesheet' ).Builder,
    https = require('https'),
    http = require('http'),
    path = require('path'),
    queue = require('queue'),
    swig    = require('swig'),
    fs = require('fs'),
    status = 0;

// create temp-folder
if(!fs.existsSync(__dirname + "/tmp")) {
    fs.mkdirSync(__dirname + "/tmp");
}

// queue timeout 30s
var q = queue({
    timeout: 30000,
    concurrency: 10
});

var TWITCH_EMOTES_GLOBAL_URL = "https://api.twitch.tv/kraken/chat/emoticons";
var TWITCH_EMOTES_CHANNEL_URL = "https://api.twitch.tv/kraken/chat/:channel/emoticons";

var icons = {};
var urls = [];
// for non-letter emoticons
var smileyIndex = 1;

// Parse ARGV
// parse channel
argv["_"].forEach(function(channel) {
    urls.push(TWITCH_EMOTES_CHANNEL_URL.replace(":channel", channel));
});
// check if global
if(argv["g"]) {
    urls.push(TWITCH_EMOTES_GLOBAL_URL);
}

// put every url in queue to crawl json
urls.forEach(function(url) {
    q.push(function(cb) {
        https.get(url, function(res) {

            var body = '';
            res.on('data', function(chunk) {
                body += chunk;
            });

            res.on('end', function(a,b) {
                if(res.statusCode != 200) {
                    console.log("Reading URL: " + url + " ERROR");
                    cb();
                    return;
                }
                var jsonResponse = JSON.parse(body);
                jsonResponse["emoticons"].forEach(function(emote) {
                    var regex = emote["regex"];
                    var emoteUrl;

                    if(!regex.match(/^[a-zA-Z][a-zA-Z0-9-_]*$/))  {
                        regex = "smiley-" + smileyIndex++;
                    }

                    if(emote["url"]) {
                        emoteUrl = emote["url"]

                    } else {
                        // global icon has different json format
                        emoteUrl = emote["images"][0]["url"];
                    }
                    icons[regex + path.extname(emoteUrl)] = emoteUrl;
                });
                console.log("Reading URL: " + url + " OK");
                cb();
            });
        }).on('error', function(e) {
            console.log("Error:", e);
        });
    })
});

q.on('end', function() {
    if(status == 1) {
        console.log("Emoticon Download Finished");
        generateSprites();
    }

    if(status == 0) {
        console.log("JSON Download finished")
        status = 1;
        downloadIcons();
    }
})

q.start();

function downloadIcons() {
    Object.keys(icons).forEach(function(k) {
        q.push(function(cb) {
            var file = fs.createWriteStream(__dirname + "/tmp/" + k, { flags: 'w' });
            var request = http.get(icons[k], function(response) {
                response.pipe(file);
                console.log("Downloaded: " + k);
                cb();
            });
        });
    });

    q.start();
}

function generateSprites() {
    var images = [];
    Object.keys(icons).forEach(function(k) {
        images.push("tmp/" + k);
    });
    var builder = new Builder({
        outputDirectory: 'assets',
        outputImage: 'images/twitch-emoticons.png',
        outputCss: 'stylesheets/twitch-emoticons.css',
        selector: '.twitch',
        images: images
    });

    builder.build( function() {
        console.log( "Spritesheet built from " + builder.files.length + " images" );

        // now insert display: inline into the css file since its hardcoded in the spritesheet package
        fs.readFile(__dirname + "/assets/stylesheets/twitch-emoticons.css", function(err, data) {
            var array = data.toString().split("\n");
            array.splice(1,0, "  display: inline-block;");
            for(i=0;i<array.length;i++) {
                fs.appendFileSync(__dirname + "/assets/stylesheets/twitch-emoticons.css", array[i]+'\n');
            }
        });

        // generate showcase
        if(argv["s"]) {
            var template = swig.compileFile(__dirname + "/src/showcase.html.swig");
            var output = template({
                icons: Object.keys(icons).sort().map(function(o) { return path.basename(o, path.extname(o)); })
            });

            fs.writeFileSync("showcase.html", output);
            console.log("Showcase generated");
        }

        // no cleanup?
        if(!argv["n"]) {
            Object.keys(icons).forEach(function(k) {
                fs.unlinkSync(__dirname + "/tmp/" + k);
            });
            fs.rmdirSync(__dirname + "/tmp");
            console.log("Temporary files removed")
        }
    });
}