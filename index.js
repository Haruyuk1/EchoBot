/// <reference path="typings/tsd.d.ts" />
const Discord = require('discord.js');
const listener_client = new Discord.Client();
const streamer_client = new Discord.Client();
const fs = require('fs');
const token_json = JSON.parse(fs.readFileSync('./tokens.json', 'utf8'));
const listener_token = token_json.listener_token;
const streamer_token = token_json.streamer_token;
let listener_voice_connection = null;
let streamer_voice_connection = null;


// 空音声を一度流すためのクラス
const {Readable}=require('stream');
class Silence extends Readable{
  _read(){this.push(Buffer.from([0xF8,0xFF,0xFE]))}
};


const AudioMixer = require('audio-mixer');
const mixer = new AudioMixer.Mixer({
    channels: 2,
    bitDepth: 16,
    sampleRate: 48000,
    clearInterval: 250
});
const volume_map = new Map();
let is_streaming = false;


listener_client.on('ready', () => {
    console.log(`Logged in as ${listener_client.user.tag}!`);
});


listener_client.on('message', msg => {
    if (msg.content === '?listener') {
        msg.member.voice.channel.join() // VCに参加
            .then(connection => {
                listener_voice_connection = connection;
                connection.play(new Silence, {type:'opus'});
                connection.on('speaking', (user, speaking) => {
                    if (speaking.bitfield === Discord.Speaking.FLAGS.SPEAKING) {
                        console.log(`${user.tag} is speaking!`);
                        const user_stream = connection.receiver.createStream(user, {mode:"pcm", end:"silence"});
                        const vol = volume_map.has(user) ? volume_map.get(user) : 100; // 音量を調整
                        const input = new AudioMixer.Input({
                            channels: 2,
                            bitDepth: 16,
                            sampleRate: 48000,
                            volume: vol
                        });
                        user_stream.on('end', () => {
                            user_stream.unpipe(input);
                            mixer.removeInput(input);
                            console.log(`${user.tag} is removed from mixer!`);
                        })
                        mixer.addInput(input);
                        user_stream.pipe(input);
                        console.log(`${user.tag} is added to mixer!`);       
                        if (!is_streaming && streamer_voice_connection) {
                            console.log('now playing!');
                            streamer_voice_connection.play(mixer, {type:"converted"});
                            is_streaming = true;
                        };
                    };
                });
            });
    };
    if (msg.content.startsWith("?volume") && !msg.author.bot) {
        if (msg.content.split(' ').length === 3) {
            const vol = Number(msg.content.split(' ')[2]);
            if (isNaN(vol) || vol < 0 || 100 < vol) {msg.channel.send('?volume <@user> <0-100> の形式で入力してください。');}
            else {
                const member = msg.mentions.members.first()
                if (!member) {msg.channel.send('ユーザーを見つけられませんでした。')}
                else {
                    volume_map.set(member.user, vol);
                    msg.channel.send(`${member.user.tag}の音量を${vol}にしました。`);
                }
            }
        } else {
            msg.channel.send('?volume <@user> <0-100> の形式で入力してください。');
        }
    };
    if (msg.content.startsWith('?bye')) {
        if (listener_voice_connection) {listener_voice_connection.disconnect()};
    }
});


streamer_client.on('ready', () => {
    console.log(`Logged in as ${streamer_client.user.tag}!`);
});


streamer_client.on('message', msg => {
    if (msg.content === '?streamer') {
        msg.member.voice.channel.join() // VCに参加
            .then(connection => {
                streamer_voice_connection = connection
                is_streaming = false; // 参加した直後はfalse
            });
    };
    if (msg.content.startsWith('?bye')) {
        if (streamer_voice_connection) {streamer_voice_connection.disconnect()};
    }
});

listener_client.login(listener_token);
streamer_client.login(streamer_token);