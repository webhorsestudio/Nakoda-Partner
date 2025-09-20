import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import StarRating from '@/components/ui/star-rating';
import { toast } from 'react-hot-toast';

interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { customerRating: number; image: File | null }) => void;
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
  const [customerRating, setCustomerRating] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ customerRating?: string; image?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        toast.error('Please select a valid image file', {
          duration: 3000,
          icon: '❌',
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        toast.error('Image size must be less than 5MB', {
          duration: 3000,
          icon: '❌',
        });
        return;
      }

      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: undefined }));
      
      toast.success('Image selected successfully', {
        duration: 2000,
        icon: '✅',
      });
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
    const newErrors: { customerRating?: string; image?: string } = {};

    // Validate customer rating
    if (customerRating === 0) {
      newErrors.customerRating = 'Please rate the customer';
    }

    // Validate image
    if (!selectedImage) {
      newErrors.image = 'Task image is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({ customerRating, image: selectedImage });
    }
  };

  const handleClose = () => {
    setCustomerRating(0);
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

          {/* Customer Rating Section */}
          <div className="space-y-2 sm:space-y-3">
            <label className="block text-sm sm:text-base font-medium text-gray-700">
              Rate the Customer <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col items-center space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <StarRating
                value={customerRating}
                onChange={(rating) => {
                  setCustomerRating(rating);
                  if (errors.customerRating) {
                    setErrors(prev => ({ ...prev, customerRating: undefined }));
                  }
                  
                  // Show rating feedback
                  const ratingMessages = {
                    1: 'Poor - Very dissatisfied',
                    2: 'Fair - Somewhat dissatisfied',
                    3: 'Good - Satisfied',
                    4: 'Very Good - Very satisfied',
                    5: 'Excellent - Extremely satisfied'
                  };
                  
                  toast.success(`Rated ${rating} star${rating !== 1 ? 's' : ''}: ${ratingMessages[rating as keyof typeof ratingMessages]}`, {
                    duration: 2000,
                    icon: '⭐',
                  });
                }}
                size="lg"
                className="mb-2"
              />
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {customerRating === 0 && "Click on a star to rate"}
                  {customerRating === 1 && "Poor - Very dissatisfied"}
                  {customerRating === 2 && "Fair - Somewhat dissatisfied"}
                  {customerRating === 3 && "Good - Satisfied"}
                  {customerRating === 4 && "Very Good - Very satisfied"}
                  {customerRating === 5 && "Excellent - Extremely satisfied"}
                </p>
                {customerRating > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {customerRating} star{customerRating !== 1 ? 's' : ''} rating
                  </p>
                )}
              </div>
            </div>
            {errors.customerRating && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4" />
                {errors.customerRating}
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
              disabled={isLoading || !!errors.customerRating || !!errors.image || customerRating === 0 || !selectedImage}
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
