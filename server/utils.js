const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

async function generateCertificate(name) {
  const templatePath = path.join(__dirname, "templates", "certificate.pdf");
  const existingPdfBytes = fs.readFileSync(templatePath);

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  firstPage.drawText(name, { x: 250, y: 300, size: 24, color: rgb(0, 0, 0) });

  const newPdfBytes = await pdfDoc.save();
  const outputPath = path.join(__dirname, "generated", `${name}.pdf`);
  fs.writeFileSync(outputPath, newPdfBytes);

  return outputPath;
}

async function sendEmail(recipient, filePath) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: recipient.email,
    subject: "Your Certificate",
    text: `Hello ${recipient.name},\n\nHere is your certificate.`,
    attachments: [{ filename: "certificate.pdf", path: filePath }],
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { generateCertificate, sendEmail };
