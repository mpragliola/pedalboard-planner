import { createContext, useContext, type ReactNode } from "react";
import { TemplateService, templateService } from "../lib/template/templateService";

/**
 * Injection point for template lookup policy/service.
 *
 * Why a context instead of direct singleton imports:
 * 1) Components become testable with a fake service implementation.
 * 2) Runtime wiring is explicit at the app boundary.
 * 3) Consumers no longer hard-couple to module-level global state.
 *
 * The default value preserves backward compatibility for callers rendered
 * outside the provider (or during incremental migration).
 */
const TemplateServiceContext = createContext<TemplateService>(templateService);

export function TemplateServiceProvider({
  children,
  value = templateService,
}: {
  children: ReactNode;
  value?: TemplateService;
}) {
  // Most app paths rely on the production singleton.
  // Tests can pass a deterministic service via the optional `value` prop.
  return <TemplateServiceContext.Provider value={value}>{children}</TemplateServiceContext.Provider>;
}

export function useTemplateService(): TemplateService {
  // Single typed access point keeps consumer code clean and consistent.
  return useContext(TemplateServiceContext);
}
