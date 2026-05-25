// ====================================================================
// ========================== jQuery ==================================
// ====================================================================

(function($) {
    $(function(){  

        // ----------------------------------------
        // デバイス別判定関数
        // ----------------------------------------
        function isMobile() { return window.innerWidth <= 600;} // スマホ
        function isTablet() { return window.innerWidth > 601 && window.innerWidth <= 1140; } // タブレット
        function isDesktop() { return window.innerWidth > 1140; } // 1140px〜：PC


        // ----------------------------------------
        // URLのスラッグを取得してhtmlにクラス付与（サブディレクトリ対応）
        // ----------------------------------------
        $(function() {
          var path = window.location.pathname;

          // 末尾のスラッシュを削除（例: /company/ → /company）
          path = path.replace(/\/$/, '');

          // スラッグ配列を取得（例: /subdir/company → ["subdir", "company"]）
          var segments = path.split('/').filter(Boolean); // 空文字を除去

          // 除外したいディレクトリを指定（例: サブディレクトリ名）
          var excludeDirs = ['subdir', 'dev', 'stg', 'grandir-demo']; // ← 必要に応じて追加

          // 除外ディレクトリをスキップして、最初に残ったものをスラッグとする
          var slug = 'home';
          for (var i = 0; i < segments.length; i++) {
            if (!excludeDirs.includes(segments[i])) {
              slug = segments[i];
              break;
            }
          }

          // クラス名を作成
          var className = 'page_' + slug;

          // htmlタグに付与
          $('html').addClass(className);
        });

        // ----------------------------------------
        // サファリの時だけ .is-safari をhtmlに付与
        // ----------------------------------------
        var ua = navigator.userAgent.toLowerCase();
        var isSafari = ua.indexOf('safari') > -1 && ua.indexOf('chrome') === -1;
        if (isSafari) {
          $('html').addClass('is-safari');
        }

        // ----------------------------------------
        // ページロード時にフェードイン
        // ----------------------------------------
        $(function(){
          $('body').fadeIn(400);
        });

        // 内部リンクの場合、フェードアウトしてから遷移
        $('a').on('click', function(e) {
          var link = $(this).attr('href');
          if (link && link !== '#' && link.indexOf(window.location.host) !== -1) {
            e.preventDefault();
            $('body').fadeOut(400, function(){
              window.location.href = link;
            });
          }
        });
        // 戻る・進む時の bfcache 対策
        $(window).on('pageshow', function(event) {
          if (event.originalEvent.persisted) {
            $('body').hide().fadeIn(400); 
            // ← hide() で一旦消してから fadeIn
          }
        });

        // ----------------------------------------
        //  QAのトグル表示
        // ----------------------------------------
        $('.qa_item').on('click', function(){
            const q = $(this).find('.q');   // このアイテム内の .q
            const a = $(this).find('.a');   // このアイテム内の .a

            // 自分の a を開閉
            a.stop().slideToggle().toggleClass('open');

            // 他の a は閉じる
            $('.qa_item').not($(this)).find('.a').slideUp().removeClass('open');

            // q の active 制御
            q.toggleClass('active');
            $('.qa_item').not($(this)).find('.q').removeClass('active');
        });

        $(document).ready(function(){
            // すべて閉じる
            $('.a').hide();

            // 1番上の qa_item を初期から開く
            const firstItem = $('.qa_item').first();
            firstItem.find('.a').show().addClass('open');
            firstItem.find('.q').addClass('active');
        });

        // ----------------------------------------
        //  リンクコピーボタン
        // ----------------------------------------
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);

        // Facebook
        const fb = document.getElementById("share-facebook");
        if (fb) {
          fb.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        }

        // X (Twitter)
        const tw = document.getElementById("share-x");
        if (tw) {
          tw.href = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        }

        // LINE
        const line = document.getElementById("share-line");
        if (line) {
          line.href = `https://social-plugins.line.me/lineit/share?url=${url}`;
        }

        // コピーリンク
        const copyBtn = document.getElementById("copy-link");
        if (copyBtn) {
          copyBtn.addEventListener("click", function (event) {
            event.preventDefault(); 
            navigator.clipboard.writeText(window.location.href).then(function () {
              alert("リンクをコピーしました！");
            }, function () {
              alert("コピーに失敗しました。");
            });
          });
        }

        // ----------------------------------------
        //  スクロールに応じてボタンに .section_active を1つだけ付与
        // ----------------------------------------

        // セクションとボタンのペアを定義
        var pairs = [
            { section: "#corporate-site", button: "#corporate-site-catch" },
            { section: "#ec-site", button: "#ec-site-catch" },
            { section: "#landing-page", button: "#landing-page-catch" },
            { section: "#promotion-movie", button: "#promotion-movie-catch" },
            { section: "#digital-marketing", button: "#digital-marketing-catch" },
            { section: "#qa-web", button: "#qa-web-catch" },
            { section: "#qa-dtp", button: "#qa-dtp-catch" },
            { section: "#qa-movie", button: "#qa-movie-catch" },
          ];

          function updateActive() {
            var winTop = $(window).scrollTop();
            var winBottom = winTop + $(window).height();
            var activePair = null;

            $.each(pairs, function (i, pair) {
              var $sec = $(pair.section);
              if ($sec.length === 0) return;

              var secTop = $sec.offset().top;
              var secBottom = secTop + $sec.outerHeight();

              // 画面中央に最も近いセクションをアクティブにする
              if (winBottom > secTop && winTop < secBottom) {
                activePair = pair;
                return false; // 最初にヒットしたものを採用
              }
            });

            // すべてのボタンからクラスを外す
            $.each(pairs, function (i, pair) {
              $(pair.button).removeClass("section_active");
            });

            // アクティブ対象があれば付与
            if (activePair) {
              $(activePair.button).addClass("section_active");
            }
          }

          $(window).on("scroll resize", updateActive);
          updateActive(); // 初回実行
          
          // ----------------------------------------
          //  .movie_wrap内の動画の自動再生・音声なし（iOS対策）
          // ----------------------------------------

          var $video = $('.bg-movie video');
          if ($video.length) {
            var video = $video.get(0);

            // 安定動作用に属性を再指定
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.autoplay = true;

            // 自動再生試行
            var playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(function() {
                // ブラウザがブロックした場合も再試行
                video.muted = true;
                video.play();
              });
            }
          }










          




    });
})(jQuery);






