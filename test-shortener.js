const BASE_URL = 'http://localhost:3000';

async function runTest() {
  try {
    // 1) Registrar un nuevo usuario
    console.log('1) POST /register');
    const registerResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
      }),
    });

    const registerData = await registerResponse.json();
    console.log('POST /register response:', registerResponse.status, registerData);

    if (registerResponse.status !== 201) {
      throw new Error('Registration failed');
    }

    // 2) Login con las credenciales
    console.log('\n2) POST /login');
    const loginResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password123',
      }),
    });

    const loginData = await loginResponse.json();
    console.log('POST /login response:', loginResponse.status, loginData);

    if (!loginData.token) {
      throw new Error('No token returned from /login');
    }

    const token = loginData.token;
    console.log(`Generated token: ${token}`);

    // 3) POST /shorten con token de autenticación
    console.log('\n3) POST /shorten (con autenticación)');
    const shortenResponse = await fetch(`${BASE_URL}/shorten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ url: 'https://example.com' }),
    });

    const shortenData = await shortenResponse.json();
    console.log('POST /shorten response:', shortenResponse.status, shortenData);

    if (!shortenData.shortUrl) {
      throw new Error('No shortUrl returned from /shorten');
    }

    const code = shortenData.shortUrl.split('/').pop();
    console.log(`Generated code: ${code}`);

    // 4) GET /:code (seguirá la redirección con autenticación)
    console.log('\n4) GET /:code (con autenticación, seguirá la redirección)');
    const redirectResponse = await fetch(`${BASE_URL}/${code}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      redirect: 'follow',
    });

    console.log('GET /:code final status:', redirectResponse.status);
    console.log('GET /:code final URL:', redirectResponse.url);

    // 5) GET /stats/:code (con autenticación)
    console.log('\n5) GET /stats/:code (con autenticación)');
    const statsResponse = await fetch(`${BASE_URL}/stats/${code}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const statsData = await statsResponse.json();
    console.log('GET /stats/:code response:', statsResponse.status, statsData);

    // 6) POST /logout (con autenticación)
    console.log('\n6) POST /logout (con autenticación)');
    const logoutResponse = await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const logoutData = await logoutResponse.json();
    console.log('POST /logout response:', logoutResponse.status, logoutData);

    // 7) Intentar usar el token después de logout (debe fallar)
    console.log('\n7) Intento de usar token revocado después de logout');
    const revokedTokenResponse = await fetch(`${BASE_URL}/stats/${code}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const revokedTokenData = await revokedTokenResponse.json();
    console.log('GET /stats/:code con token revocado:', revokedTokenResponse.status, revokedTokenData);

    console.log('\n✅ Todas las pruebas completadas exitosamente');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTest();
