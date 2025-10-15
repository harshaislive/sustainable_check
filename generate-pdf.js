const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Load the HTML file
  const htmlPath = 'file://' + path.resolve(__dirname, 'public/sustainability-dna-flyer.html');
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });

  // Generate PDF with A4 dimensions
  await page.pdf({
    path: 'public/sustainability-dna-flyer.pdf',
    format: 'A4',
    printBackground: true,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });

  console.log('PDF generated successfully!');
  await browser.close();
})();
