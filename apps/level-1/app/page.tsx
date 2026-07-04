import { HeroSection } from "../components/layout/hero-section";
import { WalletInfo } from "../components/wallet/wallet-info";
import { BalanceDisplay } from "../components/wallet/balance-display";
import { SendPaymentForm } from "../components/payment/send-payment-form";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <section className="py-24 md:py-32">
        <HeroSection />
      </section>

      <section className="pb-24 md:pb-32 space-y-6">
        <WalletInfo />
        <BalanceDisplay />
      </section>

      <section className="pb-24 md:pb-32">
        <SendPaymentForm />
      </section>
    </div>
  );
}
