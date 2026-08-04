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
        API_URL = loc.protocol + '//' + loc.host + loc.pathname;
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

            var html = '<table class="qna-list-table"><thead><tr>'
                + '<th style="width:60px">No</th>'
                + '<th>Title</th>'
                + '<th style="width:120px">Author</th>'
                + '<th style="width:160px">Date</th>'
                + '<th style="width:40px"></th>'
                + '</tr></thead><tbody>';
            data.rows.forEach(function(row) {
                var isReply = row.parent_no > 0;
                var indent = isReply ? 'padding-left:' + (16 + row.depth * 24) + 'px' : '';
                var secretBadge = row.is_secret == 1 ? ' <span class="qna-badge qna-badge-secret"><i class="bi bi-lock-fill"></i></span>' : '';
                var answeredBadge = row.is_answered == 1 ? ' <span class="qna-badge qna-badge-answered"><i class="bi bi-check-circle-fill"></i></span>' : '';
                var replyBadge = isReply ? '<span class="qna-badge qna-badge-reply"><i class="bi bi-reply-fill"></i></span> ' : '';
                var date = _formatDate(row.created_at);

                html += '<tr class="qna-row" data-no="' + row.no + '" style="cursor:pointer;">'
                     +  '<td>' + row.no + '</td>'
                     +  '<td style="text-align:left;' + indent + '">' + replyBadge + secretBadge + answeredBadge + ' ' + _esc(row.title) + '</td>'
                     +  '<td>' + _esc(row.id) + '</td>'
                     +  '<td>' + date + '</td>'
                     +  '<td><i class="bi bi-chevron-right" style="color:#cbd5e1;"></i></td>'
                     +  '</tr>';
            });
            html += '</tbody></table>';
            body.innerHTML = html;

            // 클릭 이벤트: 답글이면 원본 글로 이동
            body.querySelectorAll('.qna-row').forEach(function(el) {
                el.addEventListener('click', function() {
                    var no = parseInt(this.getAttribute('data-no'));
                    var item = data.rows.find(function(r) { return r.no == no; });
                    var viewNo = (item && item.parent_no > 0) ? item.parent_no : no;
                    if (item && item.is_secret == 1 && !item.content) {
                        renderUnlockForm(viewNo);
                    } else {
                        renderView(viewNo);
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
                + '    <div class="qna-view-content">' + post.content + '</div>';

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
                    html += '<div class="qna-reply-card" style="margin-left:' + ((r.depth - 1) * 20) + 'px">'
                        + '  <div class="qna-reply-header">'
                        + '    <span><i class="bi bi-person"></i> ' + _esc(r.id) + '</span>'
                        + '    <span><i class="bi bi-clock"></i> ' + rDate + '</span>'
                        + '  </div>'
                        + '  <div class="qna-reply-body">' + r.content + '</div>';
                    if (r.image_path) {
                        var rImgUrl = window.location.protocol + '//' + window.location.host + window.location.pathname.replace(/[^\/]*$/, '') + r.image_path;
                        html += '<div class="qna-view-image"><img src="' + rImgUrl + '" alt="attached"></div>';
                    }
                    html += '  <div class="qna-reply-actions">'
                        + '    <button class="qna-btn qna-btn-reply-small" data-reply-to="' + r.no + '"><i class="bi bi-reply"></i> Reply</button>'
                        + '  </div>'
                        + '</div>';
                });
                html += '</div>';
            }

            html += '</div>';
            mount.innerHTML = html;

            document.getElementById('qna-back').addEventListener('click', function() { renderList(); });
            document.getElementById('qna-reply-btn').addEventListener('click', function() { renderWriteForm(no); });
            document.getElementById('qna-delete-btn').addEventListener('click', function() { renderDeleteConfirm(no, post.is_secret == 1); });
            mount.querySelectorAll('.qna-btn-reply-small').forEach(function(btn) {
                btn.addEventListener('click', function() { renderWriteForm(parseInt(this.getAttribute('data-reply-to'))); });
            });
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
            fd.append('no', no);
            fd.append('password', pw);
            fetch(API_URL + '?action=unlock', { method: 'POST', body: fd }).then(function(r) { return r.json(); }).then(function(data) {
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
          + '  <div class="qna-form-group">'
          + '    <label>ID <span class="qna-required">*</span></label>'
          + '    <input type="text" id="qna-w-id" class="qna-input" placeholder="Your ID">'
          + '  </div>'
          + '  <div class="qna-form-row">'
          + '    <div class="qna-form-group qna-half">'
          + '      <label><i class="bi bi-lock"></i> Password (enter to make secret post)</label>'
          + '      <input type="password" id="qna-w-pw" class="qna-input" placeholder="Leave empty for public post">'
          + '    </div>'
          + '    <div class="qna-form-group qna-half">'
          + '      <label>Confirm Password</label>'
          + '      <input type="password" id="qna-w-pw2" class="qna-input" placeholder="Re-enter password">'
          + '    </div>'
          + '  </div>'
          + '  <div class="qna-form-group">'
          + '    <label>Title <span class="qna-required">*</span></label>'
          + '    <input type="text" id="qna-w-title" class="qna-input" placeholder="Post title">'
          + '  </div>'
          + '  <div class="qna-form-group">'
          + '    <label>Content <span style="color:#94a3b8;font-weight:400;">(Ctrl+V to paste images)</span></label>'
          + '    <div id="qna-w-content" class="qna-contenteditable" contenteditable="true"></div>'
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
        // 이미지 붙여넣기 핸들러
        document.getElementById('qna-w-content').addEventListener('paste', function(e) {
            var items = (e.clipboardData || e.originalEvent.clipboardData).items;
            for (var i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    e.preventDefault();
                    var file = items[i].getAsFile();
                    if (file.size > 2 * 1024 * 1024) {
                        document.getElementById('qna-w-error').textContent = 'Image too large (max 2MB)';
                        return;
                    }
                    var reader = new FileReader();
                    reader.onload = function(ev) {
                        document.execCommand('insertImage', false, ev.target.result);
                    };
                    reader.readAsDataURL(file);
                    return;
                }
            }
        });

        document.getElementById('qna-w-submit').addEventListener('click', function() {
            var id = document.getElementById('qna-w-id').value.trim();
            var pw = document.getElementById('qna-w-pw').value;
            var pw2 = document.getElementById('qna-w-pw2').value;
            var title = document.getElementById('qna-w-title').value.trim();
            var content = document.getElementById('qna-w-content').innerHTML.trim();

            if (!id) {
                document.getElementById('qna-w-error').textContent = 'ID is required.';
                return;
            }
            if (!title) {
                document.getElementById('qna-w-error').textContent = 'Title is required.';
                return;
            }
            if (pw && pw !== pw2) {
                document.getElementById('qna-w-error').textContent = 'Passwords do not match.';
                return;
            }

            var secret = pw ? 1 : 0;

            var fd = new FormData();
            fd.append('id', id);
            fd.append('password', pw);
            fd.append('title', title);
            fd.append('content', content);
            fd.append('is_secret', secret);
            fd.append('parent_no', parentNo);

            fetch(API_URL + '?action=write', { method: 'POST', body: fd }).then(function(r) {
                return r.text();
            }).then(function(text) {
                try {
                    var data = JSON.parse(text);
                    if (data.ok) {
                        if (isReply) renderView(parentNo); else renderList(1);
                    } else {
                        document.getElementById('qna-w-error').textContent = data.error || 'Failed';
                    }
                } catch(e) {
                    document.getElementById('qna-w-error').textContent = 'Server error: ' + text.substring(0, 200);
                }
            }).catch(function(err) {
                document.getElementById('qna-w-error').textContent = 'Network error: ' + err.message;
            });
        });
    }

    // ── 삭제 확인 ──
    function renderDeleteConfirm(no, hasPassword) {
        var mount = document.getElementById(mountId);

        if (!hasPassword) {
            mount.innerHTML =
                '<div class="qna-wrap">'
              + '<button class="qna-btn qna-btn-back" id="qna-back"><i class="bi bi-arrow-left"></i> Back</button>'
              + '<div class="qna-form-card">'
              + '  <h2 class="qna-form-title"><i class="bi bi-trash"></i> Delete Post</h2>'
              + '  <p style="color:#64748b;margin-bottom:20px;">Are you sure you want to delete this post?</p>'
              + '  <div class="qna-form-actions">'
              + '    <button class="qna-btn qna-btn-danger" id="qna-del-submit"><i class="bi bi-trash"></i> Delete</button>'
              + '    <button class="qna-btn qna-btn-cancel" id="qna-del-cancel">Cancel</button>'
              + '  </div>'
              + '  <div id="qna-del-error" class="qna-error"></div>'
              + '</div></div>';
        } else {
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
        }

        document.getElementById('qna-back').addEventListener('click', function() { renderView(no); });
        document.getElementById('qna-del-cancel').addEventListener('click', function() { renderView(no); });
        document.getElementById('qna-del-submit').addEventListener('click', function() {
            var pwEl = document.getElementById('qna-del-pw');
            var pw = pwEl ? pwEl.value : '';
            var fd = new FormData();
            fd.append('no', no);
            fd.append('password', pw);
            fetch(API_URL + '?action=delete', { method: 'POST', body: fd }).then(function(r) { return r.json(); }).then(function(data) {
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
        return '<table class="qna-list-table"><thead><tr>'
            + '<th style="width:60px">No</th>'
            + '<th>Title</th>'
            + '<th style="width:120px">Author</th>'
            + '<th style="width:160px">Date</th>'
            + '</tr></thead>'
            + '<tbody><tr><td colspan="4" class="qna-empty-row">'
            + '<i class="bi bi-chat-left-text"></i><br>No posts yet. Be the first to write!'
            + '</td></tr></tbody></table>';
    }

    return { init: init };
})();
