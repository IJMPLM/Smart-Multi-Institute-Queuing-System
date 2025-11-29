const { spawn } = require('child_process');
const { execSync } = require('child_process');
const IP = `172.20.31.62`

// Determine if we're running in production mode
const isProduction = process.argv.includes('--production') || process.env.NODE_ENV === 'production';
const mode = isProduction ? 'PRODUCTION' : 'DEVELOPMENT';

console.log(`🚀 Starting Smart Multi-Institute Queuing System in ${mode} mode...`);

// Stop any existing servers first
console.log('🛑 Stopping any existing servers...');
try {
  execSync('node scripts/server-stop.js', { stdio: 'inherit' });
} catch (error) {
  console.log('ℹ️  No existing servers to stop or stop script failed.');
}

console.log('⏳ Waiting 2 seconds before starting new servers...');
setTimeout(() => {
  startServers();
}, 2000);

function startServers() {
  // Build all apps in production mode first
  if (isProduction) {
    console.log('🔨 Building all applications for production...');
    try {
      console.log('   - Building backend...');
      execSync('npm run build', { cwd: './backend', stdio: 'inherit' });
      
      console.log('   - Building frontend applications...');
      execSync('npm run build:server', { cwd: './frontend', stdio: 'inherit' });
      execSync('npm run build:applicant', { cwd: './frontend', stdio: 'inherit' });
      execSync('npm run build:counter', { cwd: './frontend', stdio: 'inherit' });
      
      console.log('✅ All applications built successfully!');
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  }

// Start backend server
console.log(`📡 Starting backend server in ${mode} mode...`);
const backendCommand = isProduction ? 'start' : 'dev';
const backend = spawn('npm', ['run', backendCommand], {
  cwd: './backend',
  stdio: 'inherit',
  shell: true
});

// Start all frontend servers
console.log(`🌐 Starting all frontend servers in ${mode} mode...`);
console.log('  - Server Admin Frontend (Port 3000)');
console.log('  - Applicant Portal (Port 3001)');
console.log('  - Counter Dashboard (Port 3002)');

const frontendCommand = isProduction ? 'start' : 'dev';

const frontendServer = spawn('npm', ['run', `${frontendCommand}:server`], {
  cwd: './frontend',
  stdio: 'inherit', 
  shell: true
});

const frontendApplicant = spawn('npm', ['run', `${frontendCommand}:applicant`], {
  cwd: './frontend',
  stdio: 'inherit', 
  shell: true
});

const frontendCounter = spawn('npm', ['run', `${frontendCommand}:counter`], {
  cwd: './frontend',
  stdio: 'inherit', 
  shell: true
});

// Wait a bit for servers to start then open browser (only in development)
if (!isProduction) {
  setTimeout(async () => {
    try {
      console.log('🌐 Opening server admin frontend in browser...');
      console.log('📝 Other frontends available at:');
      console.log('   - Applicant Portal: http://localhost:3001');
      console.log('   - Counter Dashboard: http://localhost:3002');
      const { default: open } = await import('open');
      await open(`http://${IP}:3000`);
    } catch (error) {
      console.log('Could not auto-open browser. Please manually open: http://localhost:3000');
      console.log('Other frontends available at:');
      console.log('   - Applicant Portal: http://localhost:3001');
      console.log('   - Counter Dashboard: http://localhost:3002');
      console.log('Error:', error.message);
    }
  }, 10000); // Increased timeout to 10 seconds for all servers
} else {
  console.log('🚀 Production servers started successfully!');
  console.log('📝 Frontends available at:');
  console.log('   - Server Admin: http://localhost:3000');
  console.log('   - Applicant Portal: http://localhost:3001');
  console.log('   - Counter Dashboard: http://localhost:3002');
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down all servers...');
  backend.kill('SIGINT');
  frontendServer.kill('SIGINT');
  frontendApplicant.kill('SIGINT');
  frontendCounter.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down all servers...');
  backend.kill('SIGTERM');
  frontendServer.kill('SIGTERM');
  frontendApplicant.kill('SIGTERM');
  frontendCounter.kill('SIGTERM');
  process.exit(0);
});
}