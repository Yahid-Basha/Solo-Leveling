import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Award, AlertCircle } from 'lucide-react';
import { Task } from '../../types';
import ConfettiEffect from '../UI/ConfettiEffect';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onVerify: (taskId: string, proofImage: File | string) => Promise<{ verified: boolean; points: number }>;
  onRetry: (taskId: string, proofImage: File | string, notes: string) => Promise<{ verified: boolean; points: number }>;
  retryChances: number;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ 
  isOpen, 
  onClose, 
  task,
  onVerify,
  onRetry,
  retryChances
}) => {
  const [step, setStep] = useState<'initial' | 'result' | 'retry'>('initial');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ verified: boolean; points: number } | null>(null);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  if (!isOpen || !task) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!proofImage && !previewUrl) {
      setError('Please upload proof of completion');
      return;
    }
    
    setLoading(true);
    try {
      // Use a placeholder image URL for demo
      const placeholderImage = previewUrl || 'https://images.pexels.com/photos/5611966/pexels-photo-5611966.jpeg';
      
      const verificationResult = await onVerify(task.id, placeholderImage);
      setResult(verificationResult);
      setStep('result');
      
      if (verificationResult.verified) {
        setShowConfetti(true);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!proofImage && !previewUrl) {
      setError('Please upload proof of completion');
      return;
    }
    
    if (retryChances <= 0) {
      setError('No retry chances left');
      return;
    }
    
    setLoading(true);
    try {
      // Use a placeholder image URL for demo
      const placeholderImage = previewUrl || 'https://images.pexels.com/photos/3243090/pexels-photo-3243090.jpeg';
      
      const retryResult = await onRetry(task.id, placeholderImage, additionalNotes);
      setResult(retryResult);
      setStep('result');
      
      if (retryResult.verified) {
        setShowConfetti(true);
      }
    } catch (err) {
      setError('Retry failed. Please try again.');
      console.error('Retry error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('initial');
    setProofImage(null);
    setPreviewUrl('');
    setAdditionalNotes('');
    setResult(null);
    setError('');
    setShowConfetti(false);
    onClose();
  };

  const handleRetry = () => {
    setStep('retry');
    setProofImage(null);
    setPreviewUrl('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto"
      onClick={resetModal}
    >
      <ConfettiEffect show={showConfetti} />
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white max-h-[90vh] w-full max-w-md rounded-2xl overflow-y-auto shadow-xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 'initial' ? 'Verify Task Completion' : 
               step === 'result' ? 'Verification Result' : 
               'Retry Verification'}
            </h2>
            <button
              onClick={resetModal}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {step === 'initial' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <p className="text-gray-700 mb-4">
                  <span className="font-medium text-gray-900">{task.title}</span> is marked as completed. 
                  Please upload proof of completion to earn points.
                </p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img 
                        src={previewUrl} 
                        alt="Proof preview" 
                        className="max-h-64 rounded-lg mx-auto object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setProofImage(null);
                          setPreviewUrl('');
                        }}
                        className="text-sm text-red-500 hover:text-red-600"
                      >
                        Remove image
                      </button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-2">
                        Upload a screenshot or photo as proof
                      </p>
                      <input
                        type="file"
                        id="proof"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="proof"
                        className="inline-block px-4 py-2 bg-[#f5f5f7] text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        Select Image
                      </label>
                    </div>
                  )}
                </div>
              </div>
              
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={resetModal}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-[#0071e3] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-70"
                >
                  {loading ? 'Verifying...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          )}
          
          {step === 'result' && result && (
            <div className="space-y-6">
              <div className="text-center py-6">
                {result.verified ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Award className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Verification Successful!</h3>
                    <p className="text-gray-600">
                      Congratulations! You've earned <span className="font-semibold text-[#0071e3]">{result.points} points</span> for completing this task.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Verification Failed</h3>
                    <p className="text-gray-600">
                      We couldn't verify your task completion. Please try again with clearer proof.
                    </p>
                  </div>
                )}
              </div>
              
              {result.verified && (
                <div className="bg-[#f5f5f7] rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Feel like you deserved more points? You have {retryChances} retry chances left this quarter.
                  </p>
                  
                  {retryChances > 0 ? (
                    <button
                      onClick={handleRetry}
                      className="w-full text-[#0071e3] text-sm font-medium hover:underline"
                    >
                      Retry for more points
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500">
                      You've used all your retry chances for this quarter.
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex">
                <button
                  onClick={resetModal}
                  className="w-full py-3 px-4 bg-[#0071e3] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
          
          {step === 'retry' && (
            <form onSubmit={handleRetrySubmit} className="space-y-5">
              <div>
                <p className="text-gray-700 mb-4">
                  You're using 1 of your {retryChances} retry chances. Upload better proof and add supporting information to earn more points.
                </p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center mb-4">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img 
                        src={previewUrl} 
                        alt="Proof preview" 
                        className="max-h-64 rounded-lg mx-auto object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setProofImage(null);
                          setPreviewUrl('');
                        }}
                        className="text-sm text-red-500 hover:text-red-600"
                      >
                        Remove image
                      </button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-2">
                        Upload a better screenshot or photo as proof
                      </p>
                      <input
                        type="file"
                        id="retry-proof"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="retry-proof"
                        className="inline-block px-4 py-2 bg-[#f5f5f7] text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        Select Image
                      </label>
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="additional-notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Supporting Information
                  </label>
                  <textarea
                    id="additional-notes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Explain why you deserve more points for this task"
                  ></textarea>
                </div>
              </div>
              
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('result')}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-[#0071e3] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-70"
                >
                  {loading ? 'Submitting...' : 'Submit Retry'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VerificationModal;