// ====================================================================
// ========================== プレーンJS ===============================
// ====================================================================

// ----------------------------------------
//  ページ内リンクのスムーズスクロール
// ----------------------------------------
document.querySelectorAll('.scroll-link').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');

    // #（ハッシュ）が含まれない or target="_blank" の場合は無視
    if (!href.includes('#') || this.target === '_blank') return;

    const targetId = href.split('#')[1];
    const targetElem = document.getElementById(targetId);

    if (targetElem) {
      e.preventDefault(); // ページ遷移を止める
      window.scrollTo({
        top: targetElem.offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

// ----------------------------------------
//  ハンバーガーメニューのリンクをクリックしたらメニューを閉じる
// ----------------------------------------
document.querySelectorAll('.menu a').forEach(function(link) {
    link.addEventListener('click', function() {
        document.getElementById('menu_btn').checked = false;
    });
});

// ----------------------------------------
//  スムーズスクロールでセクションジャンプ
// ----------------------------------------

document.addEventListener("DOMContentLoaded", () => {

  // href が # で始まる a を全部拾う
  const anchors = document.querySelectorAll('a[href^="#"]');

  anchors.forEach(anchor => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");

      // # だけの場合 → ページトップへ
      if (href === "#") {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        return;
      }

      // #○○ の場合 → 対象セクションへ
      const target = document.querySelector(href);
      if (!target) return; // 存在しないときは通常動作

      e.preventDefault();

      const position = target.getBoundingClientRect().top + window.pageYOffset;

      window.scrollTo({
        top: position,
        behavior: "smooth",
      });
    });
  });

});


