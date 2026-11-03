import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Organization, FinancialTransaction, Product, AuditLogEntry } from '../types';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_PRODUCTS,
} from '../data/mockDatabase';

/**
 * Enterprise Firestore Service for BusinessOS
 * Provides tenant-isolated persistence for Organizations, Transactions, and Products
 * using the configured Firestore Database ID.
 */

// ----------------------------------------------------------------------
// ORGANIZATIONS
// ----------------------------------------------------------------------

export async function fetchOrganizationsFromFirestore(): Promise<Organization[]> {
  try {
    const orgsRef = collection(db, 'organizations');
    const snapshot = await getDocs(orgsRef);

    if (snapshot.empty) {
      // Seed initial organizations to Firestore
      for (const org of INITIAL_ORGANIZATIONS) {
        await setDoc(doc(db, 'organizations', org.id), org);
      }
      return INITIAL_ORGANIZATIONS;
    }

    const orgs: Organization[] = [];
    snapshot.forEach((d) => {
      orgs.push({ id: d.id, ...(d.data() as Omit<Organization, 'id'>) });
    });
    return orgs;
  } catch (error: any) {
    console.warn('Firestore fetchOrganizations fallback to local seeds:', error?.message);
    return INITIAL_ORGANIZATIONS;
  }
}

export async function saveOrganizationToFirestore(org: Organization): Promise<void> {
  try {
    await setDoc(doc(db, 'organizations', org.id), org, { merge: true });
  } catch (error: any) {
    console.error('Error saving organization to Firestore:', error);
    throw error;
  }
}

export function subscribeToOrganizations(
  onUpdate: (orgs: Organization[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const orgsRef = collection(db, 'organizations');
  return onSnapshot(
    orgsRef,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(INITIAL_ORGANIZATIONS);
        return;
      }
      const orgs: Organization[] = [];
      snapshot.forEach((d) => {
        orgs.push({ id: d.id, ...(d.data() as Omit<Organization, 'id'>) });
      });
      onUpdate(orgs);
    },
    (error) => {
      console.warn('Organizations snapshot listener error:', error.message);
      if (onError) onError(error);
    }
  );
}

// ----------------------------------------------------------------------
// TRANSACTIONS (TENANT-ISOLATED BY organizationId)
// ----------------------------------------------------------------------

export async function fetchTransactionsFromFirestore(
  organizationId: string
): Promise<FinancialTransaction[]> {
  try {
    const txRef = collection(db, 'transactions');
    // Enforce tenant isolation via scoped where query
    const q = query(txRef, where('organizationId', '==', organizationId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Seed initial transactions for this organization
      const orgTx = INITIAL_TRANSACTIONS.filter((t) => t.organizationId === organizationId);
      for (const t of orgTx) {
        await setDoc(doc(db, 'transactions', t.id), t);
      }
      return orgTx;
    }

    const txList: FinancialTransaction[] = [];
    snapshot.forEach((d) => {
      txList.push({ id: d.id, ...(d.data() as Omit<FinancialTransaction, 'id'>) });
    });

    // Sort by date descending
    return txList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error: any) {
    console.warn(`Firestore fetchTransactions fallback for org ${organizationId}:`, error?.message);
    return INITIAL_TRANSACTIONS.filter((t) => t.organizationId === organizationId);
  }
}

export async function saveTransactionToFirestore(tx: FinancialTransaction): Promise<void> {
  try {
    await setDoc(doc(db, 'transactions', tx.id), tx);
  } catch (error: any) {
    console.error('Error saving transaction to Firestore:', error);
    throw error;
  }
}

export async function reverseTransactionInFirestore(
  originalTxId: string,
  reversalTx: FinancialTransaction
): Promise<void> {
  try {
    // 1. Mark original transaction as reversed
    const originalRef = doc(db, 'transactions', originalTxId);
    await updateDoc(originalRef, {
      status: 'reversed',
      reversalReason: reversalTx.description,
      reversedAt: new Date().toISOString(),
    });

    // 2. Insert new reversal transaction
    await setDoc(doc(db, 'transactions', reversalTx.id), reversalTx);
  } catch (error: any) {
    console.error('Error reversing transaction in Firestore:', error);
    throw error;
  }
}

export function subscribeToTransactions(
  organizationId: string,
  onUpdate: (transactions: FinancialTransaction[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const txRef = collection(db, 'transactions');
  // Tenant-scoped real-time query
  const q = query(txRef, where('organizationId', '==', organizationId));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(INITIAL_TRANSACTIONS.filter((t) => t.organizationId === organizationId));
        return;
      }
      const list: FinancialTransaction[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<FinancialTransaction, 'id'>) });
      });
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(list);
    },
    (error) => {
      console.warn('Transactions snapshot listener error:', error.message);
      if (onError) onError(error);
    }
  );
}

