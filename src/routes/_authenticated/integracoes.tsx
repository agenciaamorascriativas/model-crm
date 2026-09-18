import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/integracoes")({
  ssr: false,
  component: Outlet,
});