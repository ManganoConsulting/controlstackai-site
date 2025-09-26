import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
import { API_BASE, SERVICE_TOKEN } from './config';

export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submitLead = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/leads`, {
        method: 'POST',
        headers: { 'content-type':'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      if (!res.ok) throw new Error(await res.text());
      Alert.alert('Thanks!', 'We will reach out shortly.');
      setName(''); setEmail(''); setMessage('');
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  const listLeads = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/leads`, {
        headers: SERVICE_TOKEN ? { 'x-service-token': SERVICE_TOKEN } : undefined
      });
      const rows = await res.json();
      Alert.alert('Leads', JSON.stringify(rows.slice(0,5), null, 2));
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:'#0B1020' }}>
      <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
        <Text style={{ fontSize:28, fontWeight:'700', color:'#E6F0FF' }}>ControlStackAI</Text>
        <Text style={{ color:'#9BB0C9' }}>Send a message and optionally list recent leads.</Text>

        <View style={{ gap:8 }}>
          <Text style={{ color:'#E6F0FF' }}>Name</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Your name" placeholderTextColor="#6C7B93" />
        </View>
        <View style={{ gap:8 }}>
          <Text style={{ color:'#E6F0FF' }}>Email</Text>
          <TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="you@example.com" placeholderTextColor="#6C7B93" keyboardType="email-address" autoCapitalize="none" />
        </View>
        <View style={{ gap:8 }}>
          <Text style={{ color:'#E6F0FF' }}>Message</Text>
          <TextInput value={message} onChangeText={setMessage} style={[styles.input,{height:120}]} placeholder="How can we help?" placeholderTextColor="#6C7B93" multiline />
        </View>

        <Button title="Send" onPress={submitLead} />
        <View style={{ height:12 }} />
        <Button title="List recent leads (requires SERVICE_TOKEN)" onPress={listLeads} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  input: {
    backgroundColor:'#0D1627', borderColor:'rgba(255,255,255,0.12)', borderWidth:1,
    color:'#E6F0FF', padding:12, borderRadius:12
  }
};
