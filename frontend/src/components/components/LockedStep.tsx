'use client';

import { useState } from 'react';
import { Lock, ChevronDown, ChevronUp, Check, Play } from 'lucide-react';

interface LockedStepProps {
  stepNumber: string;
  title: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  videoUrl?: string;
  onComplete: () => void;
  children: React.ReactNode;
}

export default function LockedStep({ 
  stepNumber, 
  title, 
  isUnlocked, 
  isCompleted,
  videoUrl,
  onComplete,
  children 
}: LockedStepProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleHeaderClick = () => {
    if (isUnlocked) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`relative border-2 rounded-xl mb-8 transition-all ${
      isCompleted ? 'border-green-500/50 bg-green-500/5' : 
      isUnlocked ? 'border-primary-500/30' : 'border-gray-700/30'
    }`}>
      {/* Step Header - Clickable */}
      <div 
        onClick={handleHeaderClick}
        className={`flex items-center justify-between p-6 ${
          isUnlocked ? 'cursor-pointer hover:bg-primary-500/5' : 'cursor-not-allowed'
        } transition-colors rounded-t-xl`}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
            isCompleted ? 'bg-green-500' : 
            isUnlocked ? 'bg-primary-500' : 'bg-gray-700'
          }`}>
            {isCompleted ? <Check className="w-6 h-6" /> : stepNumber}
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">{title}</h3>
            {isCompleted && (
              <span className="text-green-400 text-sm">✓ Completed</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {!isUnlocked && (
            <div className="flex items-center space-x-2 text-yellow-400">
              <Lock className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Locked</span>
            </div>
          )}
          {isUnlocked && (
            <div className="text-gray-400">
              {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && isUnlocked && (
        <div className="px-6 pb-6 border-t border-primary-900/30">
          {/* Video Tutorial */}
          {videoUrl && (
            <div className="mb-6 mt-6">
              <div className="flex items-center space-x-2 mb-3">
                <Play className="w-5 h-5 text-primary-400" />
                <h4 className="text-lg font-semibold text-white">Video Tutorial</h4>
              </div>
              <div className="aspect-video rounded-lg overflow-hidden bg-dark-400">
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Lessons Content */}
          <div className="mb-6">
            {children}
          </div>

          {/* Mark as Complete Button */}
          {!isCompleted && (
            <div className="flex justify-center pt-4 border-t border-primary-900/30">
              <button
                onClick={onComplete}
                className="btn-primary px-8 py-3 text-lg font-semibold"
              >
                Mark as Complete & Continue
              </button>
            </div>
          )}

          {isCompleted && (
            <div className="flex justify-center pt-4 border-t border-green-500/30">
              <div className="text-green-400 font-semibold flex items-center space-x-2">
                <Check className="w-5 h-5" />
                <span>Step Completed! Continue to the next step.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overlay for locked content */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl pointer-events-none">
          <div className="text-center px-6">
            <Lock className="w-16 h-16 text-gray-500 mx-auto mb-3" />
            <p className="text-white font-semibold text-lg">Complete Previous Step First</p>
            <p className="text-gray-300 text-sm mt-2">Finish the previous step to unlock this one</p>
          </div>
        </div>
      )}
    </div>
  );
}
