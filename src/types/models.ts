export type ItemCategory =
  | 'Electronics'
  | 'Clothing'
  | 'Bags'
  | 'Keys'
  | 'Wallet'
  | 'Documents'
  | 'Books'
  | 'Accessories'
  | 'Stationery'
  | 'Other';

export const ITEM_CATEGORIES: ItemCategory[] = [
  'Electronics',
  'Clothing',
  'Bags',
  'Keys',
  'Wallet',
  'Documents',
  'Books',
  'Accessories',
  'Stationery',
  'Other',
];

export const CAMPUS_LOCATIONS: string[] = [
  'Library',
  'Classroom',
  'Cafeteria',
  'Laboratory',
  'Auditorium',
  'Hallway',
  'Gym',
  'Parking area',
  'Other',
  'Not sure',
];

export type FoundItemStatus =
  | 'FOUND'
  | 'IN LOST & FOUND OFFICE'
  | 'MATCH FOUND'
  | 'CLAIM PENDING'
  | 'RETURNED'
  | 'EXPIRED';

export type LostReportStatus =
  | 'SEARCHING'
  | 'POSSIBLE MATCH'
  | 'MATCH CONFIRMED'
  | 'RETURNED'
  | 'CLOSED';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoUrl?: string;
  phone?: string;
  role: 'student' | 'admin';
  domainVerified?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface FoundItem {
  id: string;
  reporterId: string;
  title: string;
  category: ItemCategory | string;
  generalDescription: string;
  color: string;
  brand: string;
  model?: string;
  publicCharacteristics?: string;
  locationFound: string;
  dateFound: string;
  timeFound?: string;
  dateSubmittedToOffice?: string;
  status: FoundItemStatus;
  custodyState: 'STILL_WITH_FINDER' | 'AT_OFFICE';
  photoUrl?: string;
  verificationQuestion?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface FoundItemPrivate {
  itemId: string;
  secretCharacteristics: string;
  storageLocation: string;
  adminNotes: string;
  finderEmail?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface LostReport {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  title: string;
  category: ItemCategory | string;
  description: string;
  color: string;
  brand: string;
  model?: string;
  distinguishingCharacteristics?: string;
  locationLost: string;
  dateLost: string;
  photoUrl?: string;
  status: LostReportStatus;
  claimStatus?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface MatchRecord {
  id: string;
  lostReportId: string;
  foundItemId: string;
  studentId: string;
  overallScore: number;
  visualSimilarity?: number;
  textSimilarity?: number;
  locationSimilarity?: number;
  timeSimilarity?: number;
  confidenceLabel: string;
  explanationSummary: string;
  reasons: string[];
  verificationPrompt?: string;
  adminStatus: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  createdAt?: any;
  updatedAt?: any;
}

export interface ClaimRecord {
  id: string;
  lostReportId: string;
  foundItemId: string;
  matchId?: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  verificationQuestion: string;
  verificationAnswer: string;
  additionalProof?: string;
  suspiciousFlag?: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
  adminFeedback?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'MATCH_FOUND' | 'CLAIM_APPROVED' | 'CLAIM_REJECTED' | 'ITEM_RETURNED';
  relatedReportId?: string;
  relatedMatchId?: string;
  read: boolean;
  createdAt?: any;
  updatedAt?: any;
}
