import React, { useState } from 'react';
import { saveBean, setOnboardingStatus } from '../utils/storage';

const AddBeanModal = ({ onClose, onSave, bean = null, isOnboarding = false }) => {
  const [formData, setFormData] = useState({
    name: bean?.name || '',
    origin: bean?.origin || '',
    roastLevel: bean?.roastLevel || 'medium',
    notes: bean?.notes || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSaving(true);
      const beanData = {
        ...formData,
        ...(bean && { id: bean.id })
      };
      const saved = await saveBean(beanData);
      onSave(saved);
    } catch (error) {
      console.error('Error saving bean:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-coffee-900">
            {bean ? 'Edit Bean' : 'Add New Bean'}
          </h2>
          <button
            onClick={() => {
              if (isOnboarding) {
                setOnboardingStatus('skipped');
              }
              onClose();
            }}
            className="text-coffee-400 hover:text-coffee-600 text-3xl font-light leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-base font-medium text-coffee-700 mb-2">
              Bean Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Ethiopian Yirgacheffe"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-base font-medium text-coffee-700 mb-2">
              Origin
            </label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => handleChange('origin', e.target.value)}
              placeholder="e.g., Ethiopia, Colombia"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-coffee-700 mb-2">
              Roast Level
            </label>
            <select
              value={formData.roastLevel}
              onChange={(e) => handleChange('roastLevel', e.target.value)}
              className="input-field"
            >
              <option value="light">Light</option>
              <option value="medium-light">Medium Light</option>
              <option value="medium">Medium</option>
              <option value="medium-dark">Medium Dark</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-medium text-coffee-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Tasting notes, processing method, etc."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                if (isOnboarding) {
                  setOnboardingStatus('skipped');
                }
                onClose();
              }}
              className="flex-1 btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.name.trim()}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : (bean ? 'Update' : 'Add Bean')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBeanModal;
