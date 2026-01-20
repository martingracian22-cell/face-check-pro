import { motion } from 'framer-motion';
import { Shield, Eye, Lock, FileWarning, Users, AlertTriangle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const EthicsPanel = () => {
  const considerations = [
    {
      id: 'consent',
      icon: Users,
      title: 'Informed Consent',
      content: `All employees must be fully informed about the face recognition system and provide explicit consent before enrollment. They should understand:
      • What biometric data is collected
      • How it will be used and stored
      • Their right to withdraw consent at any time
      • Alternative attendance options if they decline`,
      severity: 'high',
    },
    {
      id: 'privacy',
      icon: Eye,
      title: 'Privacy & Data Minimization',
      content: `Only collect the minimum data necessary:
      • Face descriptors (mathematical representations) are stored, not actual photos in production
      • Data should be encrypted at rest and in transit
      • Access should be limited to authorized personnel only
      • Regular audits should verify data handling practices`,
      severity: 'high',
    },
    {
      id: 'security',
      icon: Lock,
      title: 'Data Security',
      content: `Biometric data requires the highest security standards:
      • Use industry-standard encryption (AES-256 or better)
      • Implement multi-factor authentication for admin access
      • Regular security audits and penetration testing
      • Incident response plan for potential breaches
      • Secure deletion protocols when data is no longer needed`,
      severity: 'high',
    },
    {
      id: 'bias',
      icon: AlertTriangle,
      title: 'Algorithmic Bias',
      content: `Face recognition systems can have varying accuracy across demographics:
      • Test the system across diverse populations
      • Monitor for disparate error rates
      • Have fallback manual processes for verification failures
      • Regularly update and evaluate model performance
      • Consider third-party bias audits`,
      severity: 'medium',
    },
    {
      id: 'retention',
      icon: FileWarning,
      title: 'Data Retention',
      content: `Establish clear data lifecycle policies:
      • Define maximum retention periods
      • Delete data when employees leave the organization
      • Regular purging of old attendance records
      • Right to erasure compliance (GDPR, CCPA, etc.)
      • Transparent retention policies available to employees`,
      severity: 'medium',
    },
    {
      id: 'legal',
      icon: Shield,
      title: 'Legal Compliance',
      content: `Ensure compliance with applicable regulations:
      • GDPR (EU) - Special category data protections
      • BIPA (Illinois) - Biometric Information Privacy Act
      • CCPA (California) - Consumer privacy rights
      • Industry-specific regulations (HIPAA, SOX, etc.)
      • Consult legal counsel before deployment`,
      severity: 'high',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-l-destructive';
      case 'medium':
        return 'border-l-warning';
      default:
        return 'border-l-primary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border overflow-hidden"
    >
      <div className="p-6 border-b border-border bg-destructive/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Ethical Considerations</h2>
            <p className="text-sm text-muted-foreground">
              Important guidelines for responsible use of face recognition
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Accordion type="single" collapsible className="space-y-2">
          {considerations.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className={`border-l-4 ${getSeverityColor(item.severity)} bg-muted/30 rounded-lg border px-4`}
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-foreground/70" />
                  <span className="font-medium">{item.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">
                  {item.content}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="p-4 bg-muted/50 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          ⚠️ This is a demonstration system. Production deployments require comprehensive 
          security audits, legal review, and compliance verification.
        </p>
      </div>
    </motion.div>
  );
};
