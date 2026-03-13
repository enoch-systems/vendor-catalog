'use client';

import React, { useState } from 'react';
import { Bot, X, Sparkles } from 'lucide-react';
import { Product } from '@/lib/products';
import { descriptionTemplates } from './descriptionTemplates';

interface AutoDescriptionProps {
  product: Partial<Product>;
  onGenerate: (description: string) => void;
  onClose: () => void;
}

const AutoDescriptionModal: React.FC<AutoDescriptionProps> = ({ product, onGenerate, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedLength, setSelectedLength] = useState('medium');

  const tones = [
    { id: 'professional', name: 'Professional', description: 'Formal and business-focused' },
    { id: 'casual', name: 'Casual', description: 'Friendly and conversational' },
    { id: 'persuasive', name: 'Persuasive', description: 'Compelling and sales-oriented' },
    { id: 'technical', name: 'Technical', description: 'Detailed and feature-focused' }
  ];

  const lengths = [
    { id: 'short', name: 'Short', description: '2-3 sentences' },
    { id: 'medium', name: 'Medium', description: '1 paragraph' },
    { id: 'long', name: 'Long', description: '2-3 paragraphs' }
  ];

  const generateDescription = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const productName = product.name || 'product';
      const randomTemplate = descriptionTemplates[Math.floor(Math.random() * descriptionTemplates.length)];
      const description = randomTemplate.replace('{productName}', productName);
      
      setIsGenerating(false);
      onGenerate(description);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="text-blue-500" size={20} />
            <h2 className="text-xl font-semibold text-white">AI Description Generator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">
              Tone of Voice
            </label>
            <div className="grid grid-cols-2 gap-3">
              {tones.map(tone => (
                <button
                  key={tone.id}
                  type="button"
                  className={`p-3 rounded-lg border transition-colors text-left ${
                    selectedTone === tone.id
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedTone(tone.id)}
                >
                  <div className="font-medium text-sm">{tone.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{tone.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">
              Description Length
            </label>
            <div className="grid grid-cols-3 gap-3">
              {lengths.map(length => (
                <button
                  key={length.id}
                  type="button"
                  className={`p-3 rounded-lg border transition-colors text-left ${
                    selectedLength === length.id
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedLength(length.id)}
                >
                  <div className="font-medium text-sm">{length.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{length.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={generateDescription}
              disabled={isGenerating}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="animate-spin" size={16} />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Description
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoDescriptionModal;
