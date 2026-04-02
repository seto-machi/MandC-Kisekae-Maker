
// Parts data
const PARTS_DATA = {
    background: [
        { id: 1, name: 'Dance Hall', url: 'img/background_1.jpg' },
        { id: 2, name: 'Cafe', url: 'img/background_2.jpg' },
        { id: 3, name: 'Limsa', url: 'img/background_3.jpg' },
        { id: 4, name: 'Bed Room', url: 'img/background_4.jpg' },
        { id: 5, name: 'Wear Shop', url: 'img/background_5.jpg' }
    ],
    'body-momo': [
        { id: 1, name: 'Body-momo 1', url: 'img/body_momo_1.png' }
    ],
    'body-cocoa': [
        { id: 1, name: 'Body-cocoa 1', url: 'img/body_cocoa_1.png' }
    ],
    'outfit-momo': [
        { id: 1, name: 'Outfit-momo 1', url: 'img/outfit_momo_1.png' },
        { id: 2, name: 'Outfit-momo 2', url: 'img/outfit_momo_2.png' },
        { id: 3, name: 'Outfit-momo 3', url: 'img/outfit_momo_3.png' },
        { id: 4, name: 'Outfit-momo 4', url: 'img/outfit_momo_4.png' },
        { id: 5, name: 'Outfit-momo 5', url: 'img/outfit_momo_5.png' },
        { id: 6, name: 'Outfit-momo 6', url: 'img/outfit_momo_6.png' },
        { id: 7, name: 'Outfit-momo 7', url: 'img/outfit_momo_7.png' },
        { id: 8, name: 'Outfit-momo 8', url: 'img/outfit_momo_8.png' }

    ],
    'outfit-cocoa': [
        { id: 1, name: 'Outfit-cocoa 1', url: 'img/outfit_cocoa_1.png' },
        { id: 2, name: 'Outfit-cocoa 2', url: 'img/outfit_cocoa_2.png' },
        { id: 3, name: 'Outfit-cocoa 3', url: 'img/outfit_cocoa_3.png' },
        { id: 4, name: 'Outfit-cocoa 4', url: 'img/outfit_cocoa_4.png' },
        { id: 5, name: 'Outfit-cocoa 5', url: 'img/outfit_cocoa_5.png' },
        { id: 6, name: 'Outfit-cocoa 6', url: 'img/outfit_cocoa_6.png' },
        { id: 7, name: 'Outfit-cocoa 7', url: 'img/outfit_cocoa_7.png' },
        { id: 8, name: 'Outfit-cocoa 8', url: 'img/outfit_cocoa_8.png' },
    ]
};

/// 1. 状態管理（これが無いとエラーになります）
let selections = {
    background: 1,
    'body-momo': 1,
    'outfit-momo': 1,
    'body-cocoa': 1,
    'outfit-cocoa': 1
};

// 2. 要素の取得
const mainCanvas = document.getElementById('canvas-main');
const mainCtx = mainCanvas?.getContext('2d');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');

// 3. 画像読み込み補助関数
function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load: ${url}`));
        img.src = url;
    });
}

// 4. パーツ選択UIの生成
function initializeParts() {
    Object.entries(PARTS_DATA).forEach(([category, parts]) => {
        const container = document.getElementById(category);
        if (!container) return;

        parts.forEach(part => {
            const button = document.createElement('div');
            button.className = 'part-option';
            if (selections[category] === part.id) button.classList.add('selected');

            button.innerHTML = `
                <img src="${part.url}" alt="${part.name}">
                <div class="part-name">${part.name}</div>
            `;

            button.addEventListener('click', () => {
                selections[category] = part.id;
                // UIの選択状態を更新
                container.querySelectorAll('.part-option').forEach(el => el.classList.remove('selected'));
                button.classList.add('selected');
                // プレビューを更新
                updateFullPreview();
            });
            container.appendChild(button);
        });
    });
}

// 5. キャラクター描画（一時キャンバスを使用）
async function drawCharacter(name) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 512;
    tempCanvas.height = 512;
    const tCtx = tempCanvas.getContext('2d');

    const bodyId = selections[`body-${name}`];
    const outfitId = selections[`outfit-${name}`];

    const bodyPart = PARTS_DATA[`body-${name}`]?.find(p => p.id === bodyId);
    const outfitPart = PARTS_DATA[`outfit-${name}`]?.find(p => p.id === outfitId);

    if (bodyPart) {
        const bImg = await loadImage(bodyPart.url);
        tCtx.drawImage(bImg, 0, 0, 300, 424);
    }
    if (outfitPart) {
        const oImg = await loadImage(outfitPart.url);
        tCtx.drawImage(oImg, 0, 0, 300, 424);
    }

    return tempCanvas;
}

// 6. メイン描画ロジック
async function updateFullPreview() {
    try {
        loadingSpinner?.classList.add('show');

        // データの取得
        const bgPart = PARTS_DATA.background.find(p => p.id === selections.background);
        const bgImg = await loadImage(bgPart.url);
        const momoCanvas = await drawCharacter('momo');
        const cocoaCanvas = await drawCharacter('cocoa');

        // メインキャンバスへの描画
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

        // レイヤー順：背景 -> Momo -> Cocoa
        mainCtx.drawImage(bgImg, 0, 0, mainCanvas.width, mainCanvas.height);

        // もし二人が重なるなら、ここで座標をずらせます
        // 例: mainCtx.drawImage(momoCanvas, -50, 0);
        mainCtx.drawImage(momoCanvas, 0, 50, mainCanvas.width, mainCanvas.height);
        mainCtx.drawImage(cocoaCanvas, 200, 50, mainCanvas.width, mainCanvas.height);

        loadingSpinner?.classList.remove('show');
    } catch (err) {
        console.error(err);
        loadingSpinner?.classList.remove('show');
    }
}

// 7. タブ切り替えロジック
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tab = button.dataset.tab;
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(tab).classList.add('active');
    });
});


// ダウンロードボタンの処理
const downloadBtn = document.getElementById('downloadBtn');
downloadBtn?.addEventListener('click', () => {
    const mainCanvas = document.getElementById('canvas-main'); // ここが canvas-main になっているか確認

    mainCanvas.toBlob((blob) => {
        if (!blob) {
            alert('画像の生成に失敗しました');
            return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `kisekae-coordinate-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
    }, 'image/png');
});

// リセットボタンの処理
const resetBtn = document.getElementById('resetBtn');
resetBtn?.addEventListener('click', () => {
    // 状態を初期値に戻す
    selections = {
        background: 1,
        'body-momo': 1,
        'outfit-momo': 1,
        'body-cocoa': 1,
        'outfit-cocoa': 1
    };

    // UIの選択表示（枠線）をリセット
    document.querySelectorAll('.part-option').forEach(el => el.classList.remove('selected'));

    // 各カテゴリの最初の要素に selected を付け直す（簡易的な方法）
    Object.keys(PARTS_DATA).forEach(category => {
        const firstOption = document.querySelector(`#${category} .part-option`);
        if (firstOption) firstOption.classList.add('selected');
    });

    // プレビューを再描画
    updateFullPreview();

    // トースト通知（もし関数があるなら）
    if (typeof showToast === "function") {
        showToast('🔄 Reset complete!');
    } else {
        console.log('Reset complete!');
    }
});

// 8. 初期化
window.addEventListener('DOMContentLoaded', () => {
    initializeParts();
    updateFullPreview();
});