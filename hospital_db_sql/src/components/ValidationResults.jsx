import React from 'react';
import { Clock } from 'lucide-react';

export default function ValidationResults({ validationResult, userQueryExecuted }) {
  if (!userQueryExecuted || !validationResult) {
    return null;
  }

  const { isMatch, userResult, expectedResult, message } = validationResult;

  const renderTable = (resultObj) => {
    if (!resultObj || !resultObj.columns || resultObj.columns.length === 0) {
      return <p className="no-rows-text">No results found or table structure empty.</p>;
    }

    return (
      <div className="table-responsive">
        <table className="playground-table">
          <thead>
            <tr>
              {resultObj.columns.map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resultObj.values.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx}>
                    {cell === null ? <span className="null-val">NULL</span> : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="results-container">
      {/* Feedback Message Banner matching user template */}
      <div className={`message-banner ${isMatch ? 'success' : 'error'}`}>
        <div className="banner-text">
          {message}
        </div>
        {userResult && userResult.executionTimeMs && (
          <div className="stat-time">
            <Clock size={13} /> {userResult.executionTimeMs} ms
          </div>
        )}
      </div>

      {/* User Output Table */}
      {userResult && userResult.success && (
        <div className="output-block">
          <h3 className="output-heading">Your Output:</h3>
          {renderTable(userResult)}
        </div>
      )}

      {/* Syntax / Execution Error Trace */}
      {userResult && !userResult.success && (
        <div className="output-block">
          <h3 className="output-heading error-text">⚠️ Error in SQL Syntax:</h3>
          <pre className="error-trace-code">{userResult.error}</pre>
        </div>
      )}

      {/* Expected Output Table (Shown when Wrong Answer) */}
      {!isMatch && expectedResult && expectedResult.success && (
        <div className="output-block expected-block">
          <h3 className="output-heading expected-text">Expected Output (if wrong):</h3>
          {renderTable(expectedResult)}
        </div>
      )}
    </div>
  );
}
