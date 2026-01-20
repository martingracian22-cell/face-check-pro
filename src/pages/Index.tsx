import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, CheckCircle, Camera, Shield } from 'lucide-react';
import { CameraFeed } from '@/components/CameraFeed';
import { RegisterEmployee } from '@/components/RegisterEmployee';
import { AttendanceLog } from '@/components/AttendanceLog';
import { EmployeeList } from '@/components/EmployeeList';
import { StatsCard } from '@/components/StatsCard';
import { EthicsPanel } from '@/components/EthicsPanel';
import { useAttendance } from '@/hooks/useAttendance';
import { RecognitionResult } from '@/types/attendance';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Index = () => {
  const [activeTab, setActiveTab] = useState('recognition');
  const [lastRecognition, setLastRecognition] = useState<Date | null>(null);
  
  const {
    employees,
    attendanceRecords,
    registerEmployee,
    removeEmployee,
    markAttendance,
    getTodayRecords,
    getEmployeeLastRecord,
  } = useAttendance();

  const todayRecords = getTodayRecords();
  const uniqueCheckIns = new Set(todayRecords.map(r => r.employeeId)).size;

  const handleRecognition = useCallback((result: RecognitionResult) => {
    if (!result.detected || !result.employee) return;

    // Prevent duplicate check-ins within 30 seconds
    const lastRecord = getEmployeeLastRecord(result.employee.id);
    if (lastRecord && Date.now() - lastRecord.timestamp.getTime() < 30000) {
      return;
    }

    // Prevent duplicate toasts within 5 seconds
    if (lastRecognition && Date.now() - lastRecognition.getTime() < 5000) {
      return;
    }

    markAttendance(result.employee.id, result.employee.name, result.confidence, 'check-in');
    setLastRecognition(new Date());
    
    toast.success(`Welcome, ${result.employee.name}!`, {
      description: `Attendance marked at ${new Date().toLocaleTimeString()}`,
    });
  }, [markAttendance, getEmployeeLastRecord, lastRecognition]);

  const handleRegister = useCallback((
    name: string,
    department: string,
    descriptor: Float32Array | null,
    photoUrl: string
  ) => {
    registerEmployee(name, department, descriptor, photoUrl);
    toast.success('Employee registered successfully!', {
      description: `${name} can now check in using face recognition`,
    });
  }, [registerEmployee]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
              >
                <Camera className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold">FaceAttend</h1>
                <p className="text-xs text-muted-foreground">Smart Attendance System</p>
              </div>
            </div>
            <RegisterEmployee onRegister={handleRegister} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          <StatsCard
            title="Total Employees"
            value={employees.length}
            subtitle="Registered in system"
            icon={Users}
            variant="primary"
          />
          <StatsCard
            title="Present Today"
            value={uniqueCheckIns}
            subtitle={`of ${employees.length} employees`}
            icon={CheckCircle}
            variant="success"
          />
          <StatsCard
            title="Today's Check-ins"
            value={todayRecords.length}
            subtitle="Total records"
            icon={Clock}
            variant="default"
          />
          <StatsCard
            title="Recognition Rate"
            value={employees.length > 0 ? "98%" : "N/A"}
            subtitle="Average accuracy"
            icon={Camera}
            variant="default"
          />
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="recognition" className="gap-2">
              <Camera className="w-4 h-4" />
              Recognition
            </TabsTrigger>
            <TabsTrigger value="employees" className="gap-2">
              <Users className="w-4 h-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="records" className="gap-2">
              <Clock className="w-4 h-4" />
              Records
            </TabsTrigger>
            <TabsTrigger value="ethics" className="gap-2">
              <Shield className="w-4 h-4" />
              Ethics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recognition" className="mt-6">
            <div className="grid gap-8 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-card border border-border p-6"
                >
                  <h2 className="text-lg font-semibold mb-4">Live Recognition</h2>
                  <CameraFeed
                    employees={employees}
                    mode="recognition"
                    onRecognition={handleRecognition}
                  />
                  {employees.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 p-4 rounded-xl bg-warning/10 border border-warning/30 text-center"
                    >
                      <p className="text-sm text-warning">
                        No employees registered yet. Register employees to enable face recognition.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </div>
              
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-2xl bg-card border border-border p-6 h-full"
                >
                  <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                  <AttendanceLog records={attendanceRecords} maxItems={5} />
                </motion.div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="employees" className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl bg-card border border-border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Registered Employees</h2>
                <span className="text-sm text-muted-foreground">
                  {employees.length} total
                </span>
              </div>
              <EmployeeList employees={employees} onRemove={removeEmployee} />
            </motion.div>
          </TabsContent>

          <TabsContent value="records" className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl bg-card border border-border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Attendance History</h2>
                <span className="text-sm text-muted-foreground">
                  {attendanceRecords.length} records
                </span>
              </div>
              <AttendanceLog records={attendanceRecords} maxItems={20} />
            </motion.div>
          </TabsContent>

          <TabsContent value="ethics" className="mt-6">
            <EthicsPanel />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>FaceAttend • Face Recognition Attendance System</p>
          <p className="mt-1">
            Built with face-api.js • Runs entirely in your browser
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
