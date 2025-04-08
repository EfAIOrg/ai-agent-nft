const ZapClient = require('owasp-zap-api');
const config = require('../../config/config');


async function runSecurityScan() {
  try {
    console.log('Starting ZAP security scan...');
    
    const zapOptions = {
      apiKey: process.env.ZAP_API_KEY,
      proxy: {
        host: process.env.ZAP_HOST || 'localhost',
        port: process.env.ZAP_PORT || 8080
      }
    };
    
    const zaproxy = new ZapClient(zapOptions);
    
    await zaproxy.core.newSession('devin-ai-scan', true);
    
    console.log(`Accessing target: ${config.apiUrl}`);
    const resp = await zaproxy.core.accessUrl(config.apiUrl);
    console.log('Access response:', resp);
    
    console.log('Starting spider scan...');
    const scanId = await zaproxy.spider.scan(config.apiUrl);
    
    let status;
    do {
      await new Promise(resolve => setTimeout(resolve, 5000));
      status = await zaproxy.spider.status(scanId);
      console.log(`Spider progress: ${status}%`);
    } while (status < 100);
    
    console.log('Starting active scan...');
    const activeScanId = await zaproxy.ascan.scan(config.apiUrl);
    
    let activeScanStatus;
    do {
      await new Promise(resolve => setTimeout(resolve, 5000));
      activeScanStatus = await zaproxy.ascan.status(activeScanId);
      console.log(`Active scan progress: ${activeScanStatus}%`);
    } while (activeScanStatus < 100);
    
    console.log('Retrieving alerts...');
    const alerts = await zaproxy.core.alerts(config.apiUrl);
    
    console.log('Generating report...');
    const report = await zaproxy.core.htmlreport();
    require('fs').writeFileSync('reports/security-scan-report.html', report);
    
    console.log('Scan completed. Alert summary:');
    const alertsBySeverity = {
      High: 0,
      Medium: 0,
      Low: 0,
      Informational: 0
    };
    
    for (const alert of alerts) {
      alertsBySeverity[alert.risk]++;
    }
    
    console.log('Alerts by severity:');
    console.log(alertsBySeverity);
    
    return {
      success: true,
      alerts,
      alertsBySeverity
    };
  } catch (error) {
    console.error('Error during security scan:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

if (require.main === module) {
  runSecurityScan().then(result => {
    if (result.success) {
      console.log('Security scan completed successfully.');
      process.exit(0);
    } else {
      console.error('Security scan failed:', result.error);
      process.exit(1);
    }
  });
}

module.exports = runSecurityScan;