// ----------------------------------------------------------------------
// PRODUCTS & INVENTORY (TENANT-ISOLATED BY organizationId)
// ----------------------------------------------------------------------

export async function fetchProductsFromFirestore(organizationId: string): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    // Enforce tenant isolation via scoped where query
    const q = query(productsRef, where('organizationId', '==', organizationId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Seed initial products for this organization
      const orgProducts = INITIAL_PRODUCTS.filter((p) => p.organizationId === organizationId);
      for (const p of orgProducts) {
        await setDoc(doc(db, 'products', p.id), p);
      }
      return orgProducts;
    }

    const products: Product[] = [];
    snapshot.forEach((d) => {
      products.push({ id: d.id, ...(d.data() as Omit<Product, 'id'>) });
    });
    return products;
  } catch (error: any) {
    console.warn(`Firestore fetchProducts fallback for org ${organizationId}:`, error?.message);
    return INITIAL_PRODUCTS.filter((p) => p.organizationId === organizationId);
  }
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  try {
    await setDoc(doc(db, 'products', product.id), product, { merge: true });
  } catch (error: any) {
    console.error('Error saving product to Firestore:', error);
    throw error;
  }
}

export async function updateProductStockInFirestore(
  productId: string,
  newStock: number,
  actorInfo?: { actorId: string; actorName: string; reason?: string; orgId?: string }
): Promise<void> {
  try {
    const prodRef = doc(db, 'products', productId);
    await updateDoc(prodRef, {
      currentStock: newStock,
      updatedAt: new Date().toISOString(),
    });

    if (actorInfo?.orgId) {
      await logAuditEvent({
        organizationId: actorInfo.orgId,
        action: 'STOCK_ADJUSTMENT',
        category: 'inventory',
        actorId: actorInfo.actorId || 'system',
        actorName: actorInfo.actorName || 'Inventory Controller',
        targetEntity: 'Product',
        targetEntityId: productId,
        description: `Product stock manually or automatically adjusted to ${newStock} units. Reason: ${actorInfo.reason || 'Inventory cycle reconciliation'}`,
        details: { newStock, reason: actorInfo.reason },
        severity: 'info',
      });
    }
  } catch (error: any) {
    console.error('Error updating product stock in Firestore:', error);
    throw error;
  }
}

export function subscribeToProducts(
  organizationId: string,
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const productsRef = collection(db, 'products');
  // Tenant-scoped real-time query
  const q = query(productsRef, where('organizationId', '==', organizationId));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(INITIAL_PRODUCTS.filter((p) => p.organizationId === organizationId));
        return;
      }
      const list: Product[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<Product, 'id'>) });
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('Products snapshot listener error:', error.message);
      if (onError) onError(error);
    }
  );
}

