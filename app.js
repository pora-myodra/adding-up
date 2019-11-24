// 今回は、この CSV のデータから 「2010 年から 2015 年にかけて 15〜19 歳の人が増えた割合の都道府県ランキング」 を作成してみましょう。

// 一見難しそうに思いますが、一つ一つ何をすればいいかを考えていきましょう。

// これを実現するための要件をまとめると、次のようになります。

// ファイルからデータを読み取る
// 2010 年と 2015 年のデータを選ぶ
// 都道府県ごとの変化率を計算する
// 変化率ごとに並べる
// 並べられたものを表示する

'use strict';
const fs = require('fs');
const readline = require('readline');

// popu-pref.csv ファイルから、ファイルを読み込みを行う Stream（ストリーム）を生成し、 さらにそれを readline オブジェクトの input として設定し、 rl オブジェクトを作成しています。
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': {} });

// key: 都道府県 value: 集計データのオブジェクト
const prefectureDataMap = new Map();

// このコードは、rl オブジェクトで line というイベントが発生したら この無名関数を呼んでください、という意味です。
rl.on('line', (lineString) => {
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);
    if (year === 2010 || year === 2015) {
        let value = prefectureDataMap.get(prefecture);
        if (!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }

        if (year === 2010) {
            value.popu10 = popu;
        }

        if (year === 2015) {
            value.popu15 = popu;
        }

        prefectureDataMap.set(prefecture, value);
    }
});

rl.on('close', () => {
    // これは初めて見る書き方だと思いますが、for-of 構文といいます。
    // Map や Array の中身を of の前に与えられた変数に代入して for ループと同じことができます。
    // 配列に含まれる要素を使いたいだけで、添字は不要な場合に便利です。
    // また、 Map に for-of を使うと、キーと値で要素が 2 つある配列が前に与えられた変数に代入されます。ここでは分割代入という方法を使っています。 let [変数名1, 変数名2] のように変数と一緒に配列を宣言することで、第一要素の key という変数にキーを、第二要素の value という変数に値を代入することができます。
    for (let [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }

    // 比較関数は 2 つの引数を受けとって、
    // 前者の引数 pair1 を 後者の引数 pair2 より前にしたいときは、負の整数、
    // pair2 を pair1 より前にしたいときは、正の整数、
    // pair1 と pair2 の並びをそのままにしたいときは、 0 を返す必要があります。
    // ここでは変化率の降順に並び替えを行いたいので、 pair2 が pair1 より大きかった場合、pair2 を pair1 より前にする必要があります。
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });

    // ここに出てくる map ですが、先ほどの連想配列の Map とは別のもので、 map 関数といいます。読み方は同じですが、「連想配列の Map」と「map 関数」は別物なので気をつけてください。
    const rankingStrings = rankingArray.map(([key, value]) => {
        return key + ': ' + value.popu10 + '=>' + value.popu15 + ' 変化率:' + value.change;
    });
    console.log(rankingStrings);
});
