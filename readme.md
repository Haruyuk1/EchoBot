# EchoBot

Discord上であるチャンネルからあるチャンネルへ音声チャットを一方方向に流すbotです。AmongUs用に個人的に開発しました。

## 使い方

node.jsで動くものと、Windwos10 64bit上で動作するexe版があります。

1. tokens.jsonに音声を聞くようのbot(以下listener)、流す用のbot(streamer)のトークンをおいておきます。discordのbot導入方法は各自調べてください。
2. node.js版、あるいはexe版を起動。
3. discordのテキストチャンネルで?listener, ?streamerと入力すると発言した人のいる音声チャンネルにlistener, streamerのbotが参加します。
4. listener, streamerの両方が参加すると音声のパイプラインが開始します。
5. "?volume <@user> <0-100>"とテキストチャンネル上で発言するとユーザーごとの音量を調整することができます。
6. ?byeと発言するとlistener, streamerの両方がボイスチャンネルを退出します。


## 環境

* node.js版

    * node.js v12.9.1
    * 必要packageはpackage.jsonに掲載

* exe版

    * Winwos10 64bit


## 文責

* Haruyuk1
* sa990130@gmail.com

