import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F5F4F0] py-12 px-4">
      <div className="max-w-2xl mx-auto">

        <Link
          href="/auth/register"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B6860] hover:text-[#1C1B19] mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          Kembali
        </Link>

        <div className="bg-white rounded-2xl border border-[#E4E2DC] p-8">

          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1C1B19]">Syarat & Ketentuan</h1>
              <p className="text-xs text-[#9CA3AF]">Terakhir diperbarui: April 2026</p>
            </div>
          </div>

          <div className="flex flex-col gap-6 text-sm text-[#6B6860] leading-relaxed">

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">1. Penerimaan Syarat</h2>
              <p>Dengan mendaftar dan menggunakan layanan LesKas, kamu menyetujui syarat dan ketentuan yang berlaku. Jika tidak setuju, mohon untuk tidak menggunakan layanan ini.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">2. Layanan LesKas</h2>
              <p>LesKas adalah aplikasi SaaS pengelolaan keuangan yang dirancang khusus untuk guru les privat di Indonesia. Layanan mencakup manajemen siswa, jadwal, tagihan, pembayaran, dan laporan keuangan.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">3. Akun Pengguna</h2>
              <p>Kamu bertanggung jawab penuh atas keamanan akun dan kata sandi. LesKas tidak bertanggung jawab atas kerugian akibat akses tidak sah ke akun kamu. Segera hubungi kami jika menemukan aktivitas mencurigakan.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">4. Langganan & Pembayaran</h2>
              <p>LesKas menyediakan tiga paket layanan: Free, Pro (Rp 49.000/bulan), dan Business (Rp 129.000/bulan). Pembayaran dilakukan di muka untuk periode satu bulan. Langganan tidak otomatis diperpanjang — pengguna perlu memperbarui secara manual setiap bulan.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">5. Kebijakan Refund</h2>
              <p>LesKas menerapkan kebijakan tanpa refund. Silakan baca <Link href="/refund" className="text-brand hover:underline">Kebijakan Refund</Link> kami untuk detail lebih lanjut.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">6. Data Pengguna</h2>
              <p>Data siswa, tagihan, dan informasi keuangan yang kamu masukkan adalah milik kamu sepenuhnya. LesKas tidak akan menjual atau membagikan data kamu kepada pihak ketiga tanpa izin. Lihat <Link href="/privacy" className="text-brand hover:underline">Kebijakan Privasi</Link> untuk detail lengkap.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">7. Pembatasan Layanan</h2>
              <p>LesKas berhak menangguhkan atau menghentikan akun yang melanggar syarat ini, termasuk penggunaan untuk tujuan ilegal, spam, atau aktivitas yang merugikan pengguna lain.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">8. Perubahan Syarat</h2>
              <p>LesKas dapat memperbarui syarat ini sewaktu-waktu. Perubahan signifikan akan diberitahukan melalui email. Penggunaan layanan setelah perubahan dianggap sebagai penerimaan syarat baru.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">9. Kontak</h2>
              <p>Pertanyaan mengenai syarat ini dapat disampaikan melalui email ke <span className="text-brand">support@leskas.app</span>.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}