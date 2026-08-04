/*
    mod_qna.js — QnA 게시판 모듈 (EasyAdmin FAQ 스타일)
*/

var QNA = (function() {

    var API_URL = '';
    var mountId = '';
    var currentPage = 1;
    var currentSearch = '';

    function init(mountElId) {
        mountId = mountElId;
        var loc = window.location;
        var base = loc.protocol + '//' + loc.host + loc.pathname.replace(/[^\/]*$/, '');
        API_URL = base + 'qna_api.php';
        renderList();
    }

    // ── 목록 ──
    function renderList(page, search) {
        currentPage = page || 1;
        currentSearch = (search !== undefined) ? search : currentSearch;
        var mount = document.getElementById(mountId);
        if (!mount) return;

        mount.innerHTML =
            '<div class="qna-wrap">'
          + '  <div class="qna-toolbar">'
          + '    <div class="qna-search-box">'
          + '      <i class="bi bi-search"></i>'
          + '      <input type="text" id="qna-search-input" placeholder="Search posts..." value="' + _esc(currentSearch) + '">'
          + '    </div>'
          + '    <button class="qna-btn qna-btn-primary" id="qna-btn-write"><i class="bi bi-pencil-square"></i> New Post</button>'
          + '  </div>'
          + '  <div id="qna-list-body"><div class="qna-loading">Loading...</div></div>'
          + '  <div id="qna-pagination"></div>'
          + '</div>';

        document.getElementById('qna-btn-write').addEventListener('click', function() { renderWriteForm(0); });
        document.getElementById('qna-search-input').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { renderList(1, this.value.trim()); }
        });

        _fetchList();
    }

    function _fetchList() {
        var url = API_URL + '?action=list&page=' + currentPage;
        if (currentSearch) url += '&search=' + encodeURIComponent(currentSearch);

        fetch(url).then(function(r) { return r.json(); }).then(function(data) {
            var body = document.getElementById('qna-list-body');
            if (!body) return;

            if (!data.rows || data.rows.length === 0) {
                body.innerHTML = _emptyTable();
                return;
            }

            var html = '<div class="qna-accordion">';
            data.rows.forEach(function(row) {
                var isReply = row.parent_no > 0;
                var depthPad = isReply ? ' style="margin-left:' + (row.depth * 24) + 'px"' : '';
                var secretBadge = row.is_secret == 1 ? '<span class="qna-badge qna-badge-secret"><i class="bi bi-lock-fill"></i> Secret</span>' : '';
                var answeredBadge = row.is_answered == 1 ? '<span class="qna-badge qna-badge-answered"><i class="bi bi-check-circle-fill"></i> Answered</span>' : '';
                var replyBadge = isReply ? '<span class="qna-badge qna-badge-reply"><i class="bi bi-reply-fill"></i> Reply</span>' : '';
                var date = _formatDate(row.created_at);

                html += '<div class="qna-item"' + depthPad + '>'
                     +  '  <div class="qna-item-header" data-no="' + row.no + '">'
                     +  '    <div class="qna-item-left">'
                     +  '      <span class="qna-item-no">#' + row.no + '</span>'
                     +  '      ' + replyBadge + secretBadge + answeredBadge
                     +  '      <span class="qna-item-title">' + _esc(row.title) + '</span>'
                     +  '    </div>'
                     +  '    <div class="qna-item-right">'
                     +  '      <span class="qna-item-author"><i class="bi bi-person"></i> ' + _esc(row.id) + '</span>'
                     +  '      <span class="qna-item-date"><i class="bi bi-clock"></i> ' + date + '</span>'
                     +  '      <i class="bi bi-chevron-right qna-chevron"></i>'
                     +  '    </div>'
                     +  '  </div>'
                     +  '</div>';
            });
            html += '</div>';
            body.innerHTML = html;

            // 클릭 이벤트
            body.querySelectorAll('.qna-item-header').forEach(function(el) {
                el.addEventListener('click', function() {
                    var no = parseInt(this.getAttribute('data-no'));
                    var item = data.rows.find(function(r) { return r.no == no; });
                    if (item && item.is_secret == 1 && !item.content) {
                        renderUnlockForm(no);
                    } else {
                        renderView(no);
                    }
                });
            });

            // 페이지네이션
            _renderPagination(data.total, data.page, data.perPage);
        }).catch(function() {
            var body = document.getElementById('qna-list-body');
            if (body) body.innerHTML = _emptyTable();
        });
    }

    function _renderPagination(total, page, perPage) {
        var pag = document.getElementById('qna-pagination');
        if (!pag) return;
        var totalPages = Math.ceil(total / perPage);
        if (totalPages <= 1) { pag.innerHTML = ''; return; }

        var html = '<div class="qna-pag">';
        if (page > 1) html += '<button class="qna-pag-btn" data-p="' + (page-1) + '">&laquo;</button>';
        for (var i = 1; i <= totalPages; i++) {
            html += '<button class="qna-pag-btn' + (i === page ? ' active' : '') + '" data-p="' + i + '">' + i + '</button>';
        }
        if (page < totalPages) html += '<button class="qna-pag-btn" data-p="' + (page+1) + '">&raquo;</button>';
        html += '</div>';
        pag.innerHTML = html;

        pag.querySelectorAll('.qna-pag-btn').forEach(function(btn) {
            btn.addEventListener('click', function() { renderList(parseInt(this.getAttribute('data-p'))); });
        });
    }

    // ── 글 상세 ──
    function renderView(no) {
        var mount = document.getElementById(mountId);
        if (!mount) return;
        mount.innerHTML = '<div class="qna-wrap"><div class="qna-loading">Loading...</div></div>';

        fetch(API_URL + '?action=view&no=' + no).then(function(r) { return r.json(); }).then(function(data) {
            if (data.error === 'secret') { renderUnlockForm(no); return; }
            if (data.error) { mount.innerHTML = '<div class="qna-wrap"><p>' + data.error + '</p></div>'; return; }

            var post = data.post;
            var replies = data.replies || [];
            var date = _formatDate(post.created_at);
            var secretBadge = post.is_secret == 1 ? '<span class="qna-badge qna-badge-secret"><i class="bi bi-lock-fill"></i> Secret</span>' : '';
            var answeredBadge = post.is_answered == 1 ? '<span class="qna-badge qna-badge-answered"><i class="bi bi-check-circle-fill"></i> Answered</span>' : '';

            var html = '<div class="qna-wrap">'
                + '<button class="qna-btn qna-btn-back" id="qna-back"><i class="bi bi-arrow-left"></i> Back to list</button>'
                + '<div class="qna-view-card">'
                + '  <div class="qna-view-header">'
                + '    <h2 class="qna-view-title">' + _esc(post.title) + '</h2>'
                + '    <div class="qna-view-meta">'
                + '      ' + secretBadge + answeredBadge
                + '      <span><i class="bi bi-person"></i> ' + _esc(post.id) + '</span>'
                + '      <span><i class="bi bi-clock"></i> ' + date + '</span>'
                + '    </div>'
                + '  </div>'
                + '  <div class="qna-view-body">'
                + '    <div class="qna-view-content">' + _nl2br(_esc(post.content)) + '</div>';

            if (post.image_path) {
                var imgUrl = window.location.protocol + '//' + window.location.host + window.location.pathname.replace(/[^\/]*$/, '') + post.image_path;
                html += '<div class="qna-view-image"><img src="' + imgUrl + '" alt="attached"></div>';
            }

            html += '  </div>'
                + '  <div class="qna-view-actions">'
                + '    <button class="qna-btn qna-btn-primary" id="qna-reply-btn"><i class="bi bi-reply"></i> Reply</button>'
                + '    <button class="qna-btn qna-btn-danger" id="qna-delete-btn"><i class="bi bi-trash"></i> Delete</button>'
                + '  </div>'
                + '</div>';

            // 답글
            if (replies.length > 0) {
                html += '<div class="qna-replies-section"><h3 class="qna-replies-title"><i class="bi bi-chat-dots"></i> Replies (' + replies.length + ')</h3>';
                replies.forEach(function(r) {
                    var rDate = _formatDate(r.created_at);
                    html += '<div class="qna-reply-card" style="margin-left:' + (r.depth * 20) + 'px">'
                        + '  <div class="qna-reply-header">'
                        + '    <span><i class="bi bi-person"></i> ' + _esc(r.id) + '</span>'
                        + '    <span><i class="bi bi-clock"></i> ' + rDate + '</span>'
                        + '  </div>'
                        + '  <div class="qna-reply-body">' + _nl2br(_esc(r.content)) + '</div>';
                    if (r.image_path) {
                        var rImgUrl = window.location.protocol + '//' + window.location.host + window.location.pathname.replace(/[^\/]*$/, '') + r.image_path;
                        html += '<div class="qna-view-image"><img src="' + rImgUrl + '" alt="attached"></div>';
                    }
                    html += '</div>';
                });
                html += '</div>';
            }

            html += '</div>';
            mount.innerHTML = html;

            document.getElementById('qna-back').addEventListener('click', function() { renderList(); });
            document.getElementById('qna-reply-btn').addEventListener('click', function() { renderWriteForm(no); });
            document.getElementById('qna-delete-btn').addEventListener('click', function() { renderDeleteConfirm(no); });
        });
    }

    // ── 비밀글 잠금해제 ──
    function renderUnlockForm(no) {
        var mount = document.getElementById(mountId);
        mount.innerHTML =
            '<div class="qna-wrap">'
          + '<button class="qna-btn qna-btn-back" id="qna-back"><i class="bi bi-arrow-left"></i> Back to list</button>'
          + '<div class="qna-form-card">'
          + '  <h2 class="qna-form-title"><i class="bi bi-lock-fill"></i> This post is private</h2>'
          + '  <p style="color:#64748b;margin-bottom:20px;">Enter the password to view this post.</p>'
          + '  <div class="qna-form-group">'
          + '    <label>Password</label>'
          + '    <input type="password" id="qna-unlock-pw" class="qna-input">'
          + '  </div>'
          + '  <div class="qna-form-actions">'
          + '    <button class="qna-btn qna-btn-primary" id="qna-unlock-submit">Unlock</button>'
          + '  </div>'
          + '  <div id="qna-unlock-error" class="qna-error"></div>'
          + '</div></div>';

        document.getElementById('qna-back').addEventListener('click', function() { renderList(); });
        document.getElementById('qna-unlock-submit').addEventListener('click', function() {
            var pw = document.getElementById('qna-unlock-pw').value;
            var fd = new FormData();
            fd.append('action', 'unlock');
            fd.append('no', no);
            fd.append('password', pw);
            fetch(API_URL, { method: 'POST', body: fd }).then(function(r) { return r.json(); }).then(function(data) {
                if (data.ok) { renderView(no); }
                else { document.getElementById('qna-unlock-error').textContent = 'Wrong password'; }
            });
        });
    }

    // ── 글쓰기 / 답글 ──
    function renderWriteForm(parentNo) {
        var mount = document.getElementById(mountId);
        var isReply = parentNo > 0;
        var formTitle = isReply ? 'Write a Reply' : 'New Post';

        mount.innerHTML =
            '<div class="qna-wrap">'
          + '<button class="qna-btn qna-btn-back" id="qna-back"><i class="bi bi-arrow-left"></i> Back</button>'
          + '<div class="qna-form-card">'
          + '  <h2 class="qna-form-title"><i class="bi bi-pencil-square"></i> ' + formTitle + '</h2>'
          + '  <div class="qna-form-row">'
          + '    <div class="qna-form-group qna-half">'
          + '      <label>ID <span class="qna-required">*</span></label>'
          + '      <input type="text" id="qna-w-id" class="qna-input" placeholder="Your ID">'
          + '    </div>'
          + '    <div class="qna-form-group qna-half">'
          + '      <label>Password <span class="qna-required">*</span></label>'
          + '      <input type="password" id="qna-w-pw" class="qna-input" placeholder="Password">'
          + '    </div>'
          + '  </div>'
          + '  <div class="qna-form-group">'
          + '    <label>Title <span class="qna-required">*</span></label>'
          + '    <input type="text" id="qna-w-title" class="qna-input" placeholder="Post title">'
          + '  </div>'
          + '  <div class="qna-form-group">'
          + '    <label>Content</label>'
          + '    <textarea id="qna-w-content" class="qna-textarea" rows="8" placeholder="Write your message here..."></textarea>'
          + '  </div>'
          + '  <div class="qna-form-row">'
          + '    <div class="qna-form-group qna-half">'
          + '      <label>Image (max 2MB)</label>'
          + '      <input type="file" id="qna-w-image" class="qna-input" accept="image/*">'
          + '    </div>'
          + '    <div class="qna-form-group qna-half" style="display:flex;align-items:flex-end;">'
          + '      <label class="qna-checkbox-label"><input type="checkbox" id="qna-w-secret"> <i class="bi bi-lock"></i> Secret Post</label>'
          + '    </div>'
          + '  </div>'
          + '  <div class="qna-form-actions">'
          + '    <button class="qna-btn qna-btn-primary" id="qna-w-submit"><i class="bi bi-send"></i> Submit</button>'
          + '    <button class="qna-btn qna-btn-cancel" id="qna-w-cancel">Cancel</button>'
          + '  </div>'
          + '  <div id="qna-w-error" class="qna-error"></div>'
          + '</div></div>';

        document.getElementById('qna-back').addEventListener('click', function() {
            if (isReply) renderView(parentNo); else renderList();
        });
        document.getElementById('qna-w-cancel').addEventListener('click', function() {
            if (isReply) renderView(parentNo); else renderList();
        });
        document.getElementById('qna-w-submit').addEventListener('click', function() {
            var id = document.getElementById('qna-w-id').value.trim();
            var pw = document.getElementById('qna-w-pw').value;
            var title = document.getElementById('qna-w-title').value.trim();
            var content = document.getElementById('qna-w-content').value.trim();
            var secret = document.getElementById('qna-w-secret').checked ? 1 : 0;
            var imageInput = document.getElementById('qna-w-image');

            if (!id || !pw || !title) {
                document.getElementById('qna-w-error').textContent = 'ID, Password, Title are required.';
                return;
            }

            var fd = new FormData();
            fd.append('action', 'write');
            fd.append('id', id);
            fd.append('password', pw);
            fd.append('title', title);
            fd.append('content', content);
            fd.append('is_secret', secret);
            fd.append('parent_no', parentNo);
            if (imageInput.files.length > 0) fd.append('image', imageInput.files[0]);

            fetch(API_URL, { method: 'POST', body: fd }).then(function(r) { return r.json(); }).then(function(data) {
                if (data.ok) {
                    if (isReply) renderView(parentNo); else renderList(1);
                } else {
                    document.getElementById('qna-w-error').textContent = data.error || 'Failed';
                }
            });
        });
    }

    // ── 삭제 확인 ──
    function renderDeleteConfirm(no) {
        var mount = document.getElementById(mountId);
        mount.innerHTML =
            '<div class="qna-wrap">'
          + '<button class="qna-btn qna-btn-back" id="qna-back"><i class="bi bi-arrow-left"></i> Back</button>'
          + '<div class="qna-form-card">'
          + '  <h2 class="qna-form-title"><i class="bi bi-trash"></i> Delete Post</h2>'
          + '  <p style="color:#64748b;margin-bottom:20px;">Enter your password to delete this post.</p>'
          + '  <div class="qna-form-group">'
          + '    <label>Password</label>'
          + '    <input type="password" id="qna-del-pw" class="qna-input">'
          + '  </div>'
          + '  <div class="qna-form-actions">'
          + '    <button class="qna-btn qna-btn-danger" id="qna-del-submit"><i class="bi bi-trash"></i> Delete</button>'
          + '    <button class="qna-btn qna-btn-cancel" id="qna-del-cancel">Cancel</button>'
          + '  </div>'
          + '  <div id="qna-del-error" class="qna-error"></div>'
          + '</div></div>';

        document.getElementById('qna-back').addEventListener('click', function() { renderView(no); });
        document.getElementById('qna-del-cancel').addEventListener('click', function() { renderView(no); });
        document.getElementById('qna-del-submit').addEventListener('click', function() {
            var pw = document.getElementById('qna-del-pw').value;
            var fd = new FormData();
            fd.append('action', 'delete');
            fd.append('no', no);
            fd.append('password', pw);
            fetch(API_URL, { method: 'POST', body: fd }).then(function(r) { return r.json(); }).then(function(data) {
                if (data.ok) { renderList(1); }
                else { document.getElementById('qna-del-error').textContent = data.error || 'Failed'; }
            });
        });
    }

    // ── 유틸 ──
    function _esc(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    function _nl2br(s) { return s.replace(/\n/g, '<br>'); }
    function _formatDate(d) {
        if (!d) return '';
        return d.replace(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):\d{2}/, '$1.$2.$3 $4:$5');
    }
    function _emptyTable() {
        return '<div class="qna-table-empty">'
            + '<table class="qna-list-table"><thead><tr>'
            + '<th style="width:60px">No</th>'
            + '<th>Title</th>'
            + '<th style="width:100px">Author</th>'
            + '<th style="width:140px">Date</th>'
            + '</tr></thead>'
            + '<tbody><tr><td colspan="4" class="qna-empty-row">'
            + '<i class="bi bi-chat-left-text"></i><br>No posts yet. Be the first to write!'
            + '</td></tr></tbody></table></div>';
    }

    return { init: init };
})();
