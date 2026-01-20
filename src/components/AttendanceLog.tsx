import { motion } from 'framer-motion';
import { Clock, UserCheck, TrendingUp } from 'lucide-react';
import { AttendanceRecord } from '@/types/attendance';
import { format, isToday, isYesterday } from 'date-fns';

interface AttendanceLogProps {
  records: AttendanceRecord[];
  maxItems?: number;
}

export const AttendanceLog = ({ records, maxItems = 10 }: AttendanceLogProps) => {
  const displayedRecords = records.slice(0, maxItems);

  const formatDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success';
    if (confidence >= 0.6) return 'text-warning';
    return 'text-destructive';
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No attendance records yet</p>
        <p className="text-sm">Records will appear here when employees check in</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayedRecords.map((record, index) => (
        <motion.div
          key={record.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{record.employeeName}</p>
            <p className="text-sm text-muted-foreground">
              {record.type === 'check-in' ? 'Checked in' : 'Checked out'}
            </p>
          </div>
          
          <div className="text-right shrink-0">
            <p className="text-sm font-medium">
              {formatDate(record.timestamp)}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(record.timestamp, 'h:mm a')}
            </p>
          </div>
          
          <div className="shrink-0 flex items-center gap-1">
            <TrendingUp className={`w-4 h-4 ${getConfidenceColor(record.confidence)}`} />
            <span className={`text-sm font-medium ${getConfidenceColor(record.confidence)}`}>
              {Math.round(record.confidence * 100)}%
            </span>
          </div>
        </motion.div>
      ))}
      
      {records.length > maxItems && (
        <p className="text-center text-sm text-muted-foreground pt-2">
          Showing {maxItems} of {records.length} records
        </p>
      )}
    </div>
  );
};
