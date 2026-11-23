"use client";

import { useLinkStatus } from "next/link";

export function NavigationPending() {
  const { pending } = useLinkStatus();
  return pending ? <span className="navigation-pending" aria-hidden="true" /> : null;
}
