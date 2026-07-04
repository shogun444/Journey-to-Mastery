import { Text } from "../ui/text";

export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Text variant="caption">
            Built on Stellar testnet
          </Text>
          <Text variant="caption" as="span">
            Stellar Pay &copy; {new Date().getFullYear()}
          </Text>
        </div>
      </div>
    </footer>
  );
}
