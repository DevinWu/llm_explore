import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Languages, ArrowRight, ShoppingBag } from 'lucide-react';

export default function TranslationPage() {
  const [platform, setPlatform] = useState('amazon');
  const [chineseText, setChineseText] = useState('');
  const [englishText, setEnglishText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useAuth();

  const handleTranslate = async () => {
    if (!chineseText.trim()) {
      toast.error('Please enter Chinese text to translate');
      return;
    }

    setLoading(true);
    try {
      const result = await api.translate(platform, chineseText);
      setEnglishText(result.english_text);
      await refreshUser();
      
      if (result.cost > 0) {
        toast.success(`Translation completed! Cost: ¥${result.cost.toFixed(2)}`);
      } else {
        toast.success('Free translation completed!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  const freeTranslationsLeft = user ? Math.max(0, 10 - user.free_translations_used) : 0;
  const willBeFree = freeTranslationsLeft > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Translate Product Description</h1>
        <p className="text-gray-600">Convert Chinese product descriptions to English for e-commerce platforms</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Platform
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setPlatform('amazon')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                platform === 'amazon'
                  ? 'bg-orange-100 border-orange-500 text-orange-700'
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ShoppingBag size={16} />
              <span>Amazon</span>
            </button>
            <button
              onClick={() => setPlatform('ebay')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                platform === 'ebay'
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ShoppingBag size={16} />
              <span>eBay</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chinese Product Description
            </label>
            <textarea
              value={chineseText}
              onChange={(e) => setChineseText(e.target.value)}
              placeholder="输入中文产品描述..."
              className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              English Translation
            </label>
            <textarea
              value={englishText}
              readOnly
              placeholder="English translation will appear here..."
              className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {willBeFree ? (
              <span className="text-green-600">
                Free translation ({freeTranslationsLeft} remaining)
              </span>
            ) : (
              <span className="text-orange-600">
                Cost: ¥1.00 (Balance: ¥{user?.balance.toFixed(2)})
              </span>
            )}
          </div>
          
          <button
            onClick={handleTranslate}
            disabled={loading || !chineseText.trim()}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Languages size={16} />
            <span>{loading ? 'Translating...' : 'Translate'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {!willBeFree && user && user.balance < 1 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Insufficient Balance
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You need at least ¥1.00 to perform paid translations. 
                  <a href="/topup" className="font-medium underline hover:text-yellow-600 ml-1">
                    Top up your account
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
