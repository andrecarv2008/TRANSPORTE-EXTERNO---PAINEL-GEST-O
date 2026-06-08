import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, disableNetwork } from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';

// Initialize Firebase app (handling hot reloads cleanly)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Circuit breaker state to protect against Firestore quota exhaustion
let firestoreNetworkDisabled = false;

export function isFirestoreNetworkDisabled(): boolean {
  return firestoreNetworkDisabled;
}

export function forceDisableFirestoreNetwork(): void {
  if (!firestoreNetworkDisabled) {
    firestoreNetworkDisabled = true;
    console.warn("Manually tripping Circuit Breaker - Disabling Firestore network to prevent further errors.");
    disableNetwork(db).catch(err => {
      console.error("Failed to disable Firestore network:", err);
    });
  }
}

// Firestore Error Handler in compliance with instructions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorStr = String(error);
  const errorMsg = error instanceof Error ? error.message : errorStr;
  
  // Trip circuit breaker if we hit quota limits
  const isQuotaError = 
    errorStr.includes("resource-exhausted") || 
    errorStr.toLowerCase().includes("quota") ||
    errorMsg.includes("resource-exhausted") || 
    errorMsg.toLowerCase().includes("quota");

  if (isQuotaError && !firestoreNetworkDisabled) {
    firestoreNetworkDisabled = true;
    console.warn("Firestore Quota Exceeded! Disabling Firestore network to prevent further errors and retries.");
    disableNetwork(db).catch(err => {
      console.error("Failed to disable Firestore network:", err);
    });
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
