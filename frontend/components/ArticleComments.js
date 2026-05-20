import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { commentsAPI } from '../utils/api';
import { FaComment, FaTrash, FaEdit } from 'react-icons/fa';
import styles from '../styles/ArticleComments.module.css';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

function formatRelativeTime(dateStr, t) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('time.justNow') || 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function ArticleComments({ articleUrl, articleTitle }) {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const fetchComments = useCallback(async () => {
    if (!articleUrl) return;
    try {
      setLoading(true);
      setError('');
      const data = await commentsAPI.getByArticle(articleUrl);
      setComments(data.comments || []);
    } catch (err) {
      setError(t('comments.errorLoad'));
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [articleUrl, t]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !isAuthenticated) return;

    setSubmitting(true);
    setError('');
    try {
      const newComment = await commentsAPI.create(articleUrl, articleTitle, text.trim());
      setComments((prev) => [newComment, ...prev]);
      setText('');
    } catch (err) {
      setError(err.response?.data?.message || t('comments.errorPost'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm(t('comments.confirmDelete'))) return;
    try {
      await commentsAPI.delete(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      setError(err.response?.data?.message || t('comments.errorDelete'));
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment._id);
    setEditText(comment.text);
  };

  const handleUpdate = async (commentId) => {
    if (!editText.trim()) return;
    try {
      const updated = await commentsAPI.update(commentId, editText.trim());
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? updated : c))
      );
      setEditingId(null);
      setEditText('');
    } catch (err) {
      setError(err.response?.data?.message || t('comments.errorUpdate'));
    }
  };

  const countLabel = (t('comments.count') || '{count} comments').replace(
    '{count}',
    String(comments.length)
  );

  return (
    <section className={styles.commentsSection}>
      <div className={styles.commentsHeader}>
        <h2 className={styles.commentsTitle}>
          <FaComment className={styles.commentsTitleIcon} />
          {t('comments.title')}
        </h2>
        <span className={styles.commentsCount}>{countLabel}</span>
      </div>

      {error && <p className={styles.commentsError}>{error}</p>}

      {isAuthenticated ? (
        <form className={styles.commentForm} onSubmit={handleSubmit}>
          <textarea
            className={styles.commentInput}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('comments.placeholder')}
            rows={3}
            maxLength={2000}
            disabled={submitting}
          />
          <div className={styles.formFooter}>
            <span className={styles.charCount}>{text.length}/2000</span>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !text.trim()}
            >
              {submitting ? t('comments.posting') : t('comments.post')}
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.loginPrompt}>
          <p>{t('comments.loginToComment')}</p>
          <Link href="/login" className={styles.loginLink}>
            {t('comments.login')}
          </Link>
        </div>
      )}

      <div className={styles.commentsList}>
        {loading ? (
          <p className={styles.commentsLoading}>…</p>
        ) : comments.length === 0 ? (
          <p className={styles.commentsEmpty}>{t('comments.empty')}</p>
        ) : (
          comments.map((comment) => {
            const isOwner =
              user &&
              String(comment.user?._id) === String(user._id);
            const canDelete = isOwner || user?.isAdmin;
            const avatarUrl = comment.user?.profilePicture
              ? `${BASE_URL}${comment.user.profilePicture}`
              : null;
            const initial = comment.user?.name?.charAt(0).toUpperCase() || '?';

            return (
              <article key={comment._id} className={styles.commentItem}>
                <div className={styles.commentAvatar}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className={styles.commentAvatarImg} />
                  ) : (
                    initial
                  )}
                </div>
                <div className={styles.commentBody}>
                  <div className={styles.commentMeta}>
                    <span className={styles.commentAuthor}>{comment.user?.name || 'User'}</span>
                    <span className={styles.commentTime}>
                      {formatRelativeTime(comment.createdAt, t)}
                    </span>
                  </div>

                  {editingId === comment._id ? (
                    <div className={styles.editBlock}>
                      <textarea
                        className={styles.commentInput}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                        maxLength={2000}
                      />
                      <div className={styles.editActions}>
                        <button
                          type="button"
                          className={styles.saveEditBtn}
                          onClick={() => handleUpdate(comment._id)}
                        >
                          {t('comments.save')}
                        </button>
                        <button
                          type="button"
                          className={styles.cancelEditBtn}
                          onClick={() => {
                            setEditingId(null);
                            setEditText('');
                          }}
                        >
                          {t('comments.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.commentText}>{comment.text}</p>
                  )}

                  {isOwner && editingId !== comment._id && (
                    <div className={styles.commentActions}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => startEdit(comment)}
                      >
                        <FaEdit /> {t('comments.edit')}
                      </button>
                      {canDelete && (
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={() => handleDelete(comment._id)}
                        >
                          <FaTrash /> {t('comments.delete')}
                        </button>
                      )}
                    </div>
                  )}
                  {!isOwner && user?.isAdmin && (
                    <div className={styles.commentActions}>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => handleDelete(comment._id)}
                      >
                        <FaTrash /> {t('comments.delete')}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
