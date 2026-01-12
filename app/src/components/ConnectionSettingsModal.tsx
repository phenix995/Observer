// components/ConnectionSettingsModal.tsx

import React, { useState } from 'react';
import { X, RefreshCw, Plus, Trash2, Key, Eye, EyeOff } from 'lucide-react';
import type { CustomServer } from '@utils/inferenceServer';

// Re-using the types from AppHeader. You might want to move these to a shared types file.
type QuotaInfo = {
  used: number;
  remaining: number;
  limit: number;
  tier: string;
} | null;

interface ConnectionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUsingObServer: boolean;
  handleToggleObServer: () => void;
  showLoginMessage: boolean;
  isAuthenticated: boolean;
  quotaInfo: QuotaInfo;
  renderQuotaStatus: () => React.ReactNode;
  localServerOnline: boolean;
  checkLocalServer: () => void;
  customServers: CustomServer[];
  onAddCustomServer: (address: string, apiKey?: string) => void;
  onRemoveCustomServer: (address: string) => void;
  onToggleCustomServer: (address: string) => void;
  onCheckCustomServer: (address: string) => void;
  onUpdateApiKey: (address: string, apiKey: string) => void;
}

const ConnectionSettingsModal: React.FC<ConnectionSettingsModalProps> = ({
  isOpen,
  onClose,
  isUsingObServer,
  handleToggleObServer,
  showLoginMessage,
  isAuthenticated,
  renderQuotaStatus,
  localServerOnline,
  checkLocalServer,
  customServers,
  onAddCustomServer,
  onRemoveCustomServer,
  onToggleCustomServer,
  onCheckCustomServer,
  onUpdateApiKey,
}) => {
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [newServerAddress, setNewServerAddress] = useState('');
  const [newServerApiKey, setNewServerApiKey] = useState('');
  const [addError, setAddError] = useState('');
  const [editingApiKeyServer, setEditingApiKeyServer] = useState<string | null>(null);
  const [editingApiKeyValue, setEditingApiKeyValue] = useState('');
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleAddServer = () => {
    setAddError('');

    // Basic URL validation
    if (!newServerAddress.trim()) {
      setAddError('Please enter a server address');
      return;
    }

    // Check if URL has protocol
    if (!newServerAddress.match(/^https?:\/\//)) {
      setAddError('URL must start with http:// or https://');
      return;
    }

    // Try to validate URL format
    try {
      new URL(newServerAddress);
      onAddCustomServer(newServerAddress, newServerApiKey.trim() || undefined);
      setNewServerAddress('');
      setNewServerApiKey('');
      setIsAddingServer(false);
    } catch (error) {
      setAddError('Invalid URL format');
    }
  };

  const handleUpdateApiKey = () => {
    if (editingApiKeyServer) {
      onUpdateApiKey(editingApiKeyServer, editingApiKeyValue.trim());
      setEditingApiKeyServer(null);
      setEditingApiKeyValue('');
    }
  };

  const toggleShowApiKey = (address: string) => {
    setShowApiKey(prev => ({ ...prev, [address]: !prev[address] }));
  };

  const startEditingApiKey = (server: CustomServer) => {
    setEditingApiKeyServer(server.address);
    setEditingApiKeyValue(server.apiKey || '');
  };

  const cancelEditingApiKey = () => {
    setEditingApiKeyServer(null);
    setEditingApiKeyValue('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">Connection Settings</h2>

        {/* Ob-Server Section */}
        <div className="p-3 border rounded-md mb-4">
            <div className="flex justify-between items-center">
                <label htmlFor="ob-server-toggle" className="font-medium text-gray-700">Use Ob-Server Cloud</label>
                <button
                  id="ob-server-toggle"
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                    isUsingObServer ? 'bg-blue-500' : 'bg-slate-700'
                  }`}
                  onClick={handleToggleObServer}
                  aria-label={isUsingObServer ? "Disable Ob-Server" : "Enable Ob-Server"}
                >
                  <span
                    className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                      isUsingObServer ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
            </div>
            {showLoginMessage && <span className="text-xs text-red-500 font-semibold mt-1 block">Login Required</span>}
            {isUsingObServer ? (
                isAuthenticated ? (
                    <div className="text-sm text-center mt-2">
                        {renderQuotaStatus()}
                    </div>
                ) : null
            ) : (
                <div className="text-xs text-center mt-1">
                    <span className="font-semibold text-gray-500">
                        Fully Offline
                    </span>
                </div>
            )}
        </div>

        {/* Local Server Section */}
        <div className="p-3 border rounded-md bg-gray-50">
            <div className="flex justify-between items-center">
                <label className="font-medium text-gray-700">Local Server</label>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-semibold ${
                    localServerOnline ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {localServerOnline ? 'Online' : 'Offline'}
                  </span>
                  <button
                    onClick={checkLocalServer}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Check server status"
                  >
                    <RefreshCw className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">http://localhost:3838</p>
        </div>

        {/* Custom Servers Section */}
        <div className="mt-4">
          <h3 className="font-medium text-gray-700 mb-2">Custom Inference Servers</h3>
          <p className="text-xs text-gray-500 mt-1">Warning: Manage CORS correctly with a proxy.</p>

          {/* Custom servers list */}
          {customServers.length > 0 && (
            <div className="space-y-2 mb-3">
              {customServers.map((server) => (
                <div key={server.address} className="p-3 border rounded-md">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-sm font-medium text-gray-700 break-all">{server.address}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs font-semibold ${
                          server.status === 'online' ? 'text-green-600' :
                          server.status === 'offline' ? 'text-red-500' :
                          'text-gray-400'
                        }`}>
                          {server.status === 'online' ? 'Online' :
                           server.status === 'offline' ? 'Offline' :
                           'Unchecked'}
                        </span>
                        <button
                          onClick={() => onCheckCustomServer(server.address)}
                          className="p-0.5 hover:bg-gray-200 rounded"
                          title="Check server status"
                        >
                          <RefreshCw className="h-3 w-3 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Toggle switch */}
                      <button
                        className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none ${
                          server.enabled ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        onClick={() => onToggleCustomServer(server.address)}
                        aria-label={server.enabled ? "Disable server" : "Enable server"}
                      >
                        <span
                          className={`inline-block w-3 h-3 transform transition-transform bg-white rounded-full ${
                            server.enabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      {/* Remove button */}
                      <button
                        onClick={() => onRemoveCustomServer(server.address)}
                        className="p-1 hover:bg-red-100 rounded text-red-500"
                        title="Remove server"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {/* API Key Section */}
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    {editingApiKeyServer === server.address ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingApiKeyValue}
                          onChange={(e) => setEditingApiKeyValue(e.target.value)}
                          placeholder="Enter API key (optional)"
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={handleUpdateApiKey}
                          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditingApiKey}
                          className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <Key className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          {server.apiKey ? (
                            <span className="text-xs text-gray-600 truncate">
                              {showApiKey[server.address] ? server.apiKey : '••••••••••••'}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No API key</span>
                          )}
                          {server.apiKey && (
                            <button
                              onClick={() => toggleShowApiKey(server.address)}
                              className="p-0.5 hover:bg-gray-100 rounded flex-shrink-0"
                              title={showApiKey[server.address] ? "Hide API key" : "Show API key"}
                            >
                              {showApiKey[server.address] ? (
                                <EyeOff className="h-3 w-3 text-gray-500" />
                              ) : (
                                <Eye className="h-3 w-3 text-gray-500" />
                              )}
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => startEditingApiKey(server)}
                          className="text-xs text-blue-600 hover:text-blue-800 ml-2 flex-shrink-0"
                        >
                          {server.apiKey ? 'Edit' : 'Add'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add server button/form */}
          {!isAddingServer ? (
            <button
              onClick={() => setIsAddingServer(true)}
              className="w-full py-2 px-3 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Server
            </button>
          ) : (
            <div className="border-2 border-blue-300 rounded-md p-3">
              <input
                type="text"
                value={newServerAddress}
                onChange={(e) => {
                  setNewServerAddress(e.target.value);
                  setAddError('');
                }}
                placeholder="http://192.168.1.100:8080"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="relative mb-2">
                <input
                  type={showApiKey['new'] ? 'text' : 'password'}
                  value={newServerApiKey}
                  onChange={(e) => setNewServerApiKey(e.target.value)}
                  placeholder="API Key (optional for local servers)"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => toggleShowApiKey('new')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey['new'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {addError && (
                <p className="text-xs text-red-500 mb-2">{addError}</p>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={handleAddServer}
                  className="flex-1 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingServer(false);
                    setNewServerAddress('');
                    setNewServerApiKey('');
                    setAddError('');
                  }}
                  className="flex-1 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ConnectionSettingsModal;
