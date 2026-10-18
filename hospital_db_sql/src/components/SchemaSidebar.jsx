import React, { useState } from 'react';
import { 
  Database, 
  User, 
  Building2, 
  Briefcase, 
  DollarSign, 
  FolderKanban, 
  Stethoscope, 
  ClipboardList, 
  Activity, 
  Eye, 
  X,
  ChevronDown,
  ChevronRight,
  Table as TableIcon 
} from 'lucide-react';
import { executeQuery } from '../utils/sqlEngine';

export default function SchemaSidebar({ activeDbKey, activeSchemaInfo, dbInstance }) {
  const [openTables, setOpenTables] = useState(new Set());
  const [modalTable, setModalTable] = useState(null);
  const [sampleData, setSampleData] = useState(null);

  const toggleTableAccordion = (tableName) => {
    setOpenTables(prev => {
      const next = new Set(prev);
      if (next.has(tableName)) {
        next.delete(tableName);
      } else {
        next.add(tableName);
      }
      return next;
    });
  };

  const getTableIcon = (tableName) => {
    switch (tableName.toLowerCase()) {
      case 'departments': return <Building2 size={16} className="text-amber" />;
      case 'employees': return <User size={16} className="text-cyan" />;
      case 'salaries': return <DollarSign size={16} className="text-emerald" />;
      case 'projects': return <FolderKanban size={16} className="text-purple" />;
      case 'employee_projects': return <Briefcase size={16} className="text-pink" />;
      case 'customers': return <User size={16} className="text-amber" />;
      case 'orders': return <ClipboardList size={16} className="text-cyan" />;
      case 'order_items': return <FolderKanban size={16} className="text-purple" />;
      case 'products': return <Briefcase size={16} className="text-emerald" />;
      case 'payments': return <DollarSign size={16} className="text-emerald" />;
      case 'logins': return <Activity size={16} className="text-pink" />;
      case 'events': return <Activity size={16} className="text-cyan" />;
      case 'salary_history': return <DollarSign size={16} className="text-amber" />;
      case 'doctors': return <Stethoscope size={16} className="text-emerald" />;
      case 'patients': return <User size={16} className="text-cyan" />;
      case 'admissions': return <ClipboardList size={16} className="text-purple" />;
      case 'smart_equipment': return <Activity size={16} className="text-pink" />;
      default: return <Database size={16} />;
    }
  };

  const handlePreviewSampleData = (e, tableName) => {
    e.stopPropagation();
    if (!dbInstance) return;
    const res = executeQuery(dbInstance, `SELECT * FROM ${tableName} LIMIT 5;`);
    setModalTable(tableName);
    setSampleData(res);
  };

  const closeModal = () => {
    setModalTable(null);
    setSampleData(null);
  };

  const dbBadgeLabel = activeDbKey === 'interview_db' 
    ? 'interview.db' 
    : (activeDbKey === 'employee_db' ? 'employee.db' : 'hospital.db');

  return (
    <aside className="schema-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title-group">
          <Database size={18} className="text-emerald" />
          <h2>Database Schema</h2>
        </div>
        <span className="db-badge-tag">
          {dbBadgeLabel}
        </span>
      </div>

      <p className="schema-intro-text">
        Click a table to inspect columns & data types.
      </p>

      <div className="schema-cards-list">
        {(activeSchemaInfo || []).map((tbl) => {
          const isOpen = openTables.has(tbl.tableName);

          return (
            <div 
              key={tbl.tableName} 
              className={`schema-card ${isOpen ? 'schema-card-open' : ''}`}
            >
              <div 
                className="schema-card-header"
                onClick={() => toggleTableAccordion(tbl.tableName)}
              >
                <div className="table-title">
                  {isOpen ? (
                    <ChevronDown size={16} className="accordion-chevron text-cyan" />
                  ) : (
                    <ChevronRight size={16} className="accordion-chevron text-muted" />
                  )}
                  {getTableIcon(tbl.tableName)}
                  <span className="table-name-text">{tbl.tableName}</span>
                </div>

                <button 
                  className="btn-preview-data"
                  onClick={(e) => handlePreviewSampleData(e, tbl.tableName)}
                  title={`Preview sample rows from ${tbl.tableName}`}
                >
                  <Eye size={12} /> Sample
                </button>
              </div>

              {isOpen && (
                <div className="schema-card-dropdown slide-down-animation">
                  <p className="table-desc">{tbl.description}</p>
                  <div className="columns-list">
                    {tbl.columns.map((col) => (
                      <div key={col.name} className="column-row">
                        <div className="column-left">
                          <span className="col-name">{col.name}</span>
                          {col.key && (
                            <span className={`key-badge ${col.key.includes('PK') ? 'pk-badge' : 'fk-badge'}`}>
                              {col.key}
                            </span>
                          )}
                        </div>
                        <span className="col-type">{col.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sample Data Viewer Modal */}
      {modalTable && sampleData && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <TableIcon size={18} className="text-cyan" />
                <span>Sample Records: {modalTable}</span>
              </div>
              <button className="btn-close-modal" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {sampleData.success && sampleData.columns.length > 0 ? (
                <div className="table-responsive">
                  <table className="results-table">
                    <thead>
                      <tr>
                        {sampleData.columns.map((col, idx) => (
                          <th key={idx}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleData.values.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx}>
                              {cell === null ? <span className="null-value">NULL</span> : String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No sample records found or table is empty.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
