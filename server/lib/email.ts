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
    console.log(`Content:`);
    console.log(html.replace(/<[^>]*>/g, " ")); // Simple HTML strip for console
    console.log("====================================================");
  }
}

export async function sendNewBookingNotification(adminEmail: string, booking: Booking, customerName: string) {
  const subject = `Booking Baru: ${booking.bookingCode}`;
  const html = `
    <h2>Booking Baru Menunggu Peninjauan</h2>
    <p>Halo Admin,</p>
    <p>Pelanggan <strong>${customerName}</strong> baru saja membuat booking baru.</p>
    <ul>
      <li><strong>Kode Booking:</strong> ${booking.bookingCode}</li>
      <li><strong>Tipe Booking:</strong> ${booking.bookingType}</li>
      <li><strong>Jumlah Peserta:</strong> ${booking.partySizeExpected}</li>
    </ul>
    <p><a href="${process.env.APP_URL || "http://localhost:5000"}/admin/bookings/${booking.id}">Lihat Detail Booking</a></p>
  `;
  await sendEmail({ to: adminEmail, subject, html });
}

export async function sendBookingConfirmedNotification(customerEmail: string, booking: Booking) {
  const subject = `Booking Anda Dikonfirmasi: ${booking.bookingCode}`;
  const html = `
    <h2>Kabar Gembira! Booking Anda Telah Dikonfirmasi</h2>
    <p>Halo,</p>
    <p>Booking Anda dengan kode <strong>${booking.bookingCode}</strong> telah resmi dikonfirmasi oleh tim kami.</p>
    <p>Kami akan segera memproses persiapan tour Anda. Anda dapat memantau status dokumen dan pembayaran melalui portal pelanggan.</p>
    ${booking.joinCode ? `<p><strong>Join Code Grup:</strong> ${booking.joinCode}</p>` : ""}
    <p><a href="${process.env.APP_URL || "http://localhost:5000"}/bookings/${booking.id}">Lihat Status Booking Saya</a></p>
    <p>Terima kasih telah memilih kami sebagai teman perjalanan Anda.</p>
  `;
  await sendEmail({ to: customerEmail, subject, html });
}

export async function sendAssignmentNotification(staffEmail: string, serviceType: string, bookingCode: string, workflowId: string) {
  const subject = `Penugasan Layanan Baru: ${serviceType.toUpperCase()} - ${bookingCode}`;
  const html = `
    <h2>Penugasan Layanan Baru</h2>
    <p>Halo,</p>
    <p>Anda telah ditugaskan untuk menangani layanan <strong>${serviceType}</strong> untuk booking <strong>${bookingCode}</strong>.</p>
    <p>Silakan segera lakukan peninjauan dan perbarui langkah-langkah workflow melalui portal operasional.</p>
    <p><a href="${process.env.APP_URL || "http://localhost:5000"}/admin/workflows/${workflowId}">Buka Detail Penugasan</a></p>
  `;
  await sendEmail({ to: staffEmail, subject, html });
}
