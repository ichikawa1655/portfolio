jQuery(document).ready(function($) {
    $('.slide_img').slick({
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 800,
        fade: true, //フェードアウトの効果を有効化
        cssEase: 'linear', //フェードアウトのイージングをlinearに設定
        pauseOnHover: false, //カーソルが上にあるときでも自動再生を続ける
        arrows: false,  //矢印ナビゲーションを非表示
        dots: true,  //ドットナビゲーションを表示
        // dotsClass: 'slick-dots', //ドットナビゲーションの位置を変更
        // appendDots: $('.slick-dots'), //ドットナビゲーションのスタイルを変更
    });
    $('.property-slider').slick({
        autoplay: false,    // 自動再生を無効
        speed: 600,         // スライド切替速度
        arrows: true,       // 左右の矢印ナビゲーションを表示
        dots: false,        // ドットナビゲーションを表示
        slidesToShow: 1,    // 1スライドずつ表示
    });
});