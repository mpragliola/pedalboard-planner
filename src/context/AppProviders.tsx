import type { ReactNode } from "react";
import { AppProvider } from "./AppContext";
import { ConfirmationProvider } from "./ConfirmationContext";
import { SettingsModalProvider } from "./SettingsModalContext";
import { StorageProvider } from "./StorageContext";
import { CatalogDndProvider } from "../components/catalog/CatalogDndProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <StorageProvider>
      {/* AppProvider depends on StorageProvider for persisted state. */}
      <AppProvider>
        <SettingsModalProvider>
          <ConfirmationProvider>
            {/* CatalogDndProvider depends on AppProvider (useCatalog/useCanvas). */}
            <CatalogDndProvider>{children}</CatalogDndProvider>
          </ConfirmationProvider>
        </SettingsModalProvider>
      </AppProvider>
    </StorageProvider>
  );
}
