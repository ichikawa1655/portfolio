(function($) {
    $(function(){  

        // ----------------
        // デバイス別判定関数
        // ----------------
        function isMobile() { return window.innerWidth <= 600;} // スマホ
        function isTablet() { return window.innerWidth > 601 && window.innerWidth <= 1140; } // タブレット
        function isDesktop() { return window.innerWidth > 1140; } // 1140px〜：PC


        // ----------------------------------------
        //  上下左右スクロールでパララックス効果（.parallax_cover_* 内のみストップ可）
        //
        //  【基本】
        //  .parallax_item を付与するとパララックス対象になります。
        //  data-speed="" で速度指定（例：-0.05 〜 0.10 くらい）で動作。
        //  位置調整は原則自動。個別に微調整したい場合は
        //  data-offset-x="" または data-offset-y="" でpx指定（方向に応じて使用）。
        //
        //  【方向指定】
        //  data-direction="" で動く方向を設定できます。
        //    - "y"（初期値）       : 上下方向に動く（margin自動調整あり）
        //    - "x-left"           : 左方向に動く（margin自動調整なし）
        //    - "x-right"          : 右方向に動く（margin自動調整なし）
        //
        //  【カバー範囲ストップ】
        //  親要素に以下のクラスを付与することで、指定方向に出すぎたら停止します。
        //    - .parallax_cover_top       : 上方向に出ない
        //    - .parallax_cover_bottom    : 下方向に出ない
        //    - .parallax_cover_left      : 左方向に出ない
        //    - .parallax_cover_right     : 右方向に出ない
        //
        //  ※これらは併用可能です（例：.parallax_cover_top.parallax_cover_bottom）
        //  ※併用時は衝突しないようにHTML・CSS側で空間を調整してください。
        //
        //  【レスポンシブ制御】
        //  .parallax_pc を .parallax_item と併用すると、
        //  幅1000px以下では自動的にパララックスを無効化（静止）します。
        //
        //  【例】
        //  <div class="parallax_cover_top parallax_cover_bottom parallax_cover_left parallax_cover_right">
        //    <div class="parallax_item parallax_pc" data-speed="-0.05" data-direction="y" data-offset-y="50">
        //      <img src="..." alt="">
        //    </div>
        //  </div>
        //
        // ----------------------------------------

        const parallaxItems = document.querySelectorAll(".parallax_item");

        const enableParallax = {
          desktop: true,
          tablet: true,
          mobile: true
        };

        // 画面の上部何%を基準にするか
        const basePositionPC = 0.5;
        const basePositionTablet = 0.45;
        const basePositionSP = 0.35;

        // 1000px以下で .parallax_pc のパララックスを無効化
        const disableParallaxWidth = 1000;
        function isParallaxEnabledForItem(item) {
          if (item.classList.contains("parallax_pc") && window.innerWidth <= disableParallaxWidth) {
            return false;
          }
          return true;
        }

        function isParallaxEnabled() {
          if (isDesktop() && enableParallax.desktop) return true;
          if (isTablet() && enableParallax.tablet) return true;
          if (isMobile() && enableParallax.mobile) return true;
          return false;
        }

        function initParallaxPositions() {
          if (!isParallaxEnabled()) {
            parallaxItems.forEach((item) => {
              item.style.transform = "";
              item.style.marginTop = "";
              item.style.marginBottom = "";
            });
            return;
          }

          const viewportHeight = window.innerHeight;

          parallaxItems.forEach((item) => {
            if (!isParallaxEnabledForItem(item)) {
              item.style.transform = "";
              item.style.marginTop = "";
              item.style.marginBottom = "";
              return;
            }

            const speed = parseFloat(item.dataset.speed) || 0;
            const rect = item.getBoundingClientRect();
            const itemTop = rect.top + window.scrollY;

            let basePos = basePositionPC;
            if (isMobile()) basePos = basePositionSP;
            else if (isTablet()) basePos = basePositionTablet;

            const targetScroll = itemTop - viewportHeight * basePos;
            const offsetAtTarget = targetScroll * speed;
            const direction = item.dataset.direction || "y";

            // data-offset-x / data-offset-y 取得
            const customOffsetY = parseFloat(item.dataset.offsetY) || 0;
            const customOffsetX = parseFloat(item.dataset.offsetX) || 0;

            if (direction === "y") {
              item.style.marginTop = `${-offsetAtTarget + customOffsetY}px`;
              item.style.marginBottom = `${offsetAtTarget - customOffsetY}px`;
            }

            item.style.willChange = "transform";
          });
        }

        function handleParallaxScroll() {
          if (!isParallaxEnabled()) return;

          const scrollY = window.scrollY;

          parallaxItems.forEach((item) => {
            if (!isParallaxEnabledForItem(item)) return;

            const speed = parseFloat(item.dataset.speed);
            const direction = item.dataset.direction || "y";
            let offsetX = 0;
            let offsetY = 0;

            // data-offset-x / data-offset-y 取得
            const offsetXCustom = parseFloat(item.dataset.offsetX) || 0;
            const offsetYCustom = parseFloat(item.dataset.offsetY) || 0;

            // ---- 基本パララックス ----
            if (direction === "y") {
              offsetY = scrollY * speed + offsetYCustom;
            } else if (direction === "x-left") {
              offsetX = -scrollY * speed + offsetXCustom;
            } else if (direction === "x-right") {
              offsetX = scrollY * speed + offsetXCustom;
            }

            // ---- parallax_cover_* ストップ制御 ----
            const parent = item.closest(".parallax_cover_top, .parallax_cover_bottom, .parallax_cover_left, .parallax_cover_right");
            if (parent) {
              const parentRect = parent.getBoundingClientRect();
              const parentTop = parent.offsetTop;
              const parentBottom = parentTop + parent.offsetHeight;
              const parentLeft = parent.offsetLeft;
              const parentRight = parentLeft + parent.offsetWidth;
              const itemTop = item.offsetTop;
              const itemLeft = item.offsetLeft;

              // 上方向ストップ
              if (direction === "y" && parent.classList.contains("parallax_cover_top")) {
                const minY = parentTop - itemTop;
                if (offsetY < minY) offsetY = minY;
              }

              // 下方向ストップ
              if (direction === "y" && parent.classList.contains("parallax_cover_bottom")) {
                const maxY = parentBottom - (itemTop + item.offsetHeight);
                if (offsetY > maxY) offsetY = maxY;
              }

              // 左方向ストップ
              if ((direction === "x-left" || direction === "x-right") && parent.classList.contains("parallax_cover_left")) {
                const minX = parentLeft - itemLeft;
                if (offsetX < minX) offsetX = minX;
              }

              // 右方向ストップ
              if ((direction === "x-left" || direction === "x-right") && parent.classList.contains("parallax_cover_right")) {
                const maxX = parentRight - (itemLeft + item.offsetWidth);
                if (offsetX > maxX) offsetX = maxX;
              }
            }

            item.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
          });
        }

        window.addEventListener("load", initParallaxPositions);
        window.addEventListener("scroll", handleParallaxScroll);
        window.addEventListener("resize", initParallaxPositions);
        // ----------------------------------------
        // parallax end
        // ----------------------------------------




        // ----------------------------------------
        // シンプルなフェードアップアニメーション + 遅延対応
        //
        // 【下からフェードイン】
        //   基本トリガー : fadeUpTrigger
        //   トリガー位置 : fadeUp_trig_50   → 画面の50%位置で発火（デフォルト: 80）
        //   遅延         : fadeUp_late_200  → 200ms遅延（数値は任意）
        //   移動距離     : fadeUp_dist_400  → 400px下から（デフォルト: 200）
        //   アニメ時間   : fadeUp_dur_1500  → 1500msかけて（デフォルト: 2000）
        //
        // 【左からフェードイン】
        //   基本トリガー : fadeUpTrigger_left
        //   遅延         : fadeLeft_late_200 → 200ms遅延（数値は任意）
        //
        // 【右からフェードイン】
        //   基本トリガー : fadeUpTrigger_right
        //   遅延         : fadeRight_late_200 → 200ms遅延（数値は任意）
        //
        // 例）<div class="fadeUpTrigger fadeUp_trig_60 fadeUp_late_300 fadeUp_dist_300 fadeUp_dur_1200">
        // ----------------------------------------
        function fadeAnime() {
          // 下から
        $('.fadeUpTrigger, [class*="fadeUp_trig_"]').each(function () {
          var $this = $(this);
          var elemPos = $this.offset().top;
          var scroll = $(window).scrollTop();
          var windowHeight = $(window).height();

          // トリガー位置（%） fadeUp_trig_50 → 0.5
          var trigClass = $this.attr('class').match(/fadeUp_trig_(\d+)/);
          var triggerPercent = trigClass ? parseInt(trigClass[1]) / 100 : 0.8; // デフォ80%
          var triggerPosition = scroll + windowHeight * triggerPercent;

          if (triggerPosition >= elemPos) {
            // 遅延クラス fadeUp_late_200
            var delayClass = $this.attr('class').match(/fadeUp_late_(\d+)/);
            if (delayClass) {
              $this.css('animation-delay', Number(delayClass[1]) + 'ms');
            }

            // 距離クラス fadeUp_dist_400
            var distClass = $this.attr('class').match(/fadeUp_dist_(\d+)/);
            if (distClass) {
              $this.css('--fadeUp-dist', Number(distClass[1]) + 'px');
            } else {
              $this.css('--fadeUp-dist', '200px'); // デフォ200px
            }

            // 時間クラス fadeUp_dur_1500
            var durClass = $this.attr('class').match(/fadeUp_dur_(\d+)/);
            if (durClass) {
              $this.css('--fadeUp-dur', Number(durClass[1]) + 'ms');
            } else {
              $this.css('--fadeUp-dur', '2000ms'); // デフォ2秒
            }

            // アニメーション発火
            $this.addClass('fadeUp');
          }
        });

          // 左から
          $('.fadeUpTrigger_left').each(function () {
            var elemPos = $(this).offset().top - 50;
            var scroll = $(window).scrollTop();
            var windowHeight = $(window).height();
            if (scroll >= elemPos - windowHeight) {
              $(this).addClass('fadeLeft');
              var delayClass = $(this).attr('class').match(/fadeLeft_late_(\d+)/);
              if (delayClass) {
                $(this).css('animation-delay', Number(delayClass[1]) + 'ms');
              }
            }
          });

          // 右から
          $('.fadeUpTrigger_right').each(function () {
            var elemPos = $(this).offset().top - 50;
            var scroll = $(window).scrollTop();
            var windowHeight = $(window).height();
            if (scroll >= elemPos - windowHeight) {
              $(this).addClass('fadeRight');
              var delayClass = $(this).attr('class').match(/fadeRight_late_(\d+)/);
              if (delayClass) {
                $(this).css('animation-delay', Number(delayClass[1]) + 'ms');
              }
            }
          });
        }

        // スクロール時に実行
        $(window).scroll(function () {
          fadeAnime();
        });





        
        // ----------------------------------------
        //  じわっと表示アニメーション + カスタマイズ対応
        //
        //  基本トリガー : animate_subtly
        //  移動距離     : subtly_fadeup_50  → 下から50px分フェードアップ（数値は任意）
        //  遅延         : subtly_late_500   → 500ms遅延（数値は任意）
        //  所要時間     : subtly_dur_1500   → 1500msかけて（デフォルト: 2300）
        //
        //  例）<div class="animate_subtly subtly_fadeup_50 subtly_late_500 subtly_dur_1500">
        // ----------------------------------------
        $('.animate_subtly').each(function() {
            var $el = $(this);

            // クラス名からオプションを抽出
            var fadeupMatch = $el.attr('class').match(/subtly_fadeup_(\d+)/);
            var fadeupY = fadeupMatch ? Number(fadeupMatch[1]) : 0;

            var delayMatch = $el.attr('class').match(/subtly_late_(\d+)/);
            var delayTime = delayMatch ? Number(delayMatch[1]) : 0;

            var durMatch = $el.attr('class').match(/subtly_dur_(\d+)/);
            var duration = durMatch ? Number(durMatch[1]) : 2300; // デフォルト2.3秒

            // 初期状態
            $el.css({
                filter: 'blur(10px)',
                opacity: 0,
                transform: 'translateY(' + fadeupY + 'px)',
                transition:
                    'filter ' + duration + 'ms ease ' + delayTime + 'ms, ' +
                    'opacity ' + duration + 'ms ease ' + delayTime + 'ms, ' +
                    'transform ' + duration + 'ms ease ' + delayTime + 'ms'
            });

            function checkInView() {
                if ($el.data('animated')) return;

                var elTop = $el.offset().top;
                var elBottom = elTop + $el.outerHeight();
                var viewTop = $(window).scrollTop();
                var viewTrigger = viewTop + $(window).height() * 0.7;

                if (elBottom > viewTop && elTop < viewTrigger) {
                    $el.data('animated', true);
                    $el.css({
                        filter: 'blur(0)',
                        opacity: 1,
                        transform: 'translateY(0)'
                    });
                }
            }

            $(window).on('scroll load resize', checkInView);
            checkInView();
        });


        // ----------------------------------------
        // ハンバーガーメニュー内専用のフェードアップ
        // ・menu_fade_upの付与
        // ・data-delay="300"（任意、遅延時間ms指定）
        // で発動、display:block;をつけないと縦移動が反映されない
        // ----------------------------------------
        const $menuBtn = $('.menu_btn'); // チェックボックス
        const $targets = $('.menu_fade_up');

        let closeTimer = null; // 閉じる時の遅延タイマー

        // 初期化
        function resetMenuAnimations() {
          $targets.each(function () {
            $(this).removeClass('is-active');
            $(this).css('transition-delay', '0ms');
          });
        }

        // 開くときのアニメ
        function playMenuAnimations() {
          $targets.each(function () {
            const delay = $(this).data('delay') ?? 200;
            $(this).css('transition-delay', delay + 'ms');

            void this.offsetWidth; // 再描画で transition 発動

            $(this).addClass('is-active');
          });
        }

        // 閉じるときの処理（1秒遅れて実行）
        function delayedClose() {
          // 既存の遅延タイマーがあればキャンセル（連打対策）
          if (closeTimer) clearTimeout(closeTimer);

          closeTimer = setTimeout(() => {
            resetMenuAnimations();
            closeTimer = null;
          }, 500); // ← ここが1秒遅延
        }

        // メニューボタン監視
        $menuBtn.on('change', function () {

          // 連打時に前の閉じ待機をキャンセル
          if (closeTimer) {
            clearTimeout(closeTimer);
            closeTimer = null;
          }

          if ($(this).is(':checked')) {
            // 開く → すぐにアニメ開始
            resetMenuAnimations();
            playMenuAnimations();
          } else {
            // 閉じる → 1秒遅らせて逆アニメ
            delayedClose();
          }
        });



    });
})(jQuery);