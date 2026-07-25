const { initializeApp, cert } = require('firebase-admin/app');
const { getProjectManagement } = require('firebase-admin/project-management');
const serviceAccount = require('./serviceAccountKey.json');

const app = initializeApp({
  credential: cert(serviceAccount)
});

async function run() {
  try {
    const projectManagement = getProjectManagement(app);
    const webApps = await projectManagement.listWebApps();
    if (webApps.length > 0) {
      console.log('Found Web App:', webApps[0].appId);
      const config = await projectManagement.webApp(webApps[0].appId).getConfig();
      console.log('Web Config:');
      console.log(JSON.stringify(config, null, 2));
    } else {
      console.log('No web apps found. Creating one...');
      const newApp = await projectManagement.createWebApp('my-web-app');
      const config = await projectManagement.webApp(newApp.appId).getConfig();
      console.log('Web Config:');
      console.log(JSON.stringify(config, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
