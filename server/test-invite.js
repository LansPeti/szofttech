

async function run() {
    // 1. Get token by logging in as finaltest
    const loginRes = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'finaltest', password: 'password123' })
    });
    const user = await loginRes.json();
    console.log('Login:', user.token);

    // 2. Try POST /invite with dummy token
    const inviteRes = await fetch('http://localhost:5000/api/sharing/invite', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + user.token 
        },
        body: JSON.stringify({ inviteToken: 'test-token-123' })
    });
    console.log('Status:', inviteRes.status);
    console.log('Body:', await inviteRes.text());
}
run();
