import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { CreditCard, Smartphone, DollarSign } from 'lucide-react';

export default function TopUpPage() {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('alipay');
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useAuth();

  const predefinedAmounts = [10, 50, 100, 200, 500];

  const handleTopUp = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error('请输入有效金额');
      return;
    }

    setLoading(true);
    try {
      await api.topUp(numAmount, paymentMethod);
      toast.success(`成功充值 ¥${numAmount.toFixed(2)}！`);
      await refreshUser();
      setAmount('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '充值失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <CreditCard className="h-8 w-8" />
          <span>充值余额</span>
        </h1>
        <p className="text-gray-600">为您的账户充值以获得更多翻译</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-blue-900">当前余额</p>
              <p className="text-2xl font-bold text-blue-600">¥{user?.balance.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            选择金额
          </label>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {predefinedAmounts.map((preAmount) => (
              <button
                key={preAmount}
                onClick={() => setAmount(preAmount.toString())}
                className={`p-3 text-center rounded-md border ${
                  amount === preAmount.toString()
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                ¥{preAmount}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自定义金额
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">¥</span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            支付方式
          </label>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod('alipay')}
              className={`w-full flex items-center space-x-3 p-4 rounded-md border ${
                paymentMethod === 'alipay'
                  ? 'bg-blue-100 border-blue-500'
                  : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Smartphone className="h-6 w-6 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">支付宝</p>
                <p className="text-sm text-gray-600">使用支付宝支付</p>
              </div>
            </button>
            <button
              onClick={() => setPaymentMethod('wechat')}
              className={`w-full flex items-center space-x-3 p-4 rounded-md border ${
                paymentMethod === 'wechat'
                  ? 'bg-green-100 border-green-500'
                  : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Smartphone className="h-6 w-6 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">微信支付</p>
                <p className="text-sm text-gray-600">使用微信支付</p>
              </div>
            </button>
          </div>
        </div>

        <button
          onClick={handleTopUp}
          disabled={loading || !amount || parseFloat(amount) <= 0}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CreditCard size={16} />
          <span>{loading ? '处理中...' : `充值 ¥${amount || '0.00'}`}</span>
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">价格信息</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 前10次翻译完全免费</li>
          <li>• 之后每次翻译费用为¥1.00</li>
          <li>• 您的余额永不过期</li>
          <li>• 最低充值金额为¥1.00</li>
        </ul>
      </div>
    </div>
  );
}
