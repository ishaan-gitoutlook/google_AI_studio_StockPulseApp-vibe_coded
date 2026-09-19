import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  fbSignOut,
  onAuthStateChanged,
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  User,
} from '../lib/firebase';
import { UserProfile, StockResearchNote } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  notes: StockResearchNote[];
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  toggleWatchlist: (symbol: string) => Promise<void>;
  setFavoriteUniverse: (universeId: string) => Promise<void>;
  addResearchNote: (note: Omit<StockResearchNote, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deleteResearchNote: (noteId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<StockResearchNote[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user profile in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Investor',
              photoURL: currentUser.photoURL || '',
              watchlist: ['NVDA', 'AAPL', 'MSFT'],
              favoriteUniverse: 'global-megacaps',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (e) {
          console.error('Error fetching user profile from Firestore:', e);
        }
      } else {
        setUserProfile(null);
        setNotes([]);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time listener for user notes
  useEffect(() => {
    if (!user) return;
    const notesRef = collection(db, 'user_notes');
    const q = query(notesRef, where('userId', '==', user.uid));

    const unsubscribeNotes = onSnapshot(
      q,
      (snapshot) => {
        const fetchedNotes: StockResearchNote[] = [];
        snapshot.forEach((doc) => {
          fetchedNotes.push({
            id: doc.id,
            ...(doc.data() as Omit<StockResearchNote, 'id'>),
          });
        });
        setNotes(fetchedNotes);
      },
      (err) => {
        console.error('Error in notes Firestore snapshot:', err);
      }
    );

    return () => unsubscribeNotes();
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Sign-in with Google failed:', err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setUserProfile(null);
      setNotes([]);
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  const toggleWatchlist = async (symbol: string) => {
    if (!user || !userProfile) return;
    const cleanSym = symbol.toUpperCase();
    const currentList = userProfile.watchlist || [];
    const updated = currentList.includes(cleanSym)
      ? currentList.filter((s) => s !== cleanSym)
      : [...currentList, cleanSym];

    const updatedProfile = {
      ...userProfile,
      watchlist: updated,
      updatedAt: new Date().toISOString(),
    };

    setUserProfile(updatedProfile);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        watchlist: updated,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Failed to sync watchlist to Firestore:', e);
    }
  };

  const setFavoriteUniverse = async (universeId: string) => {
    if (!user || !userProfile) return;
    const updatedProfile = {
      ...userProfile,
      favoriteUniverse: universeId,
      updatedAt: new Date().toISOString(),
    };
    setUserProfile(updatedProfile);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        favoriteUniverse: universeId,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Failed to sync favorite universe to Firestore:', e);
    }
  };

  const addResearchNote = async (
    noteData: Omit<StockResearchNote, 'id' | 'userId' | 'createdAt'>
  ) => {
    if (!user) return;
    try {
      const notesRef = collection(db, 'user_notes');
      await addDoc(notesRef, {
        ...noteData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Failed to save research note to Firestore:', e);
      throw e;
    }
  };

  const deleteResearchNote = async (noteId: string) => {
    if (!user) return;
    try {
      const noteDocRef = doc(db, 'user_notes', noteId);
      await deleteDoc(noteDocRef);
    } catch (e) {
      console.error('Failed to delete note from Firestore:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        notes,
        signInWithGoogle,
        signOut,
        toggleWatchlist,
        setFavoriteUniverse,
        addResearchNote,
        deleteResearchNote,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
