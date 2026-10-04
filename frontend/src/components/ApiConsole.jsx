import React, { useState, useMemo } from 'react';
import { X, Trash2, Code2, ArrowUpRight, CheckCircle2, AlertTriangle, Copy, Check, Filter, Search, Download, RefreshCw, Layers } from 'lucide-react';
import { useLog } from '../context/LogContext';
import { useToast } from './Toast';

export const ApiConsole = () => {
  const { logs, clearLogs, isConsoleOpen, setIsConsoleOpen } = useLog();
  const { addToast } = useToast();
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [filterService, setFilterService] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isConsoleOpen) return null;

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
    setCopiedId(id);
    addToast('Payload copied to clipboard!', 'info', 2000);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `microservices_api_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('API Logs exported successfully as JSON', 'success');
  };

  const filteredLogs = logs.filter((log) => {
    const matchService = filterService === 'ALL' || log.service === filterService;
    const matchSearch =
      log.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(log.status).includes(searchQuery);
    return matchService && matchSearch;
  });

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[540px] md:w-[640px] bg-slate-900 text-slate-100 shadow-2xl z-50 flex flex-col border-l border-slate-800 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              Live API Gateway Traffic Inspector
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Target Gateway: <span className="text-blue-400">http://localhost:8080</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <button
              onClick={handleExportJson}
              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Export Logs as JSON"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={clearLogs}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Clear all recorded logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsConsoleOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs">
        {/* Search */}
        <div className="relative w-full sm:w-48">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Search URLs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Microservice Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto font-mono text-[10px]">
          {['ALL', 'product-service', 'inventory-service', 'order-service', 'auth-service'].map((svc) => (
            <button
              key={svc}
              onClick={() => setFilterService(svc)}
              className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                filterService === svc
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {svc === 'ALL' ? 'ALL' : svc.replace('-service', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed & Inspector Split View */}
      <div className="flex-1 flex flex-col overflow-hidden divide-y divide-slate-800">
        
        {/* Log List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-sans">
              <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-400">No requests matching filter</p>
              <p className="text-xs text-slate-500 mt-1">Interact with catalog, place orders, or run traffic simulator.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isSelected = selectedLog?.id === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(isSelected ? null : log)}
                  className={`p-3 cursor-pointer transition-colors hover:bg-slate-800/70 ${
                    isSelected ? 'bg-slate-800/90 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.method === 'GET'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : log.method === 'POST'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : log.method === 'PUT'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {log.method}
                      </span>

                      <span className="text-slate-200 font-semibold truncate max-w-[220px]" title={log.url}>
                        {log.url}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {log.service}
                      </span>
                      {log.latencyMs && (
                        <span className="text-emerald-400 text-[10px] font-mono font-bold">
                          {log.latencyMs}ms
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      {log.status >= 200 && log.status < 300 ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                      )}
                      HTTP {log.status}
                    </span>
                    <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Log Inspector Detail */}
        {selectedLog && (
          <div className="h-[290px] bg-slate-950 p-4 border-t border-slate-800 flex flex-col font-mono overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                Payload Inspector ({selectedLog.service})
              </span>
              <button
                onClick={() => copyToClipboard(selectedLog, selectedLog.id)}
                className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {copiedId === selectedLog.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedId === selectedLog.id ? 'Copied' : 'Copy JSON'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-2 space-y-3 text-[11px]">
              <div>
                <div className="text-slate-500 font-semibold mb-1">REQUEST PAYLOAD:</div>
                <pre className="p-2 rounded bg-slate-900 text-emerald-300 border border-slate-800 overflow-x-auto text-[10px]">
                  {selectedLog.reqData ? JSON.stringify(selectedLog.reqData, null, 2) : 'null (No Body Sent)'}
                </pre>
              </div>

              <div>
                <div className="text-slate-500 font-semibold mb-1">RESPONSE BODY:</div>
                <pre className="p-2 rounded bg-slate-900 text-blue-300 border border-slate-800 overflow-x-auto text-[10px]">
                  {selectedLog.resData ? JSON.stringify(selectedLog.resData, null, 2) : 'null'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Click any log row to inspect JSON structure</span>
        <span className="text-emerald-400 font-mono">CORS: http://localhost:5173</span>
      </div>
    </div>
  );
};
