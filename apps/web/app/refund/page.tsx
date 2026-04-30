import Link from "next/link";
import { ArrowLeft, XCircle } from "lucide-react";

export default function RefundPage() {
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
              <h1 className="text-xl font-bold text-[#1C1B19]">Kebijakan Refund</h1>
              <p className="text-xs text-[#9CA3AF]">Terakhir diperbarui: April 2026</p>
            </div>
          </div>

          {/* Banner no refund */}
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
            <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700">
                LesKas tidak menyediakan refund
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Semua pembayaran langganan bersifat final dan tidak dapat dikembalikan.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 text-sm text-[#6B6860] leading-relaxed">

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">Kebijakan Tanpa Refund</h2>
              <p>LesKas menerapkan kebijakan <strong className="text-[#1C1B19]">tanpa pengembalian dana (no refund)</strong> untuk semua jenis pembayaran langganan, termasuk paket Pro dan Business. Hal ini berlaku untuk:</p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
                <li>Pembayaran yang sudah dikonfirmasi</li>
                <li>Langganan yang belum habis masa berlakunya</li>
                <li>Pembatalan akun di tengah periode langganan</li>
                <li>Alasan teknis di luar kendali LesKas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">Mengapa Tidak Ada Refund?</h2>
              <p>LesKas adalah layanan digital yang memberikan akses langsung ke fitur premium begitu pembayaran dikonfirmasi. Biaya operasional (server, pengembangan, dukungan) telah dikeluarkan sejak akses diberikan, sehingga refund tidak dapat kami proses.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">Coba Sebelum Berlangganan</h2>
              <p>Kami menyediakan <strong className="text-[#1C1B19]">paket Free selamanya</strong> yang memungkinkan kamu mencoba fitur dasar LesKas sebelum memutuskan untuk upgrade. Kami sangat menyarankan untuk memanfaatkan paket Free terlebih dahulu untuk memastikan LesKas sesuai dengan kebutuhanmu.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">Pengecualian</h2>
              <p>LesKas hanya akan mempertimbangkan pengembalian dana dalam kondisi berikut:</p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
                <li>Pembayaran ganda untuk periode yang sama (terbukti secara teknis)</li>
                <li>Layanan tidak dapat diakses sama sekali selama lebih dari 7 hari berturut-turut akibat kesalahan di pihak LesKas</li>
              </ul>
              <p className="mt-2">Untuk pengecualian ini, hubungi kami dalam 7 hari sejak kejadian dengan bukti yang relevan.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#1C1B19] mb-2">Kontak</h2>
              <p>
                Pertanyaan mengenai kebijakan ini dapat disampaikan ke{" "}
                <span className="text-brand">support@leskas.app</span>.
              </p>
            </section>

          </div>

          <div className="mt-8 pt-6 border-t border-[#E4E2DC] flex flex-col gap-2">
            <Link href="/terms" className="text-sm text-brand hover:underline">
              Baca Syarat & Ketentuan
            </Link>
            <Link href="/privacy" className="text-sm text-brand hover:underline">
              Baca Kebijakan Privasi
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}