/**
 * TypeScript mirror of FNOLState from the Python backend.
 * Kept in sync with /backend/graph/state.py
 */

export type PipelineStage =
  | "intake"
  | "document"
  | "policy"
  | "damage"
  | "fraud"
  | "triage"
  | "stp"
  | "comms"
  | "complete"
  | "human_review";

export type DamageSeverity = "minor" | "moderate" | "severe" | "total_loss" | "unknown";

export type PaymentStatus = "pending" | "approved" | "processing" | "paid" | "rejected" | "";

export type AdjusterDecision = "approve" | "escalate" | "reject" | "";

export interface FNOLState {
  // Pipeline
  pipeline_stage: PipelineStage;

  // Claim identity
  claim_id: string;
  claimant_name: string;
  claimant_phone: string;
  claimant_email: string;
  incident_date: string;
  incident_location: string;
  vehicle_vin: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  damage_description: string;

  // Policy
  policy_number: string;
  policy_valid: boolean;
  policy_coverage_type: string;
  policy_deductible: number;
  policy_limit: number;

  // Documents
  documents_received: string[];
  documents_missing: string[];
  documents_processed: boolean;

  // Damage
  damage_severity: DamageSeverity;
  estimated_cost: number;
  damage_image_urls: string[];

  // Fraud
  fraud_score: number;
  fraud_flags: string[];
  fraud_review_required: boolean;

  // Triage
  stp_eligible: boolean;
  triage_notes: string;

  // Human review
  human_review_requested: boolean;
  adjuster_id: string | null;
  adjuster_notes: string;
  adjuster_decision: AdjusterDecision;

  // Payment
  payment_amount: number;
  payment_status: PaymentStatus;

  // Communications
  notifications_sent: string[];
  last_notification: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  "intake",
  "document",
  "policy",
  "damage",
  "fraud",
  "triage",
  "stp",
  "comms",
  "complete",
];

export const STAGE_LABELS: Record<PipelineStage, string> = {
  intake: "Intake",
  document: "Documents",
  policy: "Policy Check",
  damage: "Damage Assessment",
  fraud: "Fraud Analysis",
  triage: "Triage",
  stp: "Auto-Settlement",
  comms: "Communications",
  complete: "Complete",
  human_review: "Adjuster Review",
};
