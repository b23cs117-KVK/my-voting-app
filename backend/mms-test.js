const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.MONGOMS_DOWNLOAD_URL = 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-6.0.4.zip'; // optionally override

async function test() {
  console.log('Starting MMS...');
  try {
    const mongoServer = await MongoMemoryServer.create({
      instance: { }
    });
    console.log('Success! URI:', mongoServer.getUri());
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}
test();
