import {VoiceBasedChannel} from "discord.js";
import {CustomPluginPlayOptions, CustomPlugin, DisTubeError, checkInvalidKey} from "distube";
import axios from "axios";

function getBinID(url: string): string {
    const part = url.split('/');
    return part[part.length - 1];
}

function sameOrigin(url1: string, url2: string): boolean {
    const uri1: URL = new URL(url1);
    const uri2: URL = new URL(url2);
    if (uri1.host !== uri2.host ||
        uri1.port !== uri2.port ||
        uri1.protocol !== uri2.protocol)
        return false;
    return true;
}

function isURL(string: string): boolean {
    try {
        new URL(string);
        return true;
    } catch (e) {
        return false;
    }
}

declare type HastebinPluginOptions = {
    host: string;
};

class HastebinPlugin extends CustomPlugin {
    public defaultHost: string = 'https://www.toptal.com/developers/hastebin/';
    public host: string;

    constructor(options?: HastebinPluginOptions) {
        super();

        checkInvalidKey(options!, ['host'], 'HastebinPluginOptions');

        this.host = options?.host ?? this.defaultHost;
    }

    async validate(url: string): Promise<boolean> {
        let pattern = new RegExp(
            '^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$',
            'i'
        ); // fragment locator
        return pattern.test(url) && sameOrigin(this.host, url);
    }

    async play (
        voiceChannel:VoiceBasedChannel,
        url: string,
        options: CustomPluginPlayOptions,
    ): Promise<void> {
        const DT = this.distube;
        const binID = getBinID(url);
        const { member, textChannel } = options;

        const rawData = await axios.get(this.host + 'raw/' + binID).catch(e => {
            if (e.response.status === 404) {
                throw new DisTubeError('HOST_NOT_FOUND', 'Play error: Not found Hastebin host');
            } else if (e.response.status !== 200) {
                throw new DisTubeError('HOST_ERROR', 'Play error: Unexpected error happened when fetching data');
            }
        });

        const binData = rawData!.data;
        const urlList = binData.split('\n').filter((line: string) => isURL(line));

        if (urlList.length < 1) {
            throw new DisTubeError('BIN_EMPTY', 'No url found in bin');
        }
        else {
            const userVoiceChannel = member!.voice.channel;
            const playlist = urlList.length > 1 ? await DT.createCustomPlaylist(urlList, {properties: {  }}) : urlList[0]

            await DT.play(userVoiceChannel!, playlist, {
                member,
                textChannel,
            })
        }
    }
}

module.exports = { HastebinPlugin };
