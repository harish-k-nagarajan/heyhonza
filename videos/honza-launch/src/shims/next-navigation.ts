export function usePathname() {
  return "/chat";
}

export function useRouter() {
  return {
    push: () => undefined,
    replace: () => undefined,
    back: () => undefined,
    prefetch: () => undefined,
  };
}

export function useSearchParams() {
  return new URLSearchParams();
}
