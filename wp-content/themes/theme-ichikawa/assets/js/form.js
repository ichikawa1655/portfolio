document.addEventListener('DOMContentLoaded', function () {
  const fakeCheckbox = document.querySelector('.js-fake-checkbox');
  const realCheckbox = document.querySelector('input[name="agree_check[]"]');
  const formSubmitWrapper = document.querySelector('.form_submit');
  const submitButton = document.querySelector('.wpcf7-submit');

  // 初期化：未チェックにする（履歴対策）
  if (fakeCheckbox && realCheckbox) {
    fakeCheckbox.checked = false;
    realCheckbox.checked = false;

    // 同期
    fakeCheckbox.addEventListener('change', function () {
      realCheckbox.checked = fakeCheckbox.checked;
      toggleSubmitButton();
    });
  }

  // submitの有効・無効を制御
  const toggleSubmitButton = () => {
    if (submitButton && formSubmitWrapper && realCheckbox) {
      const isChecked = realCheckbox.checked;
      submitButton.disabled = !isChecked;
      formSubmitWrapper.classList.toggle('is-disabled', !isChecked);
    }
  };

  // 初期状態でも反映
  toggleSubmitButton();

  // エラーメッセージをカスタム位置へ移動
  document.addEventListener('wpcf7invalid', function () {
    const form = document.querySelector('.wpcf7-form');
    const realWrapper = form?.querySelector('.wpcf7-form-control-wrap.agree_check');
    const errorTip = realWrapper?.querySelector('.wpcf7-not-valid-tip');
    const fakeWrapper = document.querySelector('.custom-checkbox-wrapper');

    // 重複防止
    if (errorTip && fakeWrapper && !fakeWrapper.contains(errorTip)) {
      fakeWrapper.appendChild(errorTip);
    }
  });
});


// ----------------------------------------
// 不要な<p>を非表示にする
// ----------------------------------------
document.querySelectorAll('.form_wrap p').forEach(p => {
  if (
    p.closest('.p_none_skip') || // ← 祖先または自分自身にこのクラスがある場合スキップ
    p.querySelector('span') ||
    p.querySelector('.custom-checkbox-label') ||
    p.querySelector('.wpcf7-form-control')
  ) {
    return; // スキップ
  }

  if (p.textContent.trim() === '') {
    p.style.display = 'none';
  }
});

// CF7 のイベントは form 要素で発火するので、documentで受けると
// 後から追加されたフォーム（マルチステップ等）にも対応できます。
(function () {
  // 送信開始（スピナーON）で呼ばれる
  document.addEventListener('wpcf7beforesubmit', function (event) {
    const form = event.target; // 発火元の form
    if (!(form && form.nodeName === 'FORM')) return;

    // form の内側にある container を優先して取得
    const container = form.querySelector('.form_submit_container') || form.closest('.form_submit_container');

    if (container) {
      container.classList.add('submit_loading');
    }
  }, false);

  // 送信完了（スピナーOFF）で呼ばれる
  document.addEventListener('wpcf7submit', function (event) {
    const form = event.target;
    if (!(form && form.nodeName === 'FORM')) return;

    const container = form.querySelector('.form_submit_container') || form.closest('.form_submit_container');

    if (container) {
      // 即時解除。フェード感が欲しければ下のコメントを参照
      container.classList.remove('submit_loading');
      // もしフェードアウト的な余韻を残したいなら:
      // setTimeout(() => container.classList.remove('submit_loading'), 300);
    }
  }, false);
})();

document.addEventListener('wpcf7beforesubmit', function(event) {
  const form = event.target;
  const btn = form.querySelector('button[type="submit"], input[type="submit"]');
  if (btn) btn.disabled = true;
});

document.addEventListener('wpcf7submit', function(event) {
  const form = event.target;
  const btn = form.querySelector('button[type="submit"], input[type="submit"]');
  if (btn) btn.disabled = false;
});


// ----------------------------------------
//  フォーム内の郵便番号から住所を自動入力
// ----------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    const button = document.querySelector('.address-search-button');
  
    if (!button) return;
  
    button.addEventListener('click', function () {
      const zip1 = document.querySelector('input[name="zip1"]')?.value || '';
      const zip2 = document.querySelector('input[name="zip2"]')?.value || '';
      const zip = zip1 + zip2;
  
      if (zip.length !== 7 || isNaN(zip)) {
        alert('正しい郵便番号（7桁）を入力してください。');
        return;
      }
  
      fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`)
        .then(response => response.json())
        .then(data => {
          if (data.results) {
            const result = data.results[0];
            document.querySelector('input[name="prefecture"]').value = result.address1;
            document.querySelector('input[name="city"]').value = result.address2 + result.address3;
          } else {
            alert('住所が見つかりませんでした。');
          }
        })
        .catch(error => {
          console.error('住所検索エラー:', error);
          alert('住所検索に失敗しました。');
        });
    });
});



// お問い合わせに文字数制限をかける
document.addEventListener('DOMContentLoaded', () => {
  const maxLen = 300;

  document.querySelectorAll('.js-limit-textarea').forEach(textarea => {
    textarea.addEventListener('input', () => {
      if (textarea.value.length > maxLen) {
        textarea.value = textarea.value.substring(0, maxLen);
      }
    });
  });
});