// ----------------------------------------
//  自動スライダー
// ----------------------------------------
(() => {
  const init_auto_slider = () => {
    const containers = document.querySelectorAll('.auto_slider');
    if (!containers.length) return;

    containers.forEach(container => {
      const slides = container.querySelectorAll('.slide');
      if (!slides.length) return;

      let current = 0;
      let timer = null;
      const delay = 3500;

      const show_slide = index => {
        slides.forEach((slide, i) => {
          slide.classList.toggle('active', i === index);
        });
      };

      const start = () => {
        stop();
        timer = setInterval(() => {
          current = (current + 1) % slides.length;
          show_slide(current);
        }, delay);
      };

      const stop = () => {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      };

      show_slide(current);
      start();

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else start();
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init_auto_slider);
  } else {
    init_auto_slider();
  }
})();




// ----------------------------------------
//  ローディング画面アニメーション（2秒固定 → 段階演出・URL単位で初回のみ）
// ----------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const loading = document.querySelector('.loading');
  if (!loading) return;

  const meter = loading.querySelector('.load_meter');
  const logo = loading.querySelector('.logo_box');
  const gauge = loading.querySelector('.load_gauge');

  // ========================================
  //  ページごとに一意のキーを設定
  //  例）/about → loaded_/about
  // ========================================
  const pageKey = `loaded_${location.pathname}`;

  // ✅ ページ単位で初回のみ表示
  if (!sessionStorage.getItem(pageKey)) {

    // body にクラス付与して表示
    document.body.classList.add('loading-active');

    // ----------------------------------------
    // ① ロゴふわっと出現（1.0秒）
    // ----------------------------------------
    logo.style.opacity = '0';
    logo.style.filter = 'blur(10px)';
    logo.style.transform = 'scale(0.95)';

    setTimeout(() => {
      logo.style.transition = 'opacity 1.0s ease, filter 1.0s ease, transform 1.0s ease';
      logo.style.opacity = '1';
      logo.style.filter = 'blur(0)';
      logo.style.transform = 'scale(1)';
    }, 100);

    // ----------------------------------------
    // ② 0.3秒後 → ゲージふわっと出現（0.4秒）
    // ----------------------------------------
    setTimeout(() => {
      gauge.style.opacity = '0';
      gauge.style.filter = 'blur(10px)';
      gauge.style.transition = 'opacity 0.4s ease, filter 0.4s ease';
      gauge.style.opacity = '1';
      gauge.style.filter = 'blur(0)';
    }, 100 + 1000 + 300); // 1.0s + 0.3s 後

    // ----------------------------------------
    // ③ さらに0.3秒後 → メーター進行開始（2.0秒）
    // ----------------------------------------
    setTimeout(() => {
      meter.style.width = '100%'; // CSS側で transition: width 2s ease;
    }, 100 + 1000 + 300 + 400 + 300); // (1.0+0.3+0.4+0.3)

    // ----------------------------------------
    // ④ メーター完了後 +0.5秒 → ゲージふわっと消える（0.3秒）
    // ----------------------------------------
    setTimeout(() => {
      gauge.style.transition = 'opacity 0.3s ease, filter 0.3s ease';
      gauge.style.opacity = '0';
      gauge.style.filter = 'blur(10px)';
    }, 100 + 1000 + 300 + 400 + 300 + 2000 + 500);

    // ----------------------------------------
    // ⑤ さらに0.3秒後 → ロゴふわっと拡大しながら消える（1.0秒）
    // ----------------------------------------
    setTimeout(() => {
      logo.style.transition = 'opacity 1.0s ease, filter 1.0s ease, transform 1.0s ease';
      logo.style.opacity = '0';
      logo.style.filter = 'blur(10px)';
      logo.style.transform = 'scale(1.1)';
    }, 100 + 1000 + 300 + 400 + 300 + 2000 + 500 + 300);

    // ----------------------------------------
    // ⑥ さらに0.5秒後 → 背景フェードアウト（従来通り）
    // ----------------------------------------
    setTimeout(() => {
      loading.style.opacity = '0';
      setTimeout(() => {
        loading.style.display = 'none';
        document.body.classList.remove('loading-active');
      }, 500); // 背景フェード時間
    }, 100 + 1000 + 300 + 400 + 300 + 2000 + 500 + 300 + 1000 + 300);

    // ✅ このページでは次回以降非表示にする
    sessionStorage.setItem(pageKey, 'true');

  } else {
    // 2回目以降（このページでは非表示）
    loading.style.display = 'none';
  }
});










//
//
//
//
//
//
//
//
//
//
//
//
//
// ----------------------------------------
//  Lenis 慣性スクロールの初期化（スマホではオフ）
// ----------------------------------------
let lenis = null; // スコープを外に出す

document.addEventListener('DOMContentLoaded', function () {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (typeof Lenis !== 'undefined' && !isMobile) {
        lenis = new Lenis({
            smooth: true,
            lerp: 0.1,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
    }
});