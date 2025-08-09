import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { 
  collection, 
  query, 
  where, 
  getDocs,  
  deleteDoc, 
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useAuth } from '../../context/AuthContext';
import RequestItem from '../../components/RequestItem';

interface UserData {
  uid: string;
  email: string;  
  displayName: string;
  [key: string]: any;
}

interface Property {
  title: string;
  address: string;
  [key: string]: any;
}

interface Landlord {
  displayName: string;
  email: string;
  [key: string]: any;
}

interface Request {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  status: 'pending' | 'approved' | 'denied';
  message: string;
  createdAt: Date;
  property: Property;
  landlord: Landlord;
}

const RequestsScreen = ({ navigation }: { navigation: any }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();

  useEffect(() => {
    const fetchRequests = async () => {
      if (!userData?.uid) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'requests'),
          where('tenantId', '==', userData.uid)
        );

        const snapshot = await getDocs(q);
        const requestsData = await Promise.all(
          snapshot.docs.map(async (document) => {
            const requestData = document.data();
            
            const propertyDocRef = doc(db, 'properties', requestData.propertyId);
            const propertyDoc = await getDoc(propertyDocRef);
            const propertyData = propertyDoc.data() || {};

            const landlordDocRef = doc(db, 'users', requestData.landlordId);
            const landlordDoc = await getDoc(landlordDocRef);
            const landlordData = landlordDoc.data() || {};
            
            return {
              id: document.id,
              ...requestData,
              createdAt: requestData.createdAt?.toDate() || new Date(),
              property: {
                title: propertyData.title || 'Untitled Property',
                address: propertyData.address || 'No address provided',
                ...propertyData
              },
              landlord: {
                displayName: landlordData.displayName || 'Unknown Landlord',
                email: landlordData.email || 'No email provided',
                ...landlordData
              }
            } as Request;
          })
        );
        
        setRequests(requestsData);
      } catch (error) {
        console.error('Error fetching requests:', error);
        Alert.alert('Error', 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userData]);

  const handleWithdrawRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'requests', requestId));
      Alert.alert('Success', 'Request withdrawn successfully');
    } catch (error) {
      console.error('Error withdrawing request:', error);
      Alert.alert('Error', 'Failed to withdraw request');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Please sign in to view requests</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        renderItem={({ item }) => (
          <RequestItem
            request={{
              ...item,
              tenant: {
                uid: userData.uid,
                email: userData.email || 'No email provided',  
                displayName: userData.displayName || 'Unknown User',
                role: userData.role || 'tenant'
              }
            }}
            isLandlord={false}
            onWithdraw={
              item.status === 'pending' 
                ? () => handleWithdrawRequest(item.id)
                : undefined
            }
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          requests.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No requests found
            </Text>
          </View>
        }
      />
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#007AFF',
  },
});

export default RequestsScreen;