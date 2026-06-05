import { AlertTriangle, ShieldAlert } from "lucide-react";
import { getRoleLabel, getWriteRolesLabel } from "@/lib/permissions";

/**
 * Banner component that shows when a user has read-only access to a feature.
 * Displays their current role and which roles can perform write actions.
 */
export function PermissionBanner({
  role,
  feature,
  featureLabel,
}: {
  role: string | undefined;
  feature: string;
  featureLabel: string;
}) {
  if (!role) return null;

  const allowedRoles = getWriteRolesLabel(feature);

  return (
    <div className="flex items-start gap-3 p-4 mb-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
      <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
      <div className="text-sm space-y-1">
        <p className="font-semibold text-amber-800 dark:text-amber-300">
          Mode Hanya Lihat (Read-Only)
        </p>
        <p className="text-amber-700 dark:text-amber-400">
          Anda login sebagai <strong>{getRoleLabel(role)}</strong>.{" "}
          Fitur <strong>{featureLabel}</strong> (create/edit/delete) hanya tersedia untuk:{" "}
          <strong>{allowedRoles}</strong>.
        </p>
      </div>
    </div>
  );
}

/**
 * Smaller inline warning used inside specific sections.
 */
export function PermissionInline({
  feature,
  featureLabel,
}: {
  feature: string;
  featureLabel: string;
}) {
  const allowedRoles = getWriteRolesLabel(feature);

  return (
    <p className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
      <AlertTriangle className="h-3.5 w-3.5" />
      <span>
        {featureLabel}: hanya <strong>{allowedRoles}</strong>
      </span>
    </p>
  );
}
