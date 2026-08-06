import React, { useState } from 'react';
import { X, Trash2, Code2, ArrowUpRight, CheckCircle2, AlertTriangle, Copy, Check } from 'lucide-react';
import { useLog } from '../context/LogContext';

export const ApiConsole = () => {
  const { logs, clearLogs, isConsoleOpen, setIsConsoleOpen } = useLog();
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  if (!isConsoleOpen) return null;

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] md:w-[600px] bg-slate-900 text-slate-100 shadow-2xl z-50 flex flex-col border-l border-slate-800 animate-fade-in">
      
      {/* Header */}
      <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              Live API Gateway Inspector
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Intercepting http://localhost:8080 JSON traffic
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearLogs}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsConsoleOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log Feed & Inspector Split View */}
      <div className="flex-1 flex flex-col overflow-hidden divide-y divide-slate-800">
        
        {/* Log List Header */}
        <div className="px-4 py-2 bg-slate-900/90 text-[11px] font-mono font-semibold text-slate-400 flex items-center justify-between">
          <span>HTTP REQUEST TRAFFIC ({logs.length})</span>
          <span>SERVICE ROUTE</span>
        </div>

        {/* Log List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-sans">
              <p className="font-medium text-slate-400 mb-1">No API calls recorded yet</p>
              <p className="text-xs">Perform actions in the UI (create products, update inventory, place orders) to inspect microservices payloads.</p>
            </div>
          ) : (
            logs.map((log) => {
              const isSelected = selectedLog?.id === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(isSelected ? null : log)}
                  className={`p-3 cursor-pointer transition-colors hover:bg-slate-800/70 ${
                    isSelected ? 'bg-slate-800 border-l-4 border-blue-500' : ''
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

                      <span className="text-slate-200 font-semibold truncate max-w-[200px]" title={log.url}>
                        {log.url}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {log.service}
                      </span>
                      <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
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
                    {log.isMock && (
                      <span className="text-[10px] text-indigo-400 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-800">
                        REPLICA FALLBACK
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Log Inspector Detail */}
        {selectedLog && (
          <div className="h-[280px] bg-slate-950 p-4 border-t border-slate-800 flex flex-col font-mono overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                Payload Details ({selectedLog.service})
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
                <div className="text-slate-500 font-semibold mb-1">REQUEST BODY:</div>
                <pre className="p-2 rounded bg-slate-900 text-emerald-300 border border-slate-800 overflow-x-auto">
                  {selectedLog.reqData ? JSON.stringify(selectedLog.reqData, null, 2) : 'null (No body sent)'}
                </pre>
              </div>

              <div>
                <div className="text-slate-500 font-semibold mb-1">RESPONSE BODY:</div>
                <pre className="p-2 rounded bg-slate-900 text-blue-300 border border-slate-800 overflow-x-auto">
                  {selectedLog.resData ? JSON.stringify(selectedLog.resData, null, 2) : 'null'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Click any log row to inspect JSON request/response</span>
        <span className="text-emerald-400 font-mono">CORS: http://localhost:5173</span>
      </div>
    </div>
  );
};