// ----------------------------------------------------------------------
// AUDIT LOGS (TENANT-ISOLATED REAL-TIME AUDIT TRAIL)
// ----------------------------------------------------------------------

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-seed-1',
    organizationId: 'org-apex',
    action: 'SYSTEM_INITIALIZED',
    category: 'compliance',
    actorId: 'system',
    actorName: 'BusinessOS Security Daemon',
    actorEmail: 'security@businessos.internal',
    targetEntity: 'Organization',
    targetEntityId: 'org-apex',
    description: 'Tenant organization security boundaries and encryption established.',
    details: { environment: 'Cloud Firestore Multi-Tenant' },
    severity: 'info',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'log-seed-2',
    organizationId: 'org-apex',
    action: 'LEDGER_INTEGRITY_CHECK',
    category: 'finance',
    actorId: 'usr-1',
    actorName: 'Ananya Sharma',
    actorEmail: 'ananya.sharma@apexglobal.com',
    targetEntity: 'FinancialLedger',
    targetEntityId: 'ledger-main',
    description: 'Quarterly financial balance reconciliation completed without variances.',
    details: { balanceVerified: true, variance: 0 },
    severity: 'info',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'log-seed-3',
    organizationId: 'org-apex',
    action: 'STOCK_TRANSFER',
    category: 'inventory',
    actorId: 'usr-1',
    actorName: 'Ananya Sharma',
    actorEmail: 'ananya.sharma@apexglobal.com',
    targetEntity: 'WarehouseTransfer',
    targetEntityId: 'wh-trans-01',
    description: 'Cross-dock inventory transfer authorized between Main WH and Secondary WH.',
    details: { fromWh: 'wh-1', toWh: 'wh-2', units: 40 },
    severity: 'info',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export async function logAuditEvent(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { timestamp?: string; id?: string }
): Promise<AuditLogEntry> {
  const logId = entry.id || `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const fullEntry: AuditLogEntry = {
    ...entry,
    id: logId,
    timestamp: entry.timestamp || new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'auditLogs', logId), fullEntry);
  } catch (error: any) {
    console.warn('Firestore logAuditEvent fallback:', error?.message);
  }

  return fullEntry;
}

export async function fetchAuditLogs(organizationId: string): Promise<AuditLogEntry[]> {
  try {
    const logsRef = collection(db, 'auditLogs');
    const q = query(logsRef, where('organizationId', '==', organizationId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Seed default audit logs for this organization
      const orgSeeds = INITIAL_AUDIT_LOGS.filter((l) => l.organizationId === organizationId);
      if (orgSeeds.length > 0) {
        for (const log of orgSeeds) {
          await setDoc(doc(db, 'auditLogs', log.id), log);
        }
        return orgSeeds;
      }
      // If none, create an initialization audit log for this org
      const bootstrapLog: AuditLogEntry = {
        id: `audit-init-${Date.now()}`,
        organizationId,
        action: 'TENANT_WORKSPACE_ACTIVE',
        category: 'compliance',
        actorId: 'system',
        actorName: 'BusinessOS Engine',
        targetEntity: 'Organization',
        targetEntityId: organizationId,
        description: `Audit tracking stream initiated for tenant workspace: ${organizationId}`,
        severity: 'info',
        timestamp: new Date().toISOString(),
      };
      await setDoc(doc(db, 'auditLogs', bootstrapLog.id), bootstrapLog);
      return [bootstrapLog];
    }

    const logs: AuditLogEntry[] = [];
    snapshot.forEach((d) => {
      logs.push({ id: d.id, ...(d.data() as Omit<AuditLogEntry, 'id'>) });
    });

    return logs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error: any) {
    console.warn(`Firestore fetchAuditLogs fallback for org ${organizationId}:`, error?.message);
    return INITIAL_AUDIT_LOGS.filter((l) => l.organizationId === organizationId);
  }
}

export function subscribeToAuditLogs(
  organizationId: string,
  onUpdate: (logs: AuditLogEntry[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const logsRef = collection(db, 'auditLogs');
  const q = query(logsRef, where('organizationId', '==', organizationId));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(INITIAL_AUDIT_LOGS.filter((l) => l.organizationId === organizationId));
        return;
      }
      const list: AuditLogEntry[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<AuditLogEntry, 'id'>) });
      });
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(list);
    },
    (error) => {
      console.warn('Audit logs snapshot listener error:', error.message);
      if (onError) onError(error);
    }
  );
}
