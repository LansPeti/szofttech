const http = require('http');

async function runTest() {
  const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
  
  try {
    console.log('1. Registering user...');
    const registerRes = await global.fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'finaltest', email: 'finaltest@test.com', password: 'password123' })
    });
    const user = await registerRes.json();
    console.log('Register response:', user);
    
    if (!user.token) {
        console.error('No token received');
        const loginRes = await global.fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'finaltest', password: 'password123' })
        });
        const loginData = await loginRes.json();
        user.token = loginData.token;
        console.log('Login response:', loginData);
    }
    const token = user.token;

    console.log('\n2. Testing Settings GET...');
    const settingsGet = await global.fetch('http://localhost:5000/api/settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Settings GET status:', settingsGet.status);
    console.log('Settings GET body:', await settingsGet.json());

    console.log('\n3. Testing Settings PUT...');
    const settingsPut = await global.fetch('http://localhost:5000/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ language: 'english' })
    });
    console.log('Settings PUT status:', settingsPut.status);
    console.log('Settings PUT body:', await settingsPut.json());

    console.log('\n4. Testing Event POST (Should succeed despite missing time)...');
    const eventPost = await global.fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: 'Test Event', start: '2026-04-15' })
    });
    const newEvent = await eventPost.json();
    console.log('Event POST status:', eventPost.status);
    console.log('Event POST body:', newEvent);

    console.log('\n5. Testing Event PUT...');
    const eventPut = await global.fetch(`http://localhost:5000/api/events/${newEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: 'Updated Event', start: '2026-04-16T10:00', end: '2026-04-16T11:00' })
    });
    console.log('Event PUT status:', eventPut.status);
    console.log('Event PUT body:', await eventPut.json());

    console.log('\n6. Testing Event DELETE...');
    const eventDelete = await global.fetch(`http://localhost:5000/api/events/${newEvent.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Event DELETE status:', eventDelete.status);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();
