import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Viagem } from './types';
import { INITIAL_VIAGENS } from './data';

export interface MetadataLastUpdate {
  id: string;
  lastUploadedAt: string;
  uploaderName: string;
  fileName: string;
  recordCount: number;
}

const VIAGENS_COLLECTION = 'viagens';
const METADATA_COLLECTION = 'metadata';

/**
 * Fetches all voyages (viagens) from Firestore.
 * If empty, automatically populates with INITIAL_VIAGENS to bootstrap the database.
 */
export async function fetchViagensFromFirestore(): Promise<Viagem[]> {
  try {
    const q = query(collection(db, VIAGENS_COLLECTION));
    const querySnapshot = await getDocs(q);
    
    const docs: Viagem[] = [];
    querySnapshot.forEach((doc) => {
      docs.push(doc.data() as Viagem);
    });

    if (docs.length === 0) {
      console.log("Firestore voyages collection empty. Hydrating with INITIAL_VIAGENS...");
      await saveViagensToFirestore(INITIAL_VIAGENS, 'substituir', {
        uploaderName: 'Sistema (Auto)',
        fileName: 'Base_Inicial_Hidratada.xlsx',
      });
      return INITIAL_VIAGENS;
    }

    return docs;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, VIAGENS_COLLECTION);
    return []; // fallback of type safety
  }
}

/**
 * Saves and materializes list of voyages to Firestore.
 * Can either replace existing documents completely or sum/merge them.
 */
export async function saveViagensToFirestore(
  newViagens: Viagem[],
  mode: 'substituir' | 'somar',
  meta: { uploaderName: string; fileName: string }
): Promise<void> {
  try {
    // 1. If 'substituir', delete all current and old viajes from Firestore
    if (mode === 'substituir') {
      const q = query(collection(db, VIAGENS_COLLECTION));
      const querySnapshot = await getDocs(q);
      
      const batches: any[] = [];
      let currentBatch = writeBatch(db);
      let count = 0;

      querySnapshot.forEach((docSnap) => {
        currentBatch.delete(docSnap.ref);
        count++;
        if (count >= 400) {
          batches.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          count = 0;
        }
      });
      if (count > 0) {
        batches.push(currentBatch.commit());
      }
      await Promise.all(batches);
    }

    // 2. Write new voyages to Firestore in chunks of up to 450 per batch
    const writeBatches: any[] = [];
    let currentWriteBatch = writeBatch(db);
    let writeCount = 0;

    for (const v of newViagens) {
      // Basic validation parameters for safety
      if (!v.id) continue;
      
      const docRef = doc(db, VIAGENS_COLLECTION, v.id);
      
      // Sanitize fields to ensure no undefined values are written to Firestore as Firestore dislikes them
      const data: Record<string, any> = {};
      Object.entries(v).forEach(([key, value]) => {
        if (value !== undefined) {
          data[key] = value;
        }
      });

      currentWriteBatch.set(docRef, data, { merge: true });
      writeCount++;

      if (writeCount >= 400) {
        writeBatches.push(currentWriteBatch.commit());
        currentWriteBatch = writeBatch(db);
        writeCount = 0;
      }
    }

    if (writeCount > 0) {
      writeBatches.push(currentWriteBatch.commit());
    }
    await Promise.all(writeBatches);

    // 3. Save Last Update Metadata Information
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    // Calculate new total after merge or replacement
    let newCount = newViagens.length;
    if (mode === 'somar') {
      const updatedSnapshot = await getDocs(query(collection(db, VIAGENS_COLLECTION)));
      newCount = updatedSnapshot.size;
    }

    const metaDocRef = doc(db, METADATA_COLLECTION, 'last_update');
    const metadataPayload: MetadataLastUpdate = {
      id: 'last_update',
      lastUploadedAt: formattedDate,
      uploaderName: meta.uploaderName,
      fileName: meta.fileName,
      recordCount: newCount,
    };

    await setDoc(metaDocRef, metadataPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, VIAGENS_COLLECTION);
  }
}

/**
 * Fetches the metadata about the last excel spreadsheet upload.
 */
export async function fetchLastUpdateMetadata(): Promise<MetadataLastUpdate | null> {
  try {
    const docRef = doc(db, METADATA_COLLECTION, 'last_update');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as MetadataLastUpdate;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${METADATA_COLLECTION}/last_update`);
    return null;
  }
}

/**
 * Deletes all voyages and resets to initial defaults on Firestore
 */
export async function resetViagensInFirestore(uploader: string = "Administrador"): Promise<void> {
  try {
    await saveViagensToFirestore(INITIAL_VIAGENS, 'substituir', {
      uploaderName: uploader,
      fileName: 'Base_Redefinida_Inicial.xlsx',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, VIAGENS_COLLECTION);
  }
}
