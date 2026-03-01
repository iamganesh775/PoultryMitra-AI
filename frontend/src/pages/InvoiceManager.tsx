import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { getInvoices, createInvoice, deleteInvoice } from '../services/api';
import { Invoice } from '../types';

const InvoiceManager = () => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await getInvoices();
      setInvoices(data.invoices);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInvoice(formData);
      setShowForm(false);
      setFormData({
        type: 'income',
        category: '',
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      loadInvoices();
    } catch (error) {
      console.error('Failed to create invoice:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInvoice(id);
      loadInvoices();
    } catch (error) {
      console.error('Failed to delete invoice:', error);
    }
  };

  const totalIncome = invoices
    .filter((inv) => inv.type === 'income')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalExpense = invoices
    .filter((inv) => inv.type === 'expense')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">{t('nav.invoices')}</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="h-5 w-5 inline mr-2" />
          Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-green-50">
          <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
          <p className="text-sm text-gray-600">Total Income</p>
          <p className="text-2xl font-bold text-green-700">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="card bg-red-50">
          <TrendingDown className="h-8 w-8 text-red-600 mb-2" />
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-2xl font-bold text-red-700">${totalExpense.toFixed(2)}</p>
        </div>
        <div className="card bg-blue-50">
          <p className="text-sm text-gray-600">Net Profit</p>
          <p className="text-2xl font-bold text-blue-700">
            ${(totalIncome - totalExpense).toFixed(2)}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Add Transaction</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {invoice.type === 'income' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">{invoice.category}</span>
                </div>
                <p className="text-sm text-gray-600">{invoice.description}</p>
                <p className="text-xs text-gray-500">{invoice.date}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`text-lg font-bold ${
                    invoice.type === 'income' ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {invoice.type === 'income' ? '+' : '-'}${invoice.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleDelete(invoice.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvoiceManager;
