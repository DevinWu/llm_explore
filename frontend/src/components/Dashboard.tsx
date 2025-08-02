import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Languages, History, CreditCard, Gift } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const freeTranslationsLeft = Math.max(0, 10 - user.free_translations_used);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">欢迎回来！</h1>
        <p className="text-gray-600">管理您的翻译和账户</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">账户余额</p>
              <p className="text-2xl font-bold text-green-600">¥{user.balance.toFixed(2)}</p>
            </div>
            <CreditCard className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">剩余免费翻译次数</p>
              <p className="text-2xl font-bold text-blue-600">{freeTranslationsLeft}</p>
            </div>
            <Gift className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总翻译次数</p>
              <p className="text-2xl font-bold text-purple-600">{user.free_translations_used}</p>
            </div>
            <Languages className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/translate"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
        >
          <div className="flex items-center space-x-4">
            <Languages className="h-12 w-12 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">开始翻译</h3>
              <p className="text-gray-600">将中文产品描述翻译成英文</p>
            </div>
          </div>
        </Link>

        <Link
          to="/history"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500"
        >
          <div className="flex items-center space-x-4">
            <History className="h-12 w-12 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">翻译历史</h3>
              <p className="text-gray-600">查看您过去的翻译和结果</p>
            </div>
          </div>
        </Link>

        <Link
          to="/topup"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-purple-500"
        >
          <div className="flex items-center space-x-4">
            <CreditCard className="h-12 w-12 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">充值余额</h3>
              <p className="text-gray-600">为您的账户充值以获得更多翻译</p>
            </div>
          </div>
        </Link>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center space-x-4">
            <Gift className="h-12 w-12 text-yellow-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">价格信息</h3>
              <p className="text-gray-600">前10次翻译免费，之后每次¥1.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
