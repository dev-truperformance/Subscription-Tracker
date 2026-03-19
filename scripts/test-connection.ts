import postgres from 'postgres';

async function testConnection() {
  try {
    const connectionString = process.env.DATABASE_URL;
    console.log('Testing connection with:', connectionString?.replace(/:[^:]*@/, ':***@')); // Hide password
    
    const client = postgres(connectionString);
    const result = await client`SELECT version()`;
    console.log('✅ Database connected successfully!');
    console.log('PostgreSQL version:', result[0].version);
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
