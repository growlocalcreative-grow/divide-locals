import { useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  serverTimestamp,
  orderBy,
  increment,
  arrayUnion,
  arrayRemove,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from './firebase';
import { Business, NeighborProfile, Review } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}

export function useDirectory(category?: string) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    // Only fetch approved businesses for the directory
    let q = query(
      collection(db, 'businesses'), 
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    
    if (category && category !== 'All') {
      q = query(
        collection(db, 'businesses'), 
        where('status', '==', 'approved'),
        where('category', '==', category), 
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Business[];
      setBusinesses(calculateBadges(data));
      setLoading(false);
      setError(null);
    }, (error: any) => {
      console.error("Firestore Error (useDirectory):", error);
      setError(error);
      setLoading(false);
    });

    return unsubscribe;
  }, [category]);

  return { businesses, loading, error };
}

export function useBusinesses(category?: string) {
  // Legacy or admin hook to see all businesses
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let q = query(collection(db, 'businesses'), orderBy('createdAt', 'desc'));
    if (category && category !== 'All') {
      q = query(collection(db, 'businesses'), where('category', '==', category), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Business[];
      setBusinesses(calculateBadges(data));
      setLoading(false);
      setError(null);
    }, (error: any) => {
      console.error("Firestore Error (useBusinesses):", error);
      setError(error);
      setLoading(false);
    });

    return unsubscribe;
  }, [category]);

  return { businesses, loading, error };
}

export function useReviews(businessId?: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!businessId) return;
    const q = query(
      collection(db, 'reviews'), 
      where('businessId', '==', businessId), 
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(data.filter(r => (r.status || 'published') === 'published'));
      setLoading(false);
      setError(null);
    }, (error: any) => {
      // Gracefully handle "failed-precondition" (index building)
      console.error("Firestore Error (useReviews):", error);
      setError(error);
      setLoading(false);
    });

    return unsubscribe;
  }, [businessId]);

  return { reviews, loading, error };
}

export function getResidentStatus(business: Business) {
  return business.isResidentOwned === true;
}

export function calculateBadges(businesses: Business[]) {
  // Community Favorite: top 10% of total saves (favoriteCount)
  const sortedBySaves = [...businesses].sort((a, b) => (b.favoriteCount || 0) - (a.favoriteCount || 0));
  const top10PercentCount = Math.max(1, Math.ceil(businesses.length * 0.1));
  const topThreshold = sortedBySaves[top10PercentCount - 1]?.favoriteCount || 0;

  return businesses.map(b => ({
    ...b,
    isCommunityFavorite: (b.favoriteCount || 0) > 0 && (b.favoriteCount || 0) >= topThreshold
  }));
}

export function useNeighborProfile(uid?: string) {
  const [profile, setProfile] = useState<NeighborProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, 'profiles', uid), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as NeighborProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsub;
  }, [uid]);

  return { profile, loading };
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<NeighborProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'profiles'), orderBy('uid'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data()
      })) as NeighborProfile[];
      setProfiles(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { profiles, loading };
}

export function useFavorites(uid?: string) {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'profiles', uid, 'favorites'), orderBy('savedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setFavorites(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return unsub;
  }, [uid]);

  return { favorites, loading };
}

export function useAllReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { reviews, loading };
}

export function useUserReviews(uid?: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setReviews([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'reviews'),
      where('authorId', '==', uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[]);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching user reviews:", err);
      setLoading(false);
    });

    return unsub;
  }, [uid]);

  return { reviews, loading };
}

export async function toggleFavorite(businessId: string, userId: string, isFavorited: boolean, businessData?: Partial<Business>) {
  try {
    const businessRef = doc(db, 'businesses', businessId);
    const profileRef = doc(db, 'profiles', userId);
    const favoriteSubRef = doc(db, 'profiles', userId, 'favorites', businessId);

    // Ensure profile exists
    const profileSnap = await getDoc(profileRef);
    if (!profileSnap.exists()) {
      await setDoc(profileRef, {
        uid: userId,
        email: auth.currentUser?.email || '',
        displayName: auth.currentUser?.displayName || '',
        photoURL: auth.currentUser?.photoURL || '',
        favorites: [],
        isAdmin: false,
        createdAt: serverTimestamp()
      });
    }

    await updateDoc(businessRef, {
      favoriteCount: increment(isFavorited ? -1 : 1)
    });

    if (isFavorited) {
      await updateDoc(profileRef, {
        favorites: arrayRemove(businessId)
      });
      try {
        await deleteDoc(favoriteSubRef);
      } catch (err) {
        console.error("Error deleting from favorites sub-collection:", err);
      }
    } else {
      await updateDoc(profileRef, {
        favorites: arrayUnion(businessId)
      });
      // Store metadata in sub-collection as requested
      await setDoc(favoriteSubRef, {
        businessId,
        name: businessData?.name || '',
        category: businessData?.category || '',
        phone: businessData?.contact?.phone || '',
        textPhone: businessData?.contact?.textPhone || '',
        savedAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.error("Error toggling favorite:", err);
  }
}

export async function addBusiness(data: Partial<Business>) {
  try {
    // Sanitize data to avoid undefined fields
    const sanitizedData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    const newBusiness = {
      ...sanitizedData,
      isResidentOwned: data.isResidentOwned ?? false,
      status: data.status || 'pending',
      createdAt: serverTimestamp(),
      ownerId: auth.currentUser?.uid || data.ownerId || 'anonymous'
    };
    return await addDoc(collection(db, 'businesses'), newBusiness);
  } catch (err: any) {
    alert("Error: " + (err.code || err.message));
    throw err;
  }
}

export async function addReview(data: Partial<Review>) {
  try {
    return await addDoc(collection(db, 'reviews'), {
      ...data,
      status: 'published',
      createdAt: serverTimestamp()
    });
  } catch (err: any) {
    alert("Error: " + (err.code || err.message));
    throw err;
  }
}

export async function updateBusiness(id: string, data: Partial<Business>) {
  try {
    // Sanitize data to avoid undefined fields
    const sanitizedData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    const businessRef = doc(db, 'businesses', id);
    return await updateDoc(businessRef, {
      ...sanitizedData,
      updatedAt: serverTimestamp() // We can still use updatedAt for general tracking
    });
  } catch (err: any) {
    alert("Error: " + (err.code || err.message));
    throw err;
  }
}

export async function deleteBusiness(id: string) {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    return await deleteDoc(doc(db, 'businesses', id));
  } catch (err: any) {
    alert("Error: " + (err.code || err.message));
    throw err;
  }
}

export async function updateReview(id: string, data: Partial<Review>) {
  try {
    const reviewRef = doc(db, 'reviews', id);
    return await updateDoc(reviewRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (err: any) {
    alert("Error: " + (err.code || err.message));
    throw err;
  }
}

export async function deleteReview(id: string) {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    return await deleteDoc(doc(db, 'reviews', id));
  } catch (err: any) {
    alert("Error: " + (err.code || err.message));
    throw err;
  }
}

export async function updateProfile(uid: string, data: Partial<NeighborProfile>) {
  try {
    const profileRef = doc(db, 'profiles', uid);
    return await updateDoc(profileRef, data);
  } catch (err: any) {
    alert("Error: " + (err.code || err.message));
    throw err;
  }
}
