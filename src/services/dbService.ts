import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const dbService = {
  async createGame(gameData: any) {
    return addDoc(collection(db, 'games'), gameData);
  },

  async updateGame(gameId: string, update: any) {
    const gameRef = doc(db, 'games', gameId);
    return updateDoc(gameRef, update);
  },

  listenToGame(gameId: string, callback: (data: any) => void) {
    return onSnapshot(doc(db, 'games', gameId), (doc) => {
      callback(doc.data());
    });
  }
};
