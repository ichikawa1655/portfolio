// ====================================================================
// ========================== jQuery ==================================
// ====================================================================
(function($) {
    $(function(){  
















        
    });
})(jQuery);

// ====================================================================
// ========================== プレーンJS ===============================
// ====================================================================






// ----------------------------------------
// 子ページFVに表示する本文が「、」または「。」で終わる場合、
// そのp要素にクラス「end-symbol」を付与し、横幅をCSSで調整
// ----------------------------------------
document.querySelectorAll('p').forEach(p => {
  const text = p.textContent.trim();

  // p要素の内容が「、」または「。」で終わる場合
  if (/[、。]$/.test(text)) {
    p.classList.add('end-symbol');
  }
});

// ----------------------------------------
// クリックでモーダル表示、内容はdata属性から取得して動的に挿入
// ----------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const modal      = document.getElementById('works-modal');
    if (!modal) return;
    const modalInner = modal.querySelector('.works_modal_inner');
    const overlay    = modal.querySelector('.works_modal_overlay');
    const closeBtn   = modal.querySelector('.works_modal_close');
    const modalCatch = modal.querySelector('.modal_content_catch img');
    const modalName  = modal.querySelector('.modal_project_name');
    const modalLink  = modal.querySelector('.modal_project_link');
    const scopeItems = modal.querySelectorAll('.modal_project_scope .scope_content');
    const modalScope = scopeItems[0] || null;
    const modalScale = scopeItems[1] || null;
    const modalTech  = scopeItems[2] || null;
    const modalImgs  = modal.querySelector('.modal_project_img_list');

    document.querySelectorAll('.works_item_list .item').forEach(item => {
        const btn = item.querySelector('.modal_open_button');
        if (!btn) return;
        btn.addEventListener('click', e => {
            e.preventDefault();
            const d = item.dataset;
            if (modalCatch) { modalCatch.src = d.modalCatch || ''; modalCatch.alt = d.modalName || ''; }
            if (modalName)  modalName.textContent = d.modalName || '';
            if (modalLink) { modalLink.href = d.modalUrl || '#'; modalLink.innerHTML = `${d.modalUrl || ''}<i class="icon-link-click"></i>`; }
            if (modalScope) modalScope.textContent = d.modalScope || '';
            if (modalScale) modalScale.textContent = d.modalScale || '';
            if (modalTech)  modalTech.innerHTML = d.modalTech
                ? d.modalTech.split(',').map(t => `<span>${t.trim()}</span>`).join('')
                : '';
            if (modalImgs)  modalImgs.innerHTML = d.modalImgs
                ? d.modalImgs.split(',').map(img =>
                    `<div class="modal_project_img"><img src="${themeData.imgUrl}${img.trim()}" alt=""></div>`
                ).join('')
                : '';
            modal.classList.add('is_open');
            if (modalInner) modalInner.scrollTop = 0;
        });
    });

    const closeModal = () => {
        modal.classList.remove('is_open');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay)  overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});