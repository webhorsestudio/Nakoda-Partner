import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { feedback: string; image: File | null }) => void;
  taskId: string;
  isLoading?: boolean;
}

export default function TaskCompletionModal({
  isOpen,
  onClose,
  onSubmit,
  taskId,
  isLoading = false
}: TaskCompletionModalProps) {
  console.log('TaskCompletionModal - Rendering with props:', { isOpen, taskId, isLoading });
  const [feedback, setFeedback] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ feedback?: string; image?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }

      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: undefined }));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors(prev => ({ ...prev, image: undefined }));
  };

  const handleSubmit = () => {
    const newErrors: { feedback?: string; image?: string } = {};

    // Validate feedback
    if (!feedback.trim()) {
      newErrors.feedback = 'Feedback is required';
    } else if (feedback.trim().length < 10) {
      newErrors.feedback = 'Feedback must be at least 10 characters';
    }

    // Validate image
    if (!selectedImage) {
      newErrors.image = 'Task image is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({ feedback: feedback.trim(), image: selectedImage });
    }
  };

  const handleClose = () => {
    setFeedback('');
    setSelectedImage(null);
    setImagePreview(null);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-0 sm:p-6">
        <DialogHeader className="px-4 pt-4 pb-2 sm:px-0 sm:pt-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            Complete Task #{taskId.slice(-4)}
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4 sm:px-0 space-y-4 sm:space-y-6">
          {/* Task ID Display */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Task ID</p>
                  <p className="text-sm sm:text-base font-mono text-gray-900">{taskId}</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  In Progress
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Section */}
          <div className="space-y-2 sm:space-y-3">
            <label htmlFor="feedback" className="block text-sm sm:text-base font-medium text-gray-700">
              Task Feedback <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                id="feedback"
                placeholder="Please provide detailed feedback about the completed task (minimum 10 characters)..."
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value);
                  if (errors.feedback) {
                    setErrors(prev => ({ ...prev, feedback: undefined }));
                  }
                }}
                className={cn(
                  "w-full min-h-[120px] sm:min-h-[140px] px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base",
                  errors.feedback && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {feedback.length}/10 min
              </div>
            </div>
            {errors.feedback && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4" />
                {errors.feedback}
              </div>
            )}
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2 sm:space-y-3">
            <label className="block text-sm sm:text-base font-medium text-gray-700">
              Task Completion Image <span className="text-red-500">*</span>
            </label>
            
            {!imagePreview ? (
              <Card 
                className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 group-hover:bg-blue-50 rounded-full flex items-center justify-center transition-colors">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base text-gray-600 font-medium">
                        <span className="text-blue-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Task completion preview"
                      className="w-full h-32 sm:h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {selectedImage?.name}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {errors.image && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4" />
                {errors.image}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-4 py-3 sm:px-0 sm:py-0 bg-gray-50 sm:bg-transparent border-t sm:border-t-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              disabled={isLoading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !!errors.feedback || !!errors.image || !feedback || !selectedImage}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Task
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
