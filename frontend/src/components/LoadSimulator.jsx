import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Activity, Users, Zap, CheckCircle2, AlertTriangle, X, Shield, Cpu, RefreshCw } from 'lucide-react';
import { handleApiCall } from '../api/client';
import { useLog } from '../context/LogContext';
import { useToast } from './Toast';

export const LoadSimulator = ({ isOpen, onClose }) => {
  const { addLog } = useLog();
  const { addToast } = useToast();

  const [isRunning, setIsRunning] = useState(false);
  const [concurrency, setConcurrency] = useState(20); // 10, 20, 50, 100
  const [targetEndpoint, setTargetEndpoint] = useState('mixed'); // 'products', 'orders', 'inventory', 'mixed'
  const [stats, setStats] = useState({
    totalSent: 0,
    success: 0,
    failed: 0,
    avgLatency: 0,
    rps: 0,
    latencies: [],
  });

  const isRunningRef = useRef(false);
  const statsRef = useRef(stats);
  statsRef.current = stats;

  const endpoints = [
    { id: 'mixed', label: 'Mixed High-Volume (All 4 Microservices)' },
    { id: 'products', label: 'product-service (GET & Search)' },
    { id: 'orders', label: 'order-service (Rapid Order Placement)' },
    { id: 'inventory', label: 'inventory-service (Stock Checks)' },
  ];

  const runTrafficWorker = async () => {
    while (isRunningRef.current) {
      const endpointsList = [];
      if (targetEndpoint === 'mixed') {
        endpointsList.push(
          { service: 'product-service', method: 'get', url: '/api/products' },
          { service: 'inventory-service', method: 'get', url: '/api/inventory' },
          { service: 'order-service', method: 'get', url: '/api/orders' },
          {
            service: 'order-service',
            method: 'post',
            url: '/api/orders',
            data: { customerId: Math.floor(100 + Math.random() * 900), productId: Math.floor(1 + Math.random() * 5), quantity: 1 }
          }
        );
      } else if (targetEndpoint === 'products') {
        endpointsList.push({ service: 'product-service', method: 'get', url: '/api/products' });
      } else if (targetEndpoint === 'orders') {
        endpointsList.push({
          service: 'order-service',
          method: 'post',
          url: '/api/orders',
          data: { customerId: Math.floor(100 + Math.random() * 900), productId: Math.floor(1 + Math.random() * 5), quantity: 1 }
        });
      } else {
        endpointsList.push({ service: 'inventory-service', method: 'get', url: '/api/inventory' });
      }

      const randomTarget = endpointsList[Math.floor(Math.random() * endpointsList.length)];
      const startTime = performance.now();

      try {
        const res = await handleApiCall(randomTarget.service, randomTarget.method, randomTarget.url, randomTarget.data, addLog);
        const duration = Math.round(performance.now() - startTime);

        setStats((prev) => {
          const newTotal = prev.totalSent + 1;
          const newSuccess = prev.success + (res.success ? 1 : 0);
          const newFailed = prev.failed + (res.success ? 0 : 1);
          const newLatencies = [...prev.latencies.slice(-19), duration];
          const avg = Math.round(newLatencies.reduce((a, b) => a + b, 0) / newLatencies.length);

          return {
            totalSent: newTotal,
            success: newSuccess,
            failed: newFailed,
            avgLatency: avg,
            latencies: newLatencies,
            rps: prev.rps,
          };
        });
      } catch (err) {
        setStats((prev) => ({ ...prev, totalSent: prev.totalSent + 1, failed: prev.failed + 1 }));
      }

      // Non-blocking micro-delay for smooth concurrency
      await new Promise((r) => setTimeout(r, Math.max(20, 1000 / concurrency)));
    }
  };

  // Measure RPS interval
  useEffect(() => {
    let lastTotal = 0;
    const interval = setInterval(() => {
      if (isRunningRef.current) {
        const diff = statsRef.current.totalSent - lastTotal;
        lastTotal = statsRef.current.totalSent;
        setStats((prev) => ({ ...prev, rps: diff }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    setIsRunning(true);
    isRunningRef.current = true;
    addToast(`High-Volume Traffic Load Simulator active (${concurrency} concurrent threads)!`, 'info');

    // Spawn concurrent workers
    const workersCount = Math.min(concurrency, 8);
    for (let i = 0; i < workersCount; i++) {
      runTrafficWorker();
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    addToast('Traffic Simulator stopped.', 'warning');
  };

  const handleReset = () => {
    handleStop();
    setStats({
      totalSent: 0,
      success: 0,
      failed: 0,
      avgLatency: 0,
      rps: 0,
      latencies: [],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
              <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                High-Volume Microservices Stress & Concurrency Simulator
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Simulates real-world high-traffic throughput with zero UI lag
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulator Controls */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Microservice */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                Target Microservice Scenario
              </label>
              <select
                disabled={isRunning}
                value={targetEndpoint}
                onChange={(e) => setTargetEndpoint(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium disabled:opacity-60"
              >
                {endpoints.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    {ep.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Concurrency Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                Virtual Concurrent Buyers ({concurrency} users)
              </label>
              <div className="flex items-center gap-2">
                {[10, 25, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    disabled={isRunning}
                    onClick={() => setConcurrency(num)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                      concurrency === num
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 disabled:opacity-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Total Requests</span>
              <span className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">{stats.totalSent}</span>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[11px] font-medium text-emerald-700 block">Success Rate</span>
              <span className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5 block">
                {stats.totalSent > 0 ? `${Math.round((stats.success / stats.totalSent) * 100)}%` : '100%'}
              </span>
            </div>

            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-[11px] font-medium text-blue-700 block">Throughput (RPS)</span>
              <span className="text-xl font-extrabold text-blue-700 font-mono mt-0.5 block">{stats.rps} req/s</span>
            </div>

            <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200">
              <span className="text-[11px] font-medium text-purple-700 block">Avg Latency</span>
              <span className="text-xl font-extrabold text-purple-700 font-mono mt-0.5 block">
                {stats.avgLatency || 0} ms
              </span>
            </div>
          </div>

          {/* Latency Sparkline Graph Visualizer */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Live Response Latency Pulse (ms)
              </span>
              <span className="text-emerald-400">{stats.avgLatency}ms avg</span>
            </div>
            <div className="h-16 flex items-end gap-1.5 pt-2 border-b border-slate-800 pb-1">
              {stats.latencies.length === 0 ? (
                <div className="w-full text-center text-[11px] text-slate-600 font-mono self-center">
                  Press Start Simulation to generate live traffic
                </div>
              ) : (
                stats.latencies.map((lat, idx) => {
                  const heightPercent = Math.min(100, Math.max(15, (lat / 150) * 100));
                  return (
                    <div
                      key={idx}
                      style={{ height: `${heightPercent}%` }}
                      className="flex-1 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xs transition-all duration-150"
                      title={`${lat}ms`}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Stats
            </button>

            <div className="flex items-center gap-2">
              {isRunning ? (
                <button
                  onClick={handleStop}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  Stop Simulation
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Start High-Volume Stress Test
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
