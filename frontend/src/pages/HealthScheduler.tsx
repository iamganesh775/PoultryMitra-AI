import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { getVaccinationSchedule, createVaccinationSchedule, updateVaccinationStatus } from '../services/api';
import { VaccinationSchedule } from '../types';

const HealthScheduler = () => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState<VaccinationSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vaccineName: '',
    dueDate: '',
    birdCount: 0,
    notes: '',
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await getVaccinationSchedule();
      setSchedules(data.schedules);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVaccinationSchedule(formData);
      setShowForm(false);
      setFormData({ vaccineName: '', dueDate: '', birdCount: 0, notes: '' });
      loadSchedules();
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateVaccinationStatus(id, status);
      loadSchedules();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">{t('nav.healthScheduler')}</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="h-5 w-5 inline mr-2" />
          Add Schedule
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Add Vaccination Schedule</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vaccine Name
                </label>
                <input
                  type="text"
                  value={formData.vaccineName}
                  onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Birds
              </label>
              <input
                type="number"
                value={formData.birdCount}
                onChange={(e) => setFormData({ ...formData, birdCount: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary-600" />
                <h3 className="font-semibold">{schedule.vaccineName}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(schedule.status)}`}>
                {schedule.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>Due: {schedule.dueDate}</p>
              <p>Birds: {schedule.birdCount}</p>
              {schedule.notes && <p className="text-xs">{schedule.notes}</p>}
            </div>

            {schedule.status === 'pending' && (
              <button
                onClick={() => handleStatusUpdate(schedule.id, 'completed')}
                className="mt-4 w-full btn-primary text-sm py-2"
              >
                <CheckCircle className="h-4 w-4 inline mr-2" />
                Mark Complete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthScheduler;
