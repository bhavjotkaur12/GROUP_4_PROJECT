import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  Button,
} from 'react-native';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useAuth } from '../../context/AuthContext';
import PropertyCard from '../../components/PropertyCard';

interface Property {
  id: string;
  shortlistId: string;
  title: string;
  description: string;
  price: number;
  address: string;
  images: string[];
  features: string[];
  isListed: boolean;
  landlordId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShortlistScreen = ({ navigation }: { navigation: any }) => {
  const [shortlistedProperties, setShortlistedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();

  const fetchShortlistedProperties = async () => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }

    try {
      const shortlistQuery = query(
        collection(db, 'shortlists'),
        where('tenantId', '==', userData.uid)
      );
      const shortlistSnapshot = await getDocs(shortlistQuery);
      
      const properties = await Promise.all(
        shortlistSnapshot.docs.map(async (shortlistDoc) => {
          const propertyDocRef = doc(db, 'properties', shortlistDoc.data().propertyId);
          const propertyDoc = await getDoc(propertyDocRef);
          const propertyData = propertyDoc.data();
          
          if (!propertyDoc.exists() || !propertyData) {
            return null;
          }

          return {
            shortlistId: shortlistDoc.id,
            ...propertyData,
            id: propertyDoc.id,
            createdAt: propertyData.createdAt?.toDate() || new Date(),
            updatedAt: propertyData.updatedAt?.toDate() || new Date(),
          } as Property;
        })
      );

     
      setShortlistedProperties(properties.filter(Boolean) as Property[]);
    } catch (error) {
      console.error('Error fetching shortlisted properties:', error);
      Alert.alert('Error', 'Failed to load shortlisted properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlistedProperties();
  }, [userData]);

  const handleRemoveFromShortlist = async (shortlistId: string) => {
    try {
      await deleteDoc(doc(db, 'shortlists', shortlistId));
      setShortlistedProperties(prev => 
        prev.filter(prop => prop.shortlistId !== shortlistId)
      );
      Alert.alert('Success', 'Property removed from shortlist');
    } catch (error) {
      console.error('Error removing from shortlist:', error);
      Alert.alert('Error', 'Failed to remove property from shortlist');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading shortlisted properties...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button 
        title="Refresh List"
        onPress={() => fetchShortlistedProperties()}
      />
      <FlatList
        data={shortlistedProperties}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
            onRequestsPress={() => {}}
            isLandlord={false}
            onRemoveFromShortlist={handleRemoveFromShortlist}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          shortlistedProperties.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No shortlisted properties
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

export default ShortlistScreen;