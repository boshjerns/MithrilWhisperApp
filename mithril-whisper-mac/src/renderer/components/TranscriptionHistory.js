import React, { useState, useMemo } from 'react';
import { HistoryIcon, CopyIcon, PasteIcon, PowerIcon } from './Icons';
import Pagination from './Pagination';

function TranscriptionHistory({ transcriptions, onInjectText, onClear }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleCopyText = (text) => {
    // Show text in a modal/notification instead of copying to clipboard
    // This preserves the user's clipboard contents
    alert(`Text ready for manual copying:\n\n${text}\n\nThis text was not automatically copied to preserve your clipboard.`);
  };

  const handleInjectText = (text) => {
    onInjectText(text);
  };

  const toggleDetails = (id) => {
    setSelectedItem(selectedItem === id ? null : id);
  };

  // Pagination logic
  const paginatedTranscriptions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return transcriptions.slice(startIndex, endIndex);
  }, [transcriptions, currentPage, itemsPerPage]);

  const handlePageChange = (page, newItemsPerPage) => {
    if (newItemsPerPage && newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage);
    }
    setCurrentPage(page);
    setSelectedItem(null); // Close any open details when changing pages
  };

  if (transcriptions.length === 0) {
    return (
      <div className="transcription-history empty" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
          <HistoryIcon size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>No transcriptions yet</h3>
          <p className="terminal-text">Start recording to see your transcriptions here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transcription-history">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2>
          <HistoryIcon size={24} />
          Transcription History
        </h2>
      </div>
      
      <div className="glass-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="terminal-text">[{transcriptions.length}] items</span>
        <button className="btn" onClick={onClear}>
          <PowerIcon size={16} style={{ marginRight: '8px' }} />
          Clear All
        </button>
      </div>

      <div className="history-list">
        {paginatedTranscriptions.map((item) => (
          <div key={item.id} className="glass-card" style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0' }} onClick={() => toggleDetails(item.id)}>
              <div className="history-time" style={{ width: '140px', flexShrink: 0 }}>
                {formatTimestamp(item.timestamp)}
              </div>
              <div className="history-text" style={{ flex: 1, margin: '0 16px' }}>
                {item.cleaned?.substring(0, 100) || item.original?.substring(0, 100)}
                {(item.cleaned?.length > 100 || item.original?.length > 100) && '...'}
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>
                {selectedItem === item.id ? '▼' : '▶'}
              </div>
            </div>

            {selectedItem === item.id && (
              <div style={{ padding: '16px', borderTop: '1px solid var(--glass-border)' }}>
                {item.original && (
                  <div style={{ marginBottom: '16px' }}>
                    <div className="input-label">Original Transcript:</div>
                    <div className="glass-card" style={{ padding: '12px', fontFamily: 'JetBrains Mono', fontSize: '13px', lineHeight: '1.6' }}>
                      {item.original}
                    </div>
                  </div>
                )}

                {item.cleaned && (
                  <div style={{ marginBottom: '16px' }}>
                    <div className="input-label">Processed Text:</div>
                    <div className="glass-card" style={{ padding: '12px', fontFamily: 'JetBrains Mono', fontSize: '13px', lineHeight: '1.6', borderLeft: '3px solid var(--success)' }}>
                      {item.cleaned}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <button
                    className="btn"
                    onClick={() => handleCopyText(item.cleaned || item.original)}
                  >
                    <CopyIcon size={16} style={{ marginRight: '8px' }} />
                    Show Text
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleInjectText(item.cleaned || item.original)}
                  >
                    <PasteIcon size={16} style={{ marginRight: '8px' }} />
                    Inject
                  </button>
                  {item.original && (
                    <button
                      className="btn"
                      onClick={() => handleCopyText(item.original)}
                    >
                      <CopyIcon size={16} style={{ marginRight: '8px' }} />
                      Show Original
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={transcriptions.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />

      <div className="history-footer">
        <div className="history-stats">
          <div className="stat-item">
            <div className="stat-label">Total transcriptions:</div>
            <div className="stat-value">{transcriptions.length}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Last transcription:</div>
            <div className="stat-value">
              {transcriptions.length > 0 
                ? formatTimestamp(transcriptions[0].timestamp)
                : 'None'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TranscriptionHistory; 