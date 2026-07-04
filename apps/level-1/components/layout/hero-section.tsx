import { Heading } from "../ui/heading";
import { Text } from "../ui/text";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-surface-elevated border border-border p-8 md:p-12">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
      <div className="relative space-y-4">
        <Heading as="h1" className="text-gradient max-w-3xl">
          Send XLM. Instantly.
        </Heading>
        <Text variant="body" className="max-w-2xl text-fg-secondary">
          Connect your Freighter wallet and send Stellar Lumens on testnet.
          Powered by the Stellar network — fast, low-cost, global.
        </Text>
      </div>
    </section>
  );
}
