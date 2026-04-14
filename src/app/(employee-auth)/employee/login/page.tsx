/**
 * /employee/login — legacy route
 * All users now sign in through the unified Tenants Portal.
 */
import { redirect } from "next/navigation";

export default function EmployeeLoginRedirect() {
  redirect("/corporate/login");
}
