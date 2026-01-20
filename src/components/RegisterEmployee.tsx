import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, CheckCircle, AlertCircle } from 'lucide-react';
import { CameraFeed } from './CameraFeed';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface RegisterEmployeeProps {
  onRegister: (name: string, department: string, descriptor: Float32Array | null, photoUrl: string) => void;
}

export const RegisterEmployee = ({ onRegister }: RegisterEmployeeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'capture' | 'success'>('form');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedDescriptor, setCapturedDescriptor] = useState<Float32Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = (imageData: string, descriptor: Float32Array | null) => {
    if (!descriptor) {
      setError('No face detected. Please ensure your face is clearly visible.');
      return;
    }
    setCapturedImage(imageData);
    setCapturedDescriptor(descriptor);
    setError(null);
  };

  const handleSubmit = () => {
    if (!name.trim() || !department.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!capturedImage || !capturedDescriptor) {
      setError('Please capture your face first');
      return;
    }

    onRegister(name.trim(), department.trim(), capturedDescriptor, capturedImage);
    setStep('success');
    
    setTimeout(() => {
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setName('');
    setDepartment('');
    setCapturedImage(null);
    setCapturedDescriptor(null);
    setError(null);
    setStep('form');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Register Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Register New Employee</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter employee name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g., Engineering, HR, Sales"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep('capture')}
                  disabled={!name.trim() || !department.trim()}
                >
                  Next: Capture Face
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'capture' && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <p className="text-muted-foreground text-center">
                Position your face in the camera and click "Capture Face"
              </p>

              <CameraFeed
                employees={[]}
                mode="registration"
                onRecognition={() => {}}
                onCapture={handleCapture}
              />

              {capturedImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-4 p-4 bg-success/10 rounded-lg border border-success/30"
                >
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-success">Face captured successfully!</p>
                    <p className="text-sm text-muted-foreground">
                      Ready to register {name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setCapturedImage(null);
                      setCapturedDescriptor(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm justify-center">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('form')}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!capturedImage || !capturedDescriptor}
                >
                  Complete Registration
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-success" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Registration Complete!</h3>
              <p className="text-muted-foreground">
                {name} has been successfully registered
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
