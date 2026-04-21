import nodemailer from "nodemailer";
import { type Booking, type UserProfile, type Tour, type BookingWorkflow } from "@shared/schema";

// Configure SMTP transporter
const transporter = process.env.SMTP_HOST ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}) : null;

// Helper function to provide a premium HTML layout
function getPremiumLayout(title: string, content: string) {
  const primaryColor = "#116bb0";
  const appUrl = process.env.APP_URL || "http://localhost:5000";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f9; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background-color: ${primaryColor}; color: #ffffff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px; }
    .content { padding: 40px; }
    .content h2 { color: ${primaryColor}; margin-top: 0; font-size: 20px; }
    .info-box { background-color: #f8fafc; border-left: 4px solid ${primaryColor}; padding: 20px; margin: 20px 0; border-radius: 0 4px 4px 0; }
    .info-box ul { list-style: none; padding: 0; margin: 0; }
    .info-box li { margin-bottom: 8px; font-size: 14px; }
    .info-box li strong { color: #555; width: 120px; display: inline-block; }
    .button { display: inline-block; background-color: ${primaryColor}; color: #ffffff !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; text-transform: uppercase; font-size: 14px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #888; background-color: #f8fafc; border-top: 1px solid #eee; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .status-approved { background-color: #dcfce7; color: #15803d; }
    .status-rejected { background-color: #fee2e2; color: #b91c1c; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TourOps</h1>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} TourOps Software. All rights reserved.</p>
      <p>Ini adalah email otomatis, mohon tidak membalas langsung ke email ini.</p>
    </div>
  </div>
</body>
</html>
  `;
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || "TourOps"}" <${process.env.SMTP_FROM_EMAIL || "no-reply@tourops.com"}>`,
        to,
        subject,
        html,
      });
      console.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
    }
  } else {
    // Development fallback: Log email content to console
    console.log("====================================================");
    console.log(`[DEV MODE] EMAIL NOTIFICATION`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`----------------------------------------------------`);
    // More visible "Premium" structure in console
    console.log(html); 
    console.log("====================================================");
  }
}

export async function sendNewBookingNotification(adminEmail: string, booking: Booking, customerName: string) {
  const content = `
    <p>Halo Admin,</p>
    <p>Ada pesanan tour baru yang masuk dan memerlukan peninjauan Anda.</p>
    <div class="info-box">
      <ul>
        <li><strong>Kode Booking:</strong> ${booking.bookingCode}</li>
        <li><strong>Customer:</strong> ${customerName}</li>
        <li><strong>Tipe Booking:</strong> ${booking.bookingType.replace(/_/g, ' ').toUpperCase()}</li>
        <li><strong>Jumlah Pax:</strong> ${booking.partySizeExpected}</li>
      </ul>
    </div>
    <a href="${process.env.APP_URL || "http://localhost:5000"}/admin/bookings/${booking.id}" class="button">Lihat Detail Booking</a>
  `;
  await sendEmail({ 
    to: adminEmail, 
    subject: `[Booking Baru] ${booking.bookingCode} - ${customerName}`, 
    html: getPremiumLayout("Booking Baru Menunggu Peninjauan", content) 
  });
}

export async function sendBookingConfirmedNotification(customerEmail: string, booking: Booking) {
  const content = `
    <p>Halo,</p>
    <p>Kabar gembira! Pesanan tour Anda telah resmi <strong>Dikonfirmasi</strong>.</p>
    <p>Tim operasional kami sedang mempersiapkan segala kebutuhan perjalanan Anda. Anda sekarang dapat mulai melengkapi dokumen yang diperlukan di portal customer.</p>
    <div class="info-box">
      <ul>
        <li><strong>Kode Booking:</strong> ${booking.bookingCode}</li>
        ${booking.joinCode ? `<li><strong>Join Code Grup:</strong> <span style="font-family: monospace; font-weight: bold; font-size: 18px; color: #116bb0;">${booking.joinCode}</span></li>` : ""}
      </ul>
    </div>
    <a href="${process.env.APP_URL || "http://localhost:5000"}/my-bookings/${booking.id}" class="button">Buka Portal Customer</a>
    <p style="margin-top: 20px; font-size: 13px; color: #666;">Gunakan Join Code di atas jika rekan Anda ingin bergabung ke dalam grup yang sama.</p>
  `;
  await sendEmail({ 
    to: customerEmail, 
    subject: `✈️ Booking Dikonfirmasi: ${booking.bookingCode}`, 
    html: getPremiumLayout("Booking Anda Telah Dikonfirmasi!", content) 
  });
}

