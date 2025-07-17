import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { History, ShoppingBag, Calendar, DollarSign } from 'lucide-react';

interface Translation {
  id: number;
  platform: string;
  chinese_text: string;
  english_text: string;
  cost: number;
  created_at: string;
}

export default function HistoryPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await api.getTranslationHistory();
      setTranslations(data);
    } catch (error) {
      toast.error('Failed to load translation history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'amazon':
        return 'bg-orange-100 text-orange-800';
      case 'ebay':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <History className="h-8 w-8" />
          <span>Translation History</span>
        </h1>
        <p className="text-gray-600">View all your past translations and their results</p>
      </div>

      {translations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No translations yet</h3>
          <p className="text-gray-600 mb-4">Start translating to see your history here</p>
          <a
            href="/translate"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Start Translating
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {translations.map((translation) => (
            <div key={translation.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(
                      translation.platform
                    )}`}
                  >
                    <ShoppingBag className="h-3 w-3 mr-1" />
                    {translation.platform.charAt(0).toUpperCase() + translation.platform.slice(1)}
                  </span>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(translation.created_at)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {translation.cost === 0 ? 'Free' : `¥${translation.cost.toFixed(2)}`}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Chinese Text</h4>
                  <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-900">
                    {translation.chinese_text}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">English Translation</h4>
                  <div className="bg-blue-50 rounded-md p-3 text-sm text-gray-900">
                    {translation.english_text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
