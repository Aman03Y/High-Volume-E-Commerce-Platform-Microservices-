import React, { createContext, useContext, useState } from 'react';

const LogContext = createContext();

export const LogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const addLog = (logItem) => {
    const newLog = {
      id: Date.now() + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toLocaleTimeString(),
      service: logItem.service || 'GATEWAY',
      method: logItem.method || 'GET',
      url: logItem.url || '',
      status: logItem.status || 200,
      reqData: logItem.reqData || null,
      resData: logItem.resData || null,
      isMock: logItem.isMock || false,
      error: logItem.error || null,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const clearLogs = () => setLogs([]);

  return (
    <LogContext.Provider value={{ logs, addLog, clearLogs, isConsoleOpen, setIsConsoleOpen }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLog = () => useContext(LogContext);
