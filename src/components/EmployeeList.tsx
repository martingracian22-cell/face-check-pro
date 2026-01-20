import { motion } from 'framer-motion';
import { User, Trash2, Building2, Calendar } from 'lucide-react';
import { Employee } from '@/types/attendance';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface EmployeeListProps {
  employees: Employee[];
  onRemove: (id: string) => void;
}

export const EmployeeList = ({ employees, onRemove }: EmployeeListProps) => {
  if (employees.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No employees registered</p>
        <p className="text-sm">Register employees to enable face recognition</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {employees.map((employee, index) => (
        <motion.div
          key={employee.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="relative group p-4 rounded-xl bg-card border border-border hover:shadow-lg transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
              {employee.photoUrl ? (
                <img
                  src={employee.photoUrl}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{employee.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Building2 className="w-3 h-3" />
                <span className="truncate">{employee.department}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Calendar className="w-3 h-3" />
                <span>Registered {format(employee.registeredAt, 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Employee</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove {employee.name}? This will also delete all their attendance records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(employee.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Face registered indicator */}
          <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full ${employee.faceDescriptor ? 'bg-success' : 'bg-warning'}`} />
        </motion.div>
      ))}
    </div>
  );
};
