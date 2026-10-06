import React, { useState, useEffect, useMemo } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleAuthProvider,
  handleFirestoreError,
  OperationType,
} from './lib/firebase';
import {
  UserProfile,
  FoundItem,
  FoundItemPrivate,
  LostReport,
  MatchRecord,
  ClaimRecord,
  NotificationRecord,
  FoundItemStatus,
} from './types/models';
import { INITIAL_DEMO_FOUND_ITEMS } from './data/demoSeed';
import { Navbar, ActiveView } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { ReportLostFlow, LostFormSubmission } from './components/ReportLostFlow';
import { ReportFoundFlow, FoundFormSubmission } from './components/ReportFoundFlow';
import { MatchResultsView } from './components/MatchResultsModal';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Shield, X, Phone, CheckCircle2, Lock } from 'lucide-react';

const BOOTSTRAPPED_ADMIN_EMAIL = 'haouchemelissa2007@gmail.com';

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [pendingActionView, setPendingActionView] = useState<ActiveView | null>(null);

  // Domain Data
  const [dbFoundItems, setDbFoundItems] = useState<FoundItem[]>([]);
  const [privateRecordsMap, setPrivateRecordsMap] = useState<Record<string, FoundItemPrivate>>({});
  const [myLostReports, setMyLostReports] = useState<LostReport[]>([]);
  const [allLostReports, setAllLostReports] = useState<LostReport[]>([]);
  const [myMatches, setMyMatches] = useState<MatchRecord[]>([]);
  const [allMatches, setAllMatches] = useState<MatchRecord[]>([]);
  const [myClaims, setMyClaims] = useState<ClaimRecord[]>([]);
  const [allClaims, setAllClaims] = useState<ClaimRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

  // Active report for MatchResultsView
  const [activeReportForMatches, setActiveReportForMatches] = useState<LostReport | null>(null);

  // Modals
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [directClaimItem, setDirectClaimItem] = useState<FoundItem | null>(null);
  const [directClaimAnswer, setDirectClaimAnswer] = useState('');
  const [directClaimProof, setDirectClaimProof] = useState('');
  const [directClaimDone, setDirectClaimDone] = useState(false);
  const [authBannerMsg, setAuthBannerMsg] = useState<string>('');

  const isAdmin = useMemo(() => {
    if (!userProfile) return false;
    return (
      userProfile.role === 'admin' ||
      userProfile.email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL
    );
  }, [userProfile]);

  // Combine demo items with live Firestore items so the platform is populated immediately even before sign-in
  const displayFoundItems = useMemo<FoundItem[]>(() => {
    if (dbFoundItems.length > 0) return dbFoundItems;
    return INITIAL_DEMO_FOUND_ITEMS.map((bundle) => ({
      ...bundle.publicItem,
      reporterId: 'esi_office_seed',
    }));
  }, [dbFoundItems]);

  const foundItemsMap = useMemo(() => {
    const map: Record<string, FoundItem> = {};
    for (const item of displayFoundItems) {
      map[item.id] = item;
    }
    return map;
  }, [displayFoundItems]);

  // 1. Auth State & User Profile Sync + Initial Demo Seed
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (!u) {
        setUserProfile(null);
        setAuthReady(true);
        return;
      }

      const email = (u.email || '').toLowerCase();
      const isEsiDomain = email.endsWith('@esi.dz');
      const isBootstrappedAdmin = email === BOOTSTRAPPED_ADMIN_EMAIL;

      const userRef = doc(db, 'users', u.uid);
      try {
        const snap = await getDoc(userRef);
        const determinedRole: 'student' | 'admin' = isBootstrappedAdmin ? 'admin' : 'student';

        if (!snap.exists()) {
          const newProfile: UserProfile = {
            uid: u.uid,
            name: (u.displayName || email.split('@')[0] || 'ESI Student').slice(0, 110),
            email: email.slice(0, 175),
            photoUrl: (u.photoURL || '').slice(0, 950),
            phone: '',
            role: determinedRole,
            domainVerified: isEsiDomain || isBootstrappedAdmin,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userRef, newProfile);
          setUserProfile(newProfile);
          setPhoneInput('');
        } else {
          const data = snap.data() as UserProfile;
          setUserProfile(data);
          setPhoneInput(data.phone || '');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${u.uid}`);
      }

      // Seed demo found items into Firestore if not yet seeded
      try {
        const firstSeedRef = doc(db, 'found_items', INITIAL_DEMO_FOUND_ITEMS[0].publicItem.id);
        const firstSnap = await getDoc(firstSeedRef);
        if (!firstSnap.exists()) {
          for (const seed of INITIAL_DEMO_FOUND_ITEMS) {
            const batch = writeBatch(db);
            const pubRef = doc(db, 'found_items', seed.publicItem.id);
            const privRef = doc(db, 'found_items_private', seed.publicItem.id);

            batch.set(pubRef, {
              ...seed.publicItem,
              reporterId: u.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            batch.set(privRef, {
              ...seed.privateData,
              finderEmail: email,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            await batch.commit();
          }
        }
      } catch (seedErr) {
        // Non-fatal if another user already seeded
        console.warn('Demo seed check completed:', seedErr);
      }

      setAuthReady(true);
    });

    return () => unsub();
  }, []);

  // Redirect to pending flow once signed in
  useEffect(() => {
    if (userProfile && pendingActionView) {
      setActiveView(pendingActionView);
      setPendingActionView(null);
    }
  }, [userProfile, pendingActionView]);

  // 2. Real-time Firestore Subscriptions (only when authenticated)
  useEffect(() => {
    if (!authReady || !firebaseUser || !userProfile) return;

    const unsubscribers: (() => void)[] = [];

    // Public Found Items
    const foundQuery = query(
      collection(db, 'found_items'),
      where('status', 'in', [
        'FOUND',
        'IN LOST & FOUND OFFICE',
        'MATCH FOUND',
        'CLAIM PENDING',
        'RETURNED',
      ])
    );
    unsubscribers.push(
      onSnapshot(
        foundQuery,
        (snap) => {
          const items = snap.docs.map((d) => d.data() as FoundItem);
          setDbFoundItems(items);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'found_items')
      )
    );

    // Student's own lost reports
    const myReportsQuery = query(
      collection(db, 'lost_reports'),
      where('userId', '==', firebaseUser.uid)
    );
    unsubscribers.push(
      onSnapshot(
        myReportsQuery,
        (snap) => {
          setMyLostReports(snap.docs.map((d) => d.data() as LostReport));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'lost_reports')
      )
    );

    // Student's own matches
    const myMatchesQuery = query(
      collection(db, 'matches'),
      where('studentId', '==', firebaseUser.uid)
    );
    unsubscribers.push(
      onSnapshot(
        myMatchesQuery,
        (snap) => {
          const list = snap.docs
            .map((d) => d.data() as MatchRecord)
            .sort((a, b) => b.overallScore - a.overallScore);
          setMyMatches(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'matches')
      )
    );

    // Student's own claims
    const myClaimsQuery = query(
      collection(db, 'claims'),
      where('studentId', '==', firebaseUser.uid)
    );
    unsubscribers.push(
      onSnapshot(
        myClaimsQuery,
        (snap) => {
          setMyClaims(snap.docs.map((d) => d.data() as ClaimRecord));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'claims')
      )
    );

    // Student's notifications
    const notifQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', firebaseUser.uid)
    );
    unsubscribers.push(
      onSnapshot(
        notifQuery,
        (snap) => {
          setNotifications(snap.docs.map((d) => d.data() as NotificationRecord));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'notifications')
      )
    );

    // Admin-only collections
    if (isAdmin) {
      unsubscribers.push(
        onSnapshot(
          collection(db, 'found_items_private'),
          (snap) => {
            const map: Record<string, FoundItemPrivate> = {};
            snap.docs.forEach((d) => {
              const data = d.data() as FoundItemPrivate;
              map[data.itemId] = data;
            });
            setPrivateRecordsMap(map);
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'found_items_private')
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'lost_reports'),
          (snap) => {
            setAllLostReports(snap.docs.map((d) => d.data() as LostReport));
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'lost_reports')
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'matches'),
          (snap) => {
            setAllMatches(
              snap.docs
                .map((d) => d.data() as MatchRecord)
                .sort((a, b) => b.overallScore - a.overallScore)
            );
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'matches')
        )
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'claims'),
          (snap) => {
            setAllClaims(snap.docs.map((d) => d.data() as ClaimRecord));
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'claims')
        )
      );
    }

    return () => {
      unsubscribers.forEach((u) => u());
    };
  }, [authReady, firebaseUser, userProfile, isAdmin]);

  // Sign In with Google OAuth
  const handleSignIn = async (targetView?: ActiveView) => {
    setAuthBannerMsg('');
    if (targetView) {
      setPendingActionView(targetView);
    }
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error: any) {
      console.error('Google Sign-In failed:', error);
      setAuthBannerMsg(
        'Sign-in popup was closed or blocked. Please sign in with your ESI Google account to continue.'
      );
    }
  };

  const handleSignOut = async () => {
    await firebaseSignOut(auth);
    setActiveView('home');
  };

  // Run AI Matching on backend and save matches + notifications
  const executeAiMatchingForReport = async (report: LostReport) => {
    const candidateItems = displayFoundItems.filter(
      (i) => i.status !== 'RETURNED' && i.status !== 'EXPIRED'
    );
    const response = await fetch('/api/ai/match-lost-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lostReport: report,
        foundItems: candidateItems,
      }),
    });

    if (!response.ok) return [];
    const data = await response.json();
    const aiMatches = (data.matches || []) as Array<{
      foundItemId: string;
      visualSimilarity: number;
      textSimilarity: number;
      locationSimilarity: number;
      timeSimilarity: number;
      overallScore: number;
      confidenceLabel: string;
      explanationSummary: string;
      reasons: string[];
      verificationPrompt: string;
    }>;

    const savedMatches: MatchRecord[] = [];
    for (const m of aiMatches) {
      const matchId = `match_${report.id}_${m.foundItemId}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
      const matchDoc: MatchRecord = {
        id: matchId,
        lostReportId: report.id,
        foundItemId: m.foundItemId,
        studentId: report.userId,
        overallScore: m.overallScore,
        visualSimilarity: m.visualSimilarity,
        textSimilarity: m.textSimilarity,
        locationSimilarity: m.locationSimilarity,
        timeSimilarity: m.timeSimilarity,
        confidenceLabel: m.confidenceLabel.slice(0, 80),
        explanationSummary: m.explanationSummary.slice(0, 600),
        reasons: (m.reasons || []).slice(0, 8).map((r) => r.slice(0, 190)),
        verificationPrompt: (m.verificationPrompt || '').slice(0, 290),
        adminStatus: 'PENDING_REVIEW',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      try {
        await setDoc(doc(db, 'matches', matchId), matchDoc);
        savedMatches.push(matchDoc);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `matches/${matchId}`);
      }
    }

    if (savedMatches.length > 0) {
      // Update report status to POSSIBLE MATCH
      try {
        await updateDoc(doc(db, 'lost_reports', report.id), {
          status: 'POSSIBLE MATCH',
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `lost_reports/${report.id}`);
      }

      // Create notification for the student
      const topMatch = savedMatches[0];
      const topItem = foundItemsMap[topMatch.foundItemId];
      const notifId = `notif_${report.id}_${Date.now()}`.slice(0, 120);
      try {
        await setDoc(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: report.userId,
          title: '🎉 We may have found your item!',
          message: `Your lost "${report.title}" has a ${topMatch.overallScore}% possible match (${
            topItem?.title || 'Found Item'
          }) in the Lost & Found Office database.`,
          type: 'MATCH_FOUND',
          relatedReportId: report.id,
          relatedMatchId: topMatch.id,
          read: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `notifications/${notifId}`);
      }
    }

    return savedMatches;
  };

  // Submit "I Lost Something"
  const handleLostReportSubmit = async (formData: LostFormSubmission) => {
    if (!firebaseUser || !userProfile) {
      await handleSignIn('report-lost');
      return;
    }

    const reportId = `lost_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newReport: LostReport = {
      id: reportId,
      userId: firebaseUser.uid,
      userName: userProfile.name.slice(0, 115),
      userEmail: userProfile.email.slice(0, 175),
      title: formData.title,
      category: formData.category,
      description: formData.description,
      color: formData.color,
      brand: formData.brand,
      model: formData.model,
      distinguishingCharacteristics: formData.distinguishingCharacteristics,
      locationLost: formData.locationLost,
      dateLost: formData.dateLost,
      photoUrl: formData.photoUrl,
      status: 'SEARCHING',
      claimStatus: 'NONE',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'lost_reports', reportId), newReport);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `lost_reports/${reportId}`);
    }

    await executeAiMatchingForReport(newReport);
    setActiveReportForMatches(newReport);
    setActiveView('match-review');
  };

  // Submit "I Found Something"
  const handleFoundItemSubmit = async (formData: FoundFormSubmission) => {
    if (!firebaseUser || !userProfile) {
      await handleSignIn('report-found');
      return;
    }

    const itemId = `found_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const batch = writeBatch(db);

    const publicDocRef = doc(db, 'found_items', itemId);
    const privateDocRef = doc(db, 'found_items_private', itemId);

    const newFoundItem: FoundItem = {
      id: itemId,
      reporterId: firebaseUser.uid,
      title: formData.title,
      category: formData.category,
      generalDescription: formData.generalDescription,
      color: formData.color,
      brand: formData.brand,
      model: formData.model,
      publicCharacteristics: formData.publicCharacteristics,
      locationFound: formData.locationFound,
      dateFound: formData.dateFound,
      timeFound: formData.timeFound,
      dateSubmittedToOffice:
        formData.custodyState === 'AT_OFFICE' ? formData.dateFound : 'Pending Drop-off',
      status:
        formData.custodyState === 'AT_OFFICE' ? 'IN LOST & FOUND OFFICE' : 'FOUND',
      custodyState: formData.custodyState,
      photoUrl: formData.photoUrl,
      verificationQuestion: formData.verificationQuestion,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    batch.set(publicDocRef, newFoundItem);
    batch.set(privateDocRef, {
      itemId,
      secretCharacteristics: formData.secretCharacteristics,
      storageLocation:
        formData.custodyState === 'AT_OFFICE'
          ? 'Intake Desk — Pending Shelf Assignment'
          : 'With Finder — Awaiting Office Drop-off',
      adminNotes: `Reported via student portal by ${userProfile.email}`,
      finderEmail: userProfile.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `found_items/${itemId}`);
    }

    // Automatically check if this newly found item matches any active lost reports for the user
    for (const report of myLostReports.filter((r) => r.status === 'SEARCHING')) {
      await executeAiMatchingForReport(report);
    }
  };

  // Submit Ownership Claim
  const handleClaimSubmit = async (params: {
    lostReportId: string;
    foundItemId: string;
    matchId?: string;
    verificationQuestion: string;
    verificationAnswer: string;
    additionalProof: string;
  }) => {
    if (!firebaseUser || !userProfile) return;

    const claimId = `claim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const claimPayload: ClaimRecord = {
      id: claimId,
      lostReportId: params.lostReportId,
      foundItemId: params.foundItemId,
      ...(params.matchId ? { matchId: params.matchId } : {}),
      studentId: firebaseUser.uid,
      studentName: userProfile.name.slice(0, 115),
      studentEmail: userProfile.email.slice(0, 175),
      verificationQuestion: params.verificationQuestion.slice(0, 290),
      verificationAnswer: params.verificationAnswer.slice(0, 950),
      additionalProof: (params.additionalProof || '').slice(0, 950),
      suspiciousFlag: false,
      status: 'PENDING',
      adminFeedback: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'claims', claimId), claimPayload);
      await updateDoc(doc(db, 'lost_reports', params.lostReportId), {
        claimStatus: 'PENDING',
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `claims/${claimId}`);
    }
  };

  // Direct claim from homepage catalog
  const handleDirectCatalogClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directClaimItem || !firebaseUser || !userProfile) return;
    if (directClaimAnswer.trim().length < 2) return;

    // Ensure a corresponding LostReport exists for relational integrity
    const autoReportId = `lost_direct_${Date.now()}`;
    const autoReport: LostReport = {
      id: autoReportId,
      userId: firebaseUser.uid,
      userName: userProfile.name.slice(0, 115),
      userEmail: userProfile.email.slice(0, 175),
      title: directClaimItem.title,
      category: directClaimItem.category,
      description: `Direct ownership claim for catalog item: ${directClaimItem.title}`,
      color: directClaimItem.color,
      brand: directClaimItem.brand,
      model: directClaimItem.model || '',
      distinguishingCharacteristics: directClaimAnswer.trim().slice(0, 750),
      locationLost: directClaimItem.locationFound,
      dateLost: directClaimItem.dateFound,
      status: 'POSSIBLE MATCH',
      claimStatus: 'PENDING',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'lost_reports', autoReportId), autoReport);
      await handleClaimSubmit({
        lostReportId: autoReportId,
        foundItemId: directClaimItem.id,
        verificationQuestion:
          directClaimItem.verificationQuestion ||
          'Describe a hidden characteristic or unique detail of this item.',
        verificationAnswer: directClaimAnswer.trim(),
        additionalProof: directClaimProof.trim(),
      });
      setDirectClaimDone(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `lost_reports/${autoReportId}`);
    }
  };

  // Mark notification read
  const handleMarkNotificationRead = async (notif: NotificationRecord) => {
    try {
      await updateDoc(doc(db, 'notifications', notif.id), {
        read: true,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${notif.id}`);
    }
  };

  // Admin Handlers
  const handleAdminAddFoundItem = async (data: {
    title: string;
    category: string;
    generalDescription: string;
    color: string;
    brand: string;
    model: string;
    publicCharacteristics: string;
    locationFound: string;
    dateFound: string;
    verificationQuestion: string;
    secretCharacteristics: string;
    storageLocation: string;
    adminNotes: string;
  }) => {
    if (!firebaseUser || !userProfile) return;
    const itemId = `found_office_${Date.now()}`;
    const batch = writeBatch(db);

    batch.set(doc(db, 'found_items', itemId), {
      id: itemId,
      reporterId: firebaseUser.uid,
      title: data.title.slice(0, 135),
      category: data.category.slice(0, 55),
      generalDescription: data.generalDescription.slice(0, 1150),
      color: data.color.slice(0, 75),
      brand: data.brand.slice(0, 95),
      model: data.model.slice(0, 95),
      publicCharacteristics: data.publicCharacteristics.slice(0, 550),
      locationFound: data.locationFound.slice(0, 115),
      dateFound: data.dateFound.slice(0, 55),
      timeFound: '12:00',
      dateSubmittedToOffice: data.dateFound.slice(0, 55),
      status: 'IN LOST & FOUND OFFICE',
      custodyState: 'AT_OFFICE',
      verificationQuestion: data.verificationQuestion.slice(0, 290),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    batch.set(doc(db, 'found_items_private', itemId), {
      itemId,
      secretCharacteristics: data.secretCharacteristics.slice(0, 950),
      storageLocation: data.storageLocation.slice(0, 150),
      adminNotes: data.adminNotes.slice(0, 1400),
      finderEmail: userProfile.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `found_items/${itemId}`);
    }
  };

  const handleAdminUpdateFoundStatus = async (
    item: FoundItem,
    newStatus: FoundItemStatus
  ) => {
    try {
      await updateDoc(doc(db, 'found_items', item.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `found_items/${item.id}`);
    }
  };

  const handleAdminUpdatePrivateRecord = async (
    itemId: string,
    storageLocation: string,
    secretCharacteristics: string,
    adminNotes: string
  ) => {
    try {
      await updateDoc(doc(db, 'found_items_private', itemId), {
        storageLocation: storageLocation.slice(0, 150),
        secretCharacteristics: secretCharacteristics.slice(0, 950),
        adminNotes: adminNotes.slice(0, 1400),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `found_items_private/${itemId}`);
    }
  };

  const handleAdminReviewClaim = async (
    claim: ClaimRecord,
    decision: 'APPROVED' | 'REJECTED' | 'RETURNED',
    feedback: string,
    suspiciousFlag: boolean
  ) => {
    try {
      await updateDoc(doc(db, 'claims', claim.id), {
        status: decision,
        adminFeedback: feedback.slice(0, 550),
        suspiciousFlag,
        updatedAt: serverTimestamp(),
      });

      if (decision === 'APPROVED') {
        await updateDoc(doc(db, 'found_items', claim.foundItemId), {
          status: 'CLAIM PENDING',
          updatedAt: serverTimestamp(),
        });
        await updateDoc(doc(db, 'lost_reports', claim.lostReportId), {
          status: 'MATCH CONFIRMED',
          claimStatus: 'APPROVED',
          updatedAt: serverTimestamp(),
        });
      } else if (decision === 'RETURNED') {
        await updateDoc(doc(db, 'found_items', claim.foundItemId), {
          status: 'RETURNED',
          updatedAt: serverTimestamp(),
        });
        await updateDoc(doc(db, 'lost_reports', claim.lostReportId), {
          status: 'RETURNED',
          claimStatus: 'RETURNED',
          updatedAt: serverTimestamp(),
        });
      }

      // Send notification to claiming student
      const notifId = `notif_claim_${claim.id}_${Date.now()}`.slice(0, 120);
      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        userId: claim.studentId,
        title:
          decision === 'APPROVED'
            ? 'Claim Approved by Lost & Found Office'
            : decision === 'RETURNED'
            ? 'Item Marked as Returned'
            : 'Claim Update from Lost & Found Office',
        message: feedback.slice(0, 550),
        type:
          decision === 'APPROVED'
            ? 'CLAIM_APPROVED'
            : decision === 'RETURNED'
            ? 'ITEM_RETURNED'
            : 'CLAIM_REJECTED',
        relatedReportId: claim.lostReportId,
        read: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `claims/${claim.id}`);
    }
  };

  const handleAdminReviewMatch = async (
    match: MatchRecord,
    decision: 'APPROVED' | 'REJECTED'
  ) => {
    try {
      await updateDoc(doc(db, 'matches', match.id), {
        adminStatus: decision,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matches/${match.id}`);
    }
  };

  const handleSaveProfilePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), {
        phone: phoneInput.trim().slice(0, 35),
        updatedAt: serverTimestamp(),
      });
      setUserProfile({ ...userProfile, phone: phoneInput.trim().slice(0, 35) });
      setProfileModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userProfile.uid}`);
    }
  };

  const totalReturnedStat = useMemo(() => {
    const dbReturned = displayFoundItems.filter((i) => i.status === 'RETURNED').length;
    return 142 + dbReturned;
  }, [displayFoundItems]);

  const activeSearchesStat = useMemo(() => {
    return 29 + myLostReports.filter((r) => r.status === 'SEARCHING').length;
  }, [myLostReports]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Navbar
        activeView={activeView}
        onNavigate={(view) => {
          if ((view === 'dashboard' || view === 'admin') && !userProfile) {
            handleSignIn(view);
            return;
          }
          setActiveView(view);
        }}
        user={userProfile}
        isAdmin={isAdmin}
        notifications={notifications}
        onSignIn={() => handleSignIn()}
        onSignOut={handleSignOut}
        onMarkNotificationRead={handleMarkNotificationRead}
        onOpenProfileModal={() => setProfileModalOpen(true)}
      />

      {authBannerMsg && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-xs text-amber-900 flex items-center justify-center gap-3">
          <span>{authBannerMsg}</span>
          <button
            type="button"
            onClick={() => setAuthBannerMsg('')}
            className="underline font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {activeView === 'home' && (
          <HomeView
            foundItems={displayFoundItems}
            totalReturnedCount={totalReturnedStat}
            activeSearchesCount={activeSearchesStat}
            onStartLostFlow={() => {
              if (!userProfile) {
                handleSignIn('report-lost');
              } else {
                setActiveView('report-lost');
              }
            }}
            onStartFoundFlow={() => {
              if (!userProfile) {
                handleSignIn('report-found');
              } else {
                setActiveView('report-found');
              }
            }}
            onSelectFoundItemForClaim={(item) => {
              if (!userProfile) {
                handleSignIn('home');
                return;
              }
              setDirectClaimItem(item);
              setDirectClaimAnswer('');
              setDirectClaimProof('');
              setDirectClaimDone(false);
            }}
          />
        )}

        {activeView === 'report-lost' && (
          <ReportLostFlow
            onSubmitLostReport={handleLostReportSubmit}
            onCancel={() => setActiveView(userProfile ? 'dashboard' : 'home')}
          />
        )}

        {activeView === 'report-found' && (
          <ReportFoundFlow
            onSubmitFoundItem={handleFoundItemSubmit}
            onCancel={() => setActiveView(userProfile ? 'dashboard' : 'home')}
          />
        )}

        {activeView === 'match-review' && activeReportForMatches && (
          <MatchResultsView
            lostReport={activeReportForMatches}
            matches={myMatches.filter((m) => m.lostReportId === activeReportForMatches.id)}
            foundItemsMap={foundItemsMap}
            onBackToDashboard={() => setActiveView('dashboard')}
            onSubmitClaim={handleClaimSubmit}
          />
        )}

        {activeView === 'dashboard' && userProfile && (
          <StudentDashboard
            user={userProfile}
            lostReports={myLostReports}
            myFoundItems={displayFoundItems.filter((f) => f.reporterId === userProfile.uid)}
            matches={myMatches}
            claims={myClaims}
            foundItemsMap={foundItemsMap}
            notifications={notifications}
            onStartLostFlow={() => setActiveView('report-lost')}
            onStartFoundFlow={() => setActiveView('report-found')}
            onViewReportMatches={(report) => {
              setActiveReportForMatches(report);
              setActiveView('match-review');
            }}
            onRerunMatching={async (report) => {
              await executeAiMatchingForReport(report);
            }}
          />
        )}

        {activeView === 'admin' && isAdmin && (
          <AdminDashboard
            foundItems={displayFoundItems}
            privateRecordsMap={privateRecordsMap}
            allLostReports={allLostReports}
            allMatches={allMatches}
            allClaims={allClaims}
            onAdminAddFoundItem={handleAdminAddFoundItem}
            onAdminUpdateFoundStatus={handleAdminUpdateFoundStatus}
            onAdminUpdatePrivateRecord={handleAdminUpdatePrivateRecord}
            onAdminReviewClaim={handleAdminReviewClaim}
            onAdminReviewMatch={handleAdminReviewMatch}
          />
        )}
      </main>

      {/* Direct Catalog Claim Verification Modal */}
      {directClaimItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="text-xs font-semibold text-[#1E3A8A]">
                  Ownership Verification Claim
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mt-0.5">
                  {directClaimItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDirectClaimItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {directClaimDone ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-emerald-950">
                      Your claim has been submitted.
                    </p>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      Please wait for the Lost &amp; Found Office to verify your claim. You can
                      track approval status in your Student Dashboard.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setDirectClaimItem(null);
                      setActiveView('dashboard');
                    }}
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg cursor-pointer"
                  >
                    Go to Student Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDirectCatalogClaim} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
                  <Lock className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                  <span>
                    To protect against false claims, the Lost &amp; Found Office requires you to
                    verify a non-public detail before pickup.
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs font-semibold text-slate-900">
                  {directClaimItem.verificationQuestion ||
                    'Does the item have any distinctive marks, engravings, or contents inside?'}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Answer *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={directClaimAnswer}
                    onChange={(e) => setDirectClaimAnswer(e.target.value)}
                    placeholder="Describe the hidden characteristic known only to the owner..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Additional Proof (Optional)
                  </label>
                  <input
                    type="text"
                    value={directClaimProof}
                    onChange={(e) => setDirectClaimProof(e.target.value)}
                    placeholder="Student group, serial number, or when you lost it..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDirectClaimItem(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg cursor-pointer"
                  >
                    Submit Claim for Office Verification
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Private User Profile Modal (PII never shown publicly) */}
      {profileModalOpen && userProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  ESI Student Profile (Private)
                </h3>
                <p className="text-xs text-slate-500">
                  Your contact information is strictly private and only visible to the Lost &amp;
                  Found Office.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfilePhone} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block">Full Name</span>
                <span className="font-semibold text-slate-900 text-sm">{userProfile.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ESI Google Account</span>
                <span className="font-mono-tabular font-medium text-slate-800">
                  {userProfile.email}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Campus Role</span>
                <span className="font-semibold text-[#1E3A8A] uppercase">
                  {isAdmin ? 'Lost & Found Office Administrator' : 'ESI Student'}
                </span>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Optional Phone Number (For Office Pickup Alerts Only)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+213 550 00 00 00"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg font-mono-tabular"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clean Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            ESI Lost &amp; Found · École Nationale Supérieure d&apos;Informatique (Oued Smar,
            Algiers)
          </div>
          <div className="flex items-center gap-6">
            <span>Physical Office: Ground Floor, Room G-04</span>
            <span>·</span>
            <span>Privacy-Protected Campus Recovery</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
