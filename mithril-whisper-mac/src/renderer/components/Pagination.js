import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from './Icons';

const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage = 10, 
  onPageChange,
  showInfo = true 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const delta = 2; // How many pages to show around current page
    const range = [];
    const rangeWithDots = [];

    // Always include first page
    range.push(1);

    // Add pages around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    // Always include last page (if more than 1 page)
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Add ellipsis where needed
    let l;
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination-container">
      {showInfo && (
        <div className="pagination-info">
          <span className="terminal-text">
            Showing {startItem}-{endItem} of {totalItems} items
          </span>
        </div>
      )}
      
      <div className="pagination-controls">
        {/* Previous button */}
        <button
          className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous page"
        >
          <ChevronLeftIcon size={16} />
        </button>

        {/* Page numbers */}
        <div className="pagination-pages">
          {pageNumbers.map((page, index) => (
            page === '...' ? (
              <span key={index} className="pagination-ellipsis">
                <MoreHorizontalIcon size={16} />
              </span>
            ) : (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Next button */}
        <button
          className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next page"
        >
          <ChevronRightIcon size={16} />
        </button>
      </div>

      {/* Items per page selector */}
      <div className="pagination-size">
        <span className="pagination-label">Per page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onPageChange(1, parseInt(e.target.value))}
          className="pagination-select"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      <style jsx>{`
        .pagination-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .pagination-info {
          color: var(--text-dim);
          font-size: 0.9rem;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .pagination-pages {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin: 0 0.5rem;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 2rem;
          height: 2rem;
          padding: 0.25rem 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.05);
          color: var(--text);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination-btn:hover:not(.disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--primary);
        }

        .pagination-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          font-weight: 500;
        }

        .pagination-btn.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pagination-ellipsis {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 2rem;
          height: 2rem;
          color: var(--text-dim);
        }

        .pagination-size {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-dim);
          font-size: 0.9rem;
        }

        .pagination-label {
          white-space: nowrap;
        }

        .pagination-select {
          padding: 0.25rem 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.05);
          color: var(--text);
          font-size: 0.9rem;
          cursor: pointer;
        }

        .pagination-select:focus {
          outline: none;
          border-color: var(--primary);
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .pagination-container {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .pagination-info {
            order: -1;
          }
          
          .pagination-controls {
            order: 0;
          }
          
          .pagination-size {
            order: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Pagination;

