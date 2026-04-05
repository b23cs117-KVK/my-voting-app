async function test() {
  try {
    const resAuth = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: "Admin", email: "admin3@test.com", password: "123" })
    });
    const authData = await resAuth.json();
    const token = authData.token;
    console.log('Registered admin!');

    const resPost = await fetch('http://localhost:5000/api/admin/candidates', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: "John", party: "Party A", description: "Desc", imageUrl: "" })
    });
    console.log('Got response 201:', await resPost.json());

    const resGet = await fetch('http://localhost:5000/api/vote/candidates');
    console.log('Fetched candidates:', await resGet.json());
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
test();
