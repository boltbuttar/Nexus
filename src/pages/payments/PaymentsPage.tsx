import React, { useEffect, useState } from 'react';
import { CreditCard, ArrowDownCircle, ArrowUpCircle, Send } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getTransactions, deposit, withdraw, transfer } from '../../api/payments';
import { getUsers } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [receivers, setReceivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [receiverId, setReceiverId] = useState('');

  const refreshTransactions = () => {
    return getTransactions()
      .then(({ transactions }) => setTransactions(transactions))
      .catch(() => toast.error('Failed to load transactions'));
  };

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    Promise.all([
      refreshTransactions(),
      getUsers(user.role === 'entrepreneur' ? 'investor' : 'entrepreneur')
    ])
      .then(([, userRes]) => {
        if (isMounted) {
          setReceivers(userRes.users);
        }
      })
      .catch(() => toast.error('Failed to load payment data'))
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleDeposit = async () => {
    const value = Number(amount);
    if (!value) {
      toast.error('Enter a valid amount');
      return;
    }
    await deposit(value).then(() => {
      setAmount('');
      refreshTransactions();
      toast.success('Deposit initiated');
    }).catch(() => toast.error('Deposit failed'));
  };

  const handleWithdraw = async () => {
    const value = Number(withdrawAmount);
    if (!value) {
      toast.error('Enter a valid amount');
      return;
    }
    await withdraw(value).then(() => {
      setWithdrawAmount('');
      refreshTransactions();
      toast.success('Withdrawal requested');
    }).catch(() => toast.error('Withdrawal failed'));
  };

  const handleTransfer = async () => {
    const value = Number(transferAmount);
    if (!value || !receiverId) {
      toast.error('Enter amount and receiver');
      return;
    }
    await transfer(value, receiverId).then(() => {
      setTransferAmount('');
      setReceiverId('');
      refreshTransactions();
      toast.success('Transfer completed');
    }).catch(() => toast.error('Transfer failed'));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600">Manage deposits, withdrawals, and transfers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex items-center gap-2">
            <ArrowDownCircle size={18} className="text-success-600" />
            <h2 className="text-lg font-medium text-gray-900">Deposit</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button onClick={handleDeposit} leftIcon={<CreditCard size={16} />}>
              Deposit
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <ArrowUpCircle size={18} className="text-warning-600" />
            <h2 className="text-lg font-medium text-gray-900">Withdraw</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Amount"
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <Button variant="outline" onClick={handleWithdraw}>
              Withdraw
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <Send size={18} className="text-primary-600" />
            <h2 className="text-lg font-medium text-gray-900">Transfer</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Amount"
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receiver</label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
              >
                <option value="">Select receiver</option>
                {receivers.map(receiver => (
                  <option key={receiver.id} value={receiver.id}>{receiver.name}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleTransfer} variant="primary">
              Transfer
            </Button>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
        </CardHeader>
        <CardBody>
          {transactions.length === 0 ? (
            <p className="text-gray-600">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                    <th className="py-2">Type</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map(txn => (
                    <tr key={txn.id}>
                      <td className="py-2 capitalize">{txn.type}</td>
                      <td className="py-2">{txn.amount} {txn.currency}</td>
                      <td className="py-2 capitalize">{txn.status}</td>
                      <td className="py-2">{new Date(txn.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
