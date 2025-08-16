import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../auth/supabaseClient';
import { HistoryIcon, InfoIcon } from './Icons';
import Pagination from './Pagination';

function formatNumber(n) {
  try {
    return new Intl.NumberFormat().format(n || 0);
  } catch (_) {
    return String(n || 0);
  }
}

function humanDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch (_) {
    return iso;
  }
}

export default function UsageHistory() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const load = async () => {
    if (!user) {
      setRows([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('usage_sessions')
        .select('id, started_at, ended_at, duration_ms, transcript_chars_original, transcript_chars_cleaned, model, metadata')
        .eq('user_id', user.id)
        .contains('metadata', { kind: 'assistant' })
        .order('started_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Failed to load usage');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const stats = useMemo(() => {
    let sessions = rows.length;
    let userChars = 0;
    let aiChars = 0;
    let userWords = 0;
    let aiWords = 0;
    for (const r of rows) {
      userChars += Number(r.transcript_chars_original || 0);
      aiChars += Number(r.transcript_chars_cleaned || 0);
      const md = r.metadata || {};
      const uw = Number(md.user_words || 0);
      const aw = Number(md.assistant_words || 0);
      // Fallback approximation if words not present
      userWords += uw > 0 ? uw : Math.round((r.transcript_chars_original || 0) / 5);
      aiWords += aw > 0 ? aw : Math.round((r.transcript_chars_cleaned || 0) / 5);
    }
    const avgUserChars = sessions ? Math.round(userChars / sessions) : 0;
    const avgAiChars = sessions ? Math.round(aiChars / sessions) : 0;
    const avgUserWords = sessions ? Math.round(userWords / sessions) : 0;
    const avgAiWords = sessions ? Math.round(aiWords / sessions) : 0;
    return { sessions, userChars, aiChars, userWords, aiWords, avgUserChars, avgAiChars, avgUserWords, avgAiWords };
  }, [rows]);

  // Pagination logic
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return rows.slice(startIndex, endIndex);
  }, [rows, currentPage, itemsPerPage]);

  const handlePageChange = (page, newItemsPerPage) => {
    if (newItemsPerPage && newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage);
    }
    setCurrentPage(page);
  };

  return (
    <div className="usage-history">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2>
          <HistoryIcon size={24} />
          Usage History
        </h2>
      </div>

      {!user && (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <InfoIcon size={18} />
            <div className="terminal-text">Sign in to see your per-account usage statistics.</div>
          </div>
        </div>
      )}

      {user && (
        <>
          <div className="glass-card" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="terminal-text">{loading ? 'Loading…' : `[${stats.sessions}] assistant sessions`}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={load} disabled={loading}>Refresh</button>
            </div>
          </div>

          <div className="glass-card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div>
                <div className="input-label">You → Assistant</div>
                <div className="terminal-text">{formatNumber(stats.userChars)} characters</div>
                <div className="terminal-text">{formatNumber(stats.userWords)} words</div>
                <div className="terminal-text" style={{ opacity: 0.8 }}>avg {formatNumber(stats.avgUserChars)} chars · {formatNumber(stats.avgUserWords)} words</div>
              </div>
              <div>
                <div className="input-label">Assistant → You</div>
                <div className="terminal-text">{formatNumber(stats.aiChars)} characters</div>
                <div className="terminal-text">{formatNumber(stats.aiWords)} words</div>
                <div className="terminal-text" style={{ opacity: 0.8 }}>avg {formatNumber(stats.avgAiChars)} chars · {formatNumber(stats.avgAiWords)} words</div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div className="input-label" style={{ marginBottom: 8 }}>Usage sessions</div>
            <div className="history-list">
              {paginatedRows.length === 0 && (
                <div className="terminal-text" style={{ opacity: 0.8 }}>No assistant usage yet</div>
              )}
              {paginatedRows.map((r) => {
                const md = r.metadata || {};
                const uw = Number(md.user_words || 0) || Math.round((r.transcript_chars_original || 0) / 5);
                const aw = Number(md.assistant_words || 0) || Math.round((r.transcript_chars_cleaned || 0) / 5);
                return (
                  <div key={r.id} className="glass-card" style={{ marginBottom: 8, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ minWidth: 200 }}>
                        <div className="input-label">Started</div>
                        <div className="terminal-text">{humanDate(r.started_at)}</div>
                      </div>
                      <div>
                        <div className="input-label">You → AI</div>
                        <div className="terminal-text">{formatNumber(r.transcript_chars_original || 0)} chars · {formatNumber(uw)} words</div>
                      </div>
                      <div>
                        <div className="input-label">AI → You</div>
                        <div className="terminal-text">{formatNumber(r.transcript_chars_cleaned || 0)} chars · {formatNumber(aw)} words</div>
                      </div>
                      <div>
                        <div className="input-label">Action</div>
                        <div className="terminal-text">{md.action || '—'}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination for usage sessions */}
            <Pagination
              currentPage={currentPage}
              totalItems={rows.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}

      {error && (
        <div className="glass-card" style={{ marginTop: 12 }}>
          <div className="terminal-text" role="alert">{error}</div>
        </div>
      )}
    </div>
  );
}