export async function sendAssignmentNotification(staffEmail: string, serviceType: string, bookingCode: string, workflowId: string) {
  const content = `
    <p>Halo,</p>
    <p>Anda telah ditugaskan untuk menangani komponen layanan berikut:</p>
    <div class="info-box">
      <ul>
        <li><strong>Layanan:</strong> ${serviceType.toUpperCase()}</li>
        <li><strong>Kode Booking:</strong> ${bookingCode}</li>
        <li><strong>Prioritas:</strong> Normal</li>
      </ul>
    </div>
    <p>Mohon segera lakukan peninjauan dan update langkah-langkah workflow sesuai progress di lapangan.</p>
    <a href="${process.env.APP_URL || "http://localhost:5000"}/admin/workflows/${workflowId}" class="button">Proses Penugasan</a>
  `;
  await sendEmail({ 
    to: staffEmail, 
    subject: `📋 Penugasan: ${serviceType.toUpperCase()} (${bookingCode})`, 
    html: getPremiumLayout("Penugasan Layanan Baru", content) 
  });
}

export async function sendDocumentStatusNotification(customerEmail: string, bookingCode: string, docType: string, status: string, notes?: string) {
  const isApproved = status === "approved";
  const content = `
    <p>Halo,</p>
    <p>Kami telah meninjau dokumen yang Anda unggah untuk booking <strong>${bookingCode}</strong>.</p>
    <div class="info-box">
      <ul>
        <li><strong>Dokumen:</strong> ${docType.replace(/_/g, ' ').toUpperCase()}</li>
        <li><strong>Status:</strong> <span class="status-badge ${isApproved ? 'status-approved' : 'status-rejected'}">${status}</span></li>
      </ul>
    </div>
    ${notes ? `<p><strong>Catatan dari Admin:</strong><br><span style="font-style: italic; color: #666;">"${notes}"</span></p>` : ""}
    ${!isApproved ? `<p>Mohon segera unggah kembali dokumen yang benar melalui portal customer agar proses booking tidak terhambat.</p>` : ""}
    <a href="${process.env.APP_URL || "http://localhost:5000"}/my-bookings" class="button">Buka Portal Customer</a>
  `;
  await sendEmail({ 
    to: customerEmail, 
    subject: `${isApproved ? '✅' : '❌'} Update Dokumen: ${docType.toUpperCase()} (${bookingCode})`, 
    html: getPremiumLayout("Pembaruan Status Dokumen", content) 
  });
}

export async function sendPaymentStatusNotification(customerEmail: string, bookingCode: string, amount: string, currency: string) {
  const content = `
    <p>Halo,</p>
    <p>Kami telah menerima dan mengonfirmasi pembayaran Anda untuk booking <strong>${bookingCode}</strong>.</p>
    <div class="info-box">
      <ul>
        <li><strong>Jumlah:</strong> ${currency} ${amount}</li>
        <li><strong>Status:</strong> <span class="status-badge status-approved">LUNAS / PAID</span></li>
      </ul>
    </div>
    <p>Kini Anda dapat mengunduh tanda terima resmi (receipt) melalui portal customer.</p>
    <a href="${process.env.APP_URL || "http://localhost:5000"}/my-bookings" class="button">Lihat Detail Pembayaran</a>
  `;
  await sendEmail({ 
    to: customerEmail, 
    subject: `💰 Pembayaran Diterima: ${bookingCode}`, 
    html: getPremiumLayout("Konfirmasi Pembayaran Diterima", content) 
  });
}